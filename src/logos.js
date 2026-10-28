const FONT = require('./font.js');

const PI = Math.PI;
const circ = (cx, cy, r, n = 32, a0 = 0) => Array.from({ length: n }, (_, i) => { const a = a0 + 2 * PI * i / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
const ell = (cx, cy, rx, ry, n = 24, a0 = 0, a1 = 2 * PI) => { const full = Math.abs(a1 - a0 - 2 * PI) < 1e-9; const m = full ? n : n + 1; return Array.from({ length: m }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; }); };
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const rrect = (x0, y0, x1, y1, r, n = 4) => {
  const out = [];
  const cs = [[x1 - r, y0 + r, -PI / 2], [x1 - r, y1 - r, 0], [x0 + r, y1 - r, PI / 2], [x0 + r, y0 + r, PI]];
  for (const [cx, cy, a] of cs) for (let i = 0; i <= n; i++) { const t = a + (PI / 2) * i / n; out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
  return out;
};
const star = (cx, cy, r, ri, rot = PI / 2) => Array.from({ length: 10 }, (_, i) => { const a = rot + PI * i / 5; const q = i % 2 ? ri : r; return [cx + q * Math.cos(a), cy + q * Math.sin(a)]; });
const rot = (pts, cx, cy, a) => pts.map(([x, y]) => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)]);
const thick = (a, b, t) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-9, ux = dx / L * t / 2, uy = dy / L * t / 2;
  return [[a[0] - ux + uy, a[1] - uy - ux], [b[0] + ux + uy, b[1] + uy - ux], [b[0] + ux - uy, b[1] + uy + ux], [a[0] - ux - uy, a[1] - uy + ux]];
};
const polyline = (pts, t) => { const out = []; for (let i = 0; i < pts.length - 1; i++) out.push(thick(pts[i], pts[i + 1], t)); return out; };
const strokePoly = (Pin, t) => {
  const Pp = [];
  for (const q of Pin) if (!Pp.length || Math.hypot(q[0] - Pp[Pp.length - 1][0], q[1] - Pp[Pp.length - 1][1]) > 1e-9) Pp.push(q);
  if (Pp.length < 2) return [thick(Pin[0], [Pin[0][0] + 1e-3, Pin[0][1]], t)];
  const closed = Pp.length > 3 && Math.hypot(Pp[0][0] - Pp[Pp.length - 1][0], Pp[0][1] - Pp[Pp.length - 1][1]) < 1e-6;
  const n = Pp.length, h = t / 2, dir = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [dx / L, dy / L]; };
  const Lf = [], Rt = [];
  const join = (p, d1, d2) => {
    const n1 = [-d1[1], d1[0]], n2 = [-d2[1], d2[0]], m = [n1[0] + n2[0], n1[1] + n2[1]], ml = Math.hypot(m[0], m[1]);
    if (ml < 1e-6) return;
    const mu = [m[0] / ml, m[1] / ml], k = h / (mu[0] * n1[0] + mu[1] * n1[1]);
    if (k > 2.2 * h) { Lf.push([p[0] + n1[0] * h, p[1] + n1[1] * h], [p[0] + n2[0] * h, p[1] + n2[1] * h]); Rt.push([p[0] - n1[0] * h, p[1] - n1[1] * h], [p[0] - n2[0] * h, p[1] - n2[1] * h]); }
    else { Lf.push([p[0] + mu[0] * k, p[1] + mu[1] * k]); Rt.push([p[0] - mu[0] * k, p[1] - mu[1] * k]); }
  };
  if (closed) {
    for (let i = 0; i < n - 1; i++) join(Pp[i], dir(Pp[(i - 1 + n - 1) % (n - 1)], Pp[i]), dir(Pp[i], Pp[i + 1]));
    Lf.push(Lf[0]); Rt.push(Rt[0]);
  } else {
    const d0 = dir(Pp[0], Pp[1]), dn = dir(Pp[n - 2], Pp[n - 1]);
    Lf.push([Pp[0][0] - d0[0] * h - d0[1] * h, Pp[0][1] - d0[1] * h + d0[0] * h]); Rt.push([Pp[0][0] - d0[0] * h + d0[1] * h, Pp[0][1] - d0[1] * h - d0[0] * h]);
    for (let i = 1; i < n - 1; i++) join(Pp[i], dir(Pp[i - 1], Pp[i]), dir(Pp[i], Pp[i + 1]));
    Lf.push([Pp[n - 1][0] + dn[0] * h - dn[1] * h, Pp[n - 1][1] + dn[1] * h + dn[0] * h]); Rt.push([Pp[n - 1][0] + dn[0] * h + dn[1] * h, Pp[n - 1][1] + dn[1] * h - dn[0] * h]);
  }
  return [Lf.concat(Rt.reverse())];
};

const glyphW = (ch, t) => (ch === ' ' ? 2.6 : 4) + t;
const textWidth = (str, h, t = 1.1, gap = 0.9) => { const s = h / 6; let w = 0; for (const ch of str) w += (glyphW(ch, t) + gap) * s; return w - gap * s; };
const text = (str, x, y, h, col, o = {}) => {
  const t = o.t || 1.1, gap = o.gap === undefined ? 0.9 : o.gap, s = h / 6, W = textWidth(str, h, t, gap);
  let cx = o.align === 'c' ? x - W / 2 : o.align === 'r' ? x - W : x;
  const out = [];
  for (const ch of str.toUpperCase()) {
    const g = FONT.G[ch];
    if (g === undefined) throw 'logo glyph ' + ch;
    for (const st of g) {
      const P = st.map(([gx, gy]) => [cx + (gx + t / 2) * s, y + gy * s]);
      for (const q of strokePoly(P, t * s)) out.push({ pts: q, col });
    }
    cx += (glyphW(ch, t) + gap) * s;
  }
  return o.rot ? out.map((p) => ({ pts: rot(p.pts, o.rx, o.ry, o.rot), col })) : out;
};
const arcText = (str, cx, cy, R, h, col, bottom, o = {}) => {
  const t = o.t || 1.0, gap = o.gap === undefined ? 0.9 : o.gap, s = h / 6, W = textWidth(str, h, t, gap);
  const out = [];
  let pos = -W / 2;
  for (const ch of str.toUpperCase()) {
    const gw = glyphW(ch, t) * s, mid = pos + gw / 2, th = bottom ? -PI / 2 + mid / R : PI / 2 - mid / R;
    const rad = [Math.cos(th), Math.sin(th)];
    const up = bottom ? [-rad[0], -rad[1]] : rad, right = bottom ? [-Math.sin(th), Math.cos(th)] : [Math.sin(th), -Math.cos(th)];
    const g = FONT.G[ch];
    for (const st of g) {
      const P = st.map(([gx, gy]) => { const lx = (gx + t / 2) * s - gw / 2, ly = (gy - 3) * s; return [cx + rad[0] * R + up[0] * ly + right[0] * lx, cy + rad[1] * R + up[1] * ly + right[1] * lx]; });
      for (const q of strokePoly(P, t * s)) out.push({ pts: q, col });
    }
    pos += (glyphW(ch, t) + gap) * s;
  }
  return out;
};
const P = (pts, col) => ({ pts, col });

const C = {
  white: [250, 250, 248], cream: [246, 238, 222], black: [28, 28, 30],
  chip: [150, 26, 20], sbux: [0, 112, 74], dunkO: [255, 103, 31], dunkP: [218, 24, 132], mcR: [218, 41, 28], mcY: [255, 199, 44],
  cvs: [204, 0, 0], bkBun: [242, 142, 44], bkRed: [214, 35, 0], sevO: [247, 129, 36], sevG: [0, 129, 99], sevR: [238, 37, 38],
  wen: [226, 24, 54], chase: [17, 122, 202], wfR: [215, 30, 40], wfY: [255, 205, 65], citiB: [0, 59, 112], citiR: [227, 24, 55],
  hd: [249, 99, 2], lidlB: [0, 80, 170], lidlY: [255, 236, 0], lidlR: [230, 10, 20], att: [0, 159, 219], shY: [255, 213, 0], shR: [221, 29, 33],
  bpG: [0, 155, 58], bpL: [140, 198, 63], bpY: [255, 230, 0], domR: [227, 24, 55], domB: [0, 100, 145], pan: [80, 104, 52], mar: [24, 32, 72],
  hg: [176, 24, 48], tes: [232, 33, 39], nisG: [176, 180, 186], ups: [76, 48, 30], upsY: [255, 181, 0], swB: [0, 61, 121], swR: [210, 32, 39],
  fr: [200, 16, 46], ps: [247, 140, 30], bw: [0, 51, 153], bwY: [255, 204, 0], days: [0, 84, 164], dayY: [255, 196, 0], navy: [20, 40, 86],
  rm: [220, 40, 50], grey: [70, 72, 78],
};

const L = {};
L.chipotle = () => {
  const o = [];
  o.push(P(circ(0.5, 0.5, 0.5, 40), C.chip), P(circ(0.5, 0.5, 0.46, 40), C.cream), P(circ(0.5, 0.5, 0.44, 40), C.chip));
  o.push(...arcText('CHIPOTLE', 0.5, 0.5, 0.345, 0.1, C.cream, false, { t: 1.3, gap: 0.7 }));
  o.push(...arcText('MEXICAN GRILL', 0.5, 0.5, 0.36, 0.068, C.cream, true, { t: 1.3, gap: 0.6 }));
  const up = [], lo = [];
  for (let i = 0; i <= 14; i++) { const t = i / 14, x = 0.31 + 0.4 * t, y = 0.47 + 0.075 * Math.sin(PI * t * 0.9) - 0.09 * t * t, w = 0.075 * Math.pow(1 - t, 0.7) + 0.004; up.push([x, y + w]); lo.push([x, y - w]); }
  o.push(P(up.concat(lo.reverse()), C.cream));
  o.push(P(thick([0.325, 0.52], [0.285, 0.6], 0.035), C.cream), P(thick([0.27, 0.59], [0.31, 0.615], 0.03), C.cream));
  o.push(...text('CHIPOTLE', 1.16, 0.3, 0.4, C.chip, { t: 1.25 }));
  return { w: 1.16 + textWidth('CHIPOTLE', 0.4, 1.25) + 0.02, polys: o };
};
L.starbucks = () => {
  const o = [];
  o.push(P(circ(0.5, 0.5, 0.5, 40), C.sbux), P(circ(0.5, 0.5, 0.485, 40), C.white), P(circ(0.5, 0.5, 0.47, 40), C.sbux));
  o.push(...arcText('STARBUCKS', 0.5, 0.5, 0.385, 0.11, C.white, false, { t: 1.3 }));
  o.push(...arcText('COFFEE', 0.5, 0.5, 0.385, 0.11, C.white, true, { t: 1.3 }));
  o.push(P(star(0.11, 0.5, 0.045, 0.02), C.white), P(star(0.89, 0.5, 0.045, 0.02), C.white));
  o.push(P(circ(0.5, 0.5, 0.3, 36), C.white), P(circ(0.5, 0.5, 0.285, 36), C.sbux));
  const hair = [[0.36, 0.62], [0.33, 0.5], [0.35, 0.38], [0.31, 0.3], [0.37, 0.25], [0.44, 0.33], [0.44, 0.5], [0.42, 0.62]];
  o.push(P(hair, C.white), P(hair.map(([x, y]) => [1 - x, y]), C.white));
  o.push(P([[0.25, 0.32], [0.22, 0.48], [0.27, 0.62], [0.31, 0.6], [0.27, 0.48], [0.29, 0.34]], C.white));
  o.push(P([[0.75, 0.32], [0.78, 0.48], [0.73, 0.62], [0.69, 0.6], [0.73, 0.48], [0.71, 0.34]], C.white));
  o.push(P(ell(0.5, 0.5, 0.075, 0.095, 20), C.white));
  o.push(P([[0.4, 0.62], [0.43, 0.7], [0.47, 0.66], [0.5, 0.74], [0.53, 0.66], [0.57, 0.7], [0.6, 0.62]], C.white));
  o.push(P(star(0.5, 0.735, 0.035, 0.015), C.sbux));
  o.push(P(rect(0.47, 0.49, 0.48, 0.52), C.sbux), P(rect(0.52, 0.49, 0.53, 0.52), C.sbux), P(rect(0.48, 0.44, 0.52, 0.452), C.sbux));
  return { w: 1, polys: o };
};
L.dunkin = () => {
  const W = textWidth("DUNKIN'", 0.62, 1.7) + 0.3;
  const o = [P(rrect(0, 0, W, 1, 0.18), C.white)];
  const tx = text('DUNKIN', 0.15, 0.19, 0.62, C.dunkO, { t: 1.7 });
  o.push(...tx);
  o.push(...text("'", 0.15 + textWidth('DUNKIN', 0.62, 1.7) + 0.9 * 0.62 / 6, 0.19, 0.62, C.dunkP, { t: 1.7 }));
  return { w: W, polys: o };
};
L.mcdonalds = () => {
  const o = [P(rrect(0, 0, 1.1, 1, 0.12), C.mcR)];
  const y0 = 0.12, arch = (c, hw, pk, x0, x1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + (x1 - x0) * i / n; return [x, y0 + (pk - y0) * (1 - Math.pow((x - c) / hw, 2))]; });
  const oL = arch(0.4, 0.27, 0.88, 0.13, 0.55), oR = arch(0.7, 0.27, 0.88, 0.55, 0.97);
  const iR = arch(0.7, 0.14, 0.7, 0.84, 0.56), iL = arch(0.4, 0.14, 0.7, 0.54, 0.26);
  o.push(P(oL.concat(oR.slice(1), iR, iL), C.mcY));
  return { w: 1.1, polys: o };
};
L.cvs = () => {
  const W = 2.6, o = [P(rect(0, 0, W, 1), C.white)];
  const heart = []; for (let i = 0; i <= 24; i++) { const t = 2 * PI * i / 24; heart.push([0.38 + 0.017 * 16 * Math.pow(Math.sin(t), 3), 0.52 + 0.017 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]); }
  o.push(P(heart, C.cvs));
  o.push(...text('CVS', 0.75, 0.4, 0.48, C.cvs, { t: 1.8 }));
  o.push(...text('PHARMACY', 0.77, 0.1, 0.18, C.cvs, { t: 1.4 }));
  return { w: W, polys: o };
};
L.burgerking = () => {
  const o = [P(circ(0.5, 0.5, 0.5, 36), C.cream)];
  o.push(P(ell(0.5, 0.63, 0.38, 0.27, 18, 0, PI).concat([[0.12, 0.63]]), C.bkBun));
  o.push(P(rrect(0.14, 0.12, 0.86, 0.27, 0.07, 3), C.bkBun));
  o.push(...text('BURGER', 0.5, 0.48, 0.11, C.bkRed, { t: 1.9, align: 'c', gap: 0.7 }));
  o.push(...text('KING', 0.5, 0.32, 0.11, C.bkRed, { t: 1.9, align: 'c', gap: 0.7 }));
  return { w: 1, polys: o };
};
L.seveneleven = () => {
  const o = [P(rrect(0, 0, 1, 1, 0.08), C.white)];
  o.push(P(rect(0.08, 0.76, 0.92, 0.88), C.sevO), P(rect(0.08, 0.5, 0.92, 0.72), C.sevG), P(rect(0.08, 0.34, 0.92, 0.46), C.sevR));
  o.push(P([[0.62, 0.34], [0.82, 0.34], [0.58, 0.06], [0.38, 0.06]], C.sevR));
  o.push(...text('ELEVEN', 0.5, 0.55, 0.12, C.white, { t: 1.6, align: 'c' }));
  return { w: 1, polys: o };
};
L.wendys = () => {
  const W = 0.25 + textWidth("WENDY'S", 0.38, 1.5) + 1.05, o = [P(rrect(0, 0, W, 1, 0.1), C.white)];
  o.push(P(circ(0.5, 0.5, 0.42, 32), C.wen), P(circ(0.5, 0.5, 0.36, 32), C.white));
  o.push(P(circ(0.16, 0.72, 0.09, 12), C.wen), P(circ(0.84, 0.72, 0.09, 12), C.wen));
  o.push(P(ell(0.5, 0.66, 0.3, 0.14, 14, 0, PI).concat([[0.2, 0.66]]), C.wen));
  o.push(P(circ(0.42, 0.48, 0.025, 8), C.black), P(circ(0.58, 0.48, 0.025, 8), C.black));
  o.push(P(ell(0.5, 0.36, 0.08, 0.04, 10, PI, 2 * PI), C.wen));
  o.push(...text("WENDY'S", 1.05, 0.3, 0.38, C.wen, { t: 1.5 }));
  return { w: W, polys: o };
};
L.chase = () => {
  const oct = circ(0.5, 0.5, 0.5, 8, PI / 8);
  const o = [P(oct, C.chase), P(rect(0.36, 0.36, 0.64, 0.64), C.white)];
  const hit = (p, d) => { let best = 9; for (let i = 0; i < 8; i++) { const a = oct[i], b = oct[(i + 1) % 8], ex = b[0] - a[0], ey = b[1] - a[1], den = d[0] * ey - d[1] * ex; if (Math.abs(den) < 1e-9) continue; const t = ((a[0] - p[0]) * ey - (a[1] - p[1]) * ex) / den, u = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den; if (t > 0 && u >= 0 && u <= 1) best = Math.min(best, t); } return [p[0] + d[0] * best, p[1] + d[1] * best]; };
  for (const [p, d] of [[[0.36, 0.64], [-1, 0]], [[0.36, 0.36], [0, -1]], [[0.64, 0.36], [1, 0]], [[0.64, 0.64], [0, 1]]]) o.push(P(thick(p, hit(p, d), 0.035), C.white));
  o.push(...text('CHASE', 1.15, 0.3, 0.4, C.navy, { t: 1.5 }));
  return { w: 1.15 + textWidth('CHASE', 0.4, 1.5) + 0.05, polys: o };
};
L.wellsfargo = () => {
  const W = textWidth('FARGO', 0.34, 1.7) + 0.3, o = [P(rect(0, 0, W, 1), C.wfR)];
  o.push(...text('WELLS', W / 2, 0.56, 0.34, C.wfY, { t: 1.7, align: 'c' }));
  o.push(...text('FARGO', W / 2, 0.1, 0.34, C.wfY, { t: 1.7, align: 'c' }));
  return { w: W, polys: o };
};
L.citi = () => {
  const W = textWidth('CITI', 0.55, 1.6) + 0.3, o = [P(rect(0, 0, W, 1), C.white)];
  o.push(...text('CITI', 0.15, 0.12, 0.55, C.citiB, { t: 1.6 }));
  const arc = []; for (let i = 0; i <= 12; i++) { const a = PI * (0.15 + 0.7 * i / 12); arc.push([W * 0.62 + 0.42 * Math.cos(a), 0.5 + 0.32 * Math.sin(a)]); }
  o.push(...polyline(arc, 0.07).map((q) => P(q, C.citiR)));
  return { w: W, polys: o };
};
L.homedepot = () => {
  const o = [P(rect(0, 0, 1, 1), C.hd)];
  const a = 0.62;
  o.push(...text('THE', 0.5, 0.66, 0.11, C.white, { t: 1.8, align: 'c', rot: a, rx: 0.5, ry: 0.5 }));
  o.push(...text('HOME', 0.5, 0.44, 0.17, C.white, { t: 1.8, align: 'c', rot: a, rx: 0.5, ry: 0.5 }));
  o.push(...text('DEPOT', 0.5, 0.2, 0.17, C.white, { t: 1.8, align: 'c', rot: a, rx: 0.5, ry: 0.5 }));
  return { w: 1, polys: o };
};
L.lidl = () => {
  const o = [P(rect(0, 0, 1, 1), C.lidlB), P(circ(0.5, 0.5, 0.42, 32), C.lidlR), P(circ(0.5, 0.5, 0.385, 32), C.lidlY)];
  o.push(...text('LIDL', 0.5, 0.415, 0.17, C.lidlB, { t: 1.9, align: 'c', gap: 0.6 }));
  return { w: 1, polys: o };
};
L.att = () => {
  const o = [P(circ(0.5, 0.5, 0.5, 32), C.att)];
  const band = (y0, y1, bend) => { const pts = []; for (let i = 0; i <= 10; i++) { const x = 0.05 + 0.9 * i / 10; pts.push([x, y1 + bend * Math.sin(PI * i / 10)]); } for (let i = 10; i >= 0; i--) { const x = 0.05 + 0.9 * i / 10; pts.push([x, y0 + bend * Math.sin(PI * i / 10)]); } return pts.map(([x, y]) => { const dx = x - 0.5, dy = y - 0.5, r = Math.hypot(dx, dy); return r > 0.49 ? [0.5 + dx * 0.49 / r, 0.5 + dy * 0.49 / r] : [x, y]; }); };
  o.push(P(band(0.7, 0.77, -0.05), C.white), P(band(0.52, 0.6, -0.08), C.white), P(band(0.33, 0.42, -0.1), C.white), P(band(0.15, 0.22, -0.1), C.white));
  o.push(...text('AT&T', 1.12, 0.3, 0.4, C.black, { t: 1.5 }));
  return { w: 1.12 + textWidth('AT&T', 0.4, 1.5) + 0.05, polys: o };
};
L.shell = () => {
  const pect = (s, dy) => { const pts = [[0.5 - 0.17 * s, 0.08 + dy], [0.5 + 0.17 * s, 0.08 + dy]]; for (let i = 0; i <= 28; i++) { const a = -0.18 * PI + 1.36 * PI * i / 28; const bump = 1 + 0.06 * Math.abs(Math.sin(7 * (a + 0.18 * PI) / 1.36)); pts.push([0.5 + 0.44 * s * bump * Math.cos(a), 0.47 + dy + 0.44 * s * bump * Math.sin(a)]); } pts.splice(2, 0); return [pts[0], pts[1]].concat(pts.slice(2)); };
  const o = [P(pect(1.08, -0.02), C.shR), P(pect(0.98, 0), C.shY)];
  for (let k = -3; k <= 3; k++) { const a = PI / 2 + k * 0.28; o.push(P(thick([0.5 + 0.06 * Math.cos(a), 0.2 + 0.06 * Math.sin(a)], [0.5 + 0.38 * Math.cos(a), 0.47 + 0.36 * Math.sin(a)], 0.035), C.shR)); }
  return { w: 1, polys: o };
};
L.bp = () => {
  const petals = (r0, r1, n, a0 = 0) => Array.from({ length: 2 * n }, (_, i) => { const a = a0 + PI * i / n, r = i % 2 ? r0 : r1; return [0.5 + r * Math.cos(a), 0.5 + r * Math.sin(a)]; });
  const o = [P(petals(0.4, 0.5, 18), C.bpG), P(petals(0.3, 0.4, 18, PI / 18), C.bpL), P(circ(0.5, 0.5, 0.28, 28), C.bpY), P(circ(0.5, 0.5, 0.15, 20), C.white)];
  o.push(...text('BP', 1.12, 0.3, 0.4, C.bpG, { t: 1.8 }));
  return { w: 1.12 + textWidth('BP', 0.4, 1.8) + 0.05, polys: o };
};
L.dominos = () => {
  const o = [];
  const tile = [[0.2, 0.05], [0.8, 0.05], [0.8, 0.95], [0.2, 0.95]];
  o.push(P(rot(tile, 0.5, 0.5, -0.6), C.white));
  o.push(P(rot([[0.24, 0.52], [0.76, 0.52], [0.76, 0.91], [0.24, 0.91]], 0.5, 0.5, -0.6), C.domR));
  o.push(P(rot([[0.24, 0.09], [0.76, 0.09], [0.76, 0.48], [0.24, 0.48]], 0.5, 0.5, -0.6), C.domB));
  for (const [x, y] of [[0.5, 0.715], [0.37, 0.18], [0.63, 0.39]]) { const c = rot([[x, y]], 0.5, 0.5, -0.6)[0]; o.push(P(circ(c[0], c[1], 0.06, 12), C.white)); }
  o.push(...text("DOMINO'S", 1.0, 0.32, 0.36, C.domB, { t: 1.5 }));
  return { w: 1.0 + textWidth("DOMINO'S", 0.36, 1.5) + 0.05, polys: o };
};
L.panera = () => {
  const W = 1.12 + textWidth('PANERA', 0.38, 1.4) + 0.1, o = [];
  o.push(P(circ(0.5, 0.5, 0.48, 32), C.pan), P(circ(0.5, 0.5, 0.42, 32), C.cream));
  o.push(P(ell(0.5, 0.42, 0.24, 0.12, 18), [176, 120, 60]));
  for (const dx of [-0.11, 0, 0.11]) o.push(P(thick([0.5 + dx - 0.03, 0.38], [0.5 + dx + 0.03, 0.48], 0.025), C.cream));
  o.push(P(circ(0.5, 0.7, 0.07, 14), C.pan));
  o.push(...text('PANERA', 1.12, 0.45, 0.38, C.pan, { t: 1.4 }));
  o.push(...text('BREAD', 1.12, 0.12, 0.22, C.pan, { t: 1.3 }));
  return { w: W, polys: o };
};
L.tesla = () => {
  const o = [P(rrect(0, 0, 1, 1, 0.1), C.white)];
  o.push(P([[0.2, 0.86], [0.5, 0.78], [0.8, 0.86], [0.78, 0.8], [0.55, 0.72], [0.52, 0.12], [0.48, 0.12], [0.45, 0.72], [0.22, 0.8]], C.tes));
  o.push(P([[0.27, 0.93], [0.5, 0.89], [0.73, 0.93], [0.72, 0.9], [0.5, 0.86], [0.28, 0.9]], C.tes));
  return { w: 1, polys: o };
};
L.nissan = () => {
  const o = [P(circ(0.5, 0.5, 0.5, 32), C.nisG), P(circ(0.5, 0.5, 0.44, 32), C.white), P(rect(-0.05, 0.38, 1.05, 0.62), C.nisG)];
  o.push(...text('NISSAN', 0.5, 0.43, 0.14, C.black, { t: 1.4, align: 'c' }));
  return { w: 1.1, polys: o.map((p) => ({ pts: p.pts.map(([x, y]) => [x + 0.05, y]), col: p.col })) };
};
L.ups = () => {
  const sh = [[0.12, 0.85], [0.5, 0.95], [0.88, 0.85], [0.88, 0.4], [0.8, 0.2], [0.5, 0.04], [0.2, 0.2], [0.12, 0.4]];
  const o = [P(sh, C.ups), P([[0.12, 0.85], [0.5, 0.95], [0.88, 0.85], [0.88, 0.78], [0.5, 0.86], [0.12, 0.78]], C.upsY)];
  o.push(...text('UPS', 0.5, 0.36, 0.28, C.upsY, { t: 1.7, align: 'c' }));
  return { w: 1, polys: o };
};
L.sherwin = () => {
  const o = [P(circ(0.5, 0.45, 0.4, 28), C.swB)];
  const drip = [[0.06, 0.95], [0.94, 0.95], [0.9, 0.7], [0.8, 0.62], [0.77, 0.45], [0.73, 0.62], [0.6, 0.66], [0.55, 0.5], [0.5, 0.66], [0.35, 0.62], [0.3, 0.38], [0.26, 0.62], [0.12, 0.7]];
  o.push(P(drip, C.swR));
  o.push(...text('SHERWIN', 1.1, 0.53, 0.26, C.swB, { t: 1.4 }), ...text('WILLIAMS', 1.1, 0.13, 0.26, C.swB, { t: 1.4 }));
  return { w: 1.1 + textWidth('WILLIAMS', 0.26, 1.4) + 0.05, polys: o };
};
const textLogo = (lines, fg, bg, h = 0.42, t = 1.5, pad = 0.18) => {
  const W = Math.max(...lines.map((s) => textWidth(s, h, t))) + 2 * pad;
  const o = bg ? [P(rect(0, 0, W, 1), bg)] : [];
  const n = lines.length, lh = n === 1 ? 0 : (1 - 2 * 0.12 - h) / (n - 1);
  lines.forEach((s, i) => o.push(...text(s, W / 2, n === 1 ? (1 - h) / 2 : 1 - 0.12 - h - i * lh, h, fg, { t, align: 'c' })));
  return { w: W, polys: o };
};
L.marshalls = () => textLogo(['MARSHALLS'], C.mar, C.white, 0.5, 1.3);
L.homegoods = () => textLogo(['HOMEGOODS'], C.hg, C.white, 0.5, 1.4);
L.friendlys = () => textLogo(["FRIENDLY'S"], C.fr, C.white, 0.5, 1.6);
L.publicstorage = () => textLogo(['PUBLIC', 'STORAGE'], C.white, C.ps, 0.34, 1.6);
L.bestwestern = () => { const r = textLogo(['BEST', 'WESTERN'], C.white, C.bw, 0.32, 1.6); r.polys.push(P(rect(0, 0.92, r.w, 1), C.bwY), P(rect(0, 0, r.w, 0.08), C.bwY)); return r; };
L.daysinn = () => { const r = textLogo(['DAYS INN'], C.days, C.white, 0.42, 1.6, 0.6); r.polys.push(P(circ(0.32, 0.5, 0.2, 18), C.dayY)); return r; };
L.lifetime = () => textLogo(['LIFE TIME'], C.white, C.black, 0.42, 1.5);
L.webster = () => textLogo(['WEBSTER', 'BANK'], C.white, [0, 46, 100], 0.32, 1.5);
L.roslyn = () => textLogo(['ROSLYN', 'SAVINGS BANK'], C.white, [16, 56, 110], 0.28, 1.4);
L.redmango = () => textLogo(['RED MANGO'], C.rm, C.white, 0.42, 1.6);
L.amf = () => { const r = textLogo(['AMF', 'SYOSSET LANES'], C.white, [200, 16, 46], 0.3, 1.6); return r; };
L.celebrity = () => textLogo(['CELEBRITY', 'DINER'], [250, 210, 80], [30, 30, 34], 0.32, 1.5);
L.powerpoke = () => textLogo(['POWER POKE'], [240, 90, 60], C.white, 0.42, 1.5);
L.kebab = () => textLogo(['KEBAB EXPRESS'], C.white, [150, 30, 30], 0.42, 1.5);
L.c2 = () => textLogo(['C2 EDUCATION'], C.white, [0, 120, 170], 0.42, 1.5);
L.shinedental = () => textLogo(['SHINE DENTAL'], [0, 120, 160], C.white, 0.42, 1.5);
L.plaza = () => {
  const a = L.chipotle(), b = L.starbucks(), W = Math.max(a.w, b.w), H = 2.15, o = [];
  o.push(P(rect(0, 0, W, H), [244, 242, 236]));
  for (const p of a.polys) o.push(P(p.pts.map(([x, y]) => [x + (W - a.w) / 2, y + 1.15]), p.col));
  for (const p of b.polys) o.push(P(p.pts.map(([x, y]) => [x + (W - b.w) / 2, y + 0.05]), p.col));
  return { w: W / H, polys: o.map((p) => P(p.pts.map(([x, y]) => [x / H, y / H]), p.col)) };
};

function build(keys) {
  const types = [];
  for (const k of keys) {
    const r = L[k]();
    const polys = r.polys.map((p) => ({ col: p.col, pts: p.pts.map(([x, y]) => [Math.round((x - r.w / 2) * 1000) / 1000, Math.round(y * 1000) / 1000]) }));
    types.push({ key: k, w: Math.round(r.w * 1000) / 1000, polys, nv: polys.reduce((s, p) => s + p.pts.length, 0) });
  }
  return types;
}
module.exports = { build, keys: Object.keys(L).filter((k) => L[k]), textWidth };
