import fs from "node:fs";

const [src, outLines, outRail] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(src, "utf8"));
const BOX = +(process.env.BOX || 2300);
const EPS = +(process.env.EPS || 0.8);

const len = (p) => p.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - p[i][0], q[1] - p[i][1]), 0);

const ABBR = [
  [/\bAvenue\b/g, "Ave"], [/\bRoad\b/g, "Rd"], [/\bStreet\b/g, "St"], [/\bLane\b/g, "Ln"], [/\bDrive\b/g, "Dr"],
  [/\bCourt\b/g, "Ct"], [/\bPlace\b/g, "Pl"], [/\bTurnpike\b/g, "Tpke"], [/\bBoulevard\b/g, "Blvd"], [/\bCircle\b/g, "Cir"],
  [/\bTerrace\b/g, "Ter"], [/\bParkway\b/g, "Pkwy"], [/\bHighway\b/g, "Hwy"], [/\bExpressway\b/g, "Expy"], [/\bExtension\b/g, "Ext"],
  [/\bHollow\b/g, "Holw"], [/\bHeights\b/g, "Hts"], [/\bGardens\b/g, "Gdns"], [/\bCrescent\b/g, "Cres"], [/\bSquare\b/g, "Sq"],
  [/\bMount\b/g, "Mt"], [/\bSaint\b/g, "St"], [/\bPoint\b/g, "Pt"],
  [/^North /, "N "], [/^South /, "S "], [/^East /, "E "], [/^West /, "W "], [/ North$/, " N"], [/ South$/, " S"], [/ East$/, " E"], [/ West$/, " W"],
];
const SHORT = {
  "Seaford-Oyster Bay Expy": "Rt 135 Expressway", "Long Island Expy": "Long Island Expy", "Northern State Pkwy": "Northern State Pkwy",
  "Muttontown Eastwoods Rd": "Muttontown Eastwd Rd", "Sunnyside Blvd Ext": "Sunnyside Blvd Ext", "Crossways Park Dr W": "Crossways Pk Dr W",
  "Crossways Park Dr N": "Crossways Pk Dr N", "Jericho Oyster Bay Rd": "Jericho-Oyster Bay Rd",
};
const abbr = (n) => {
  if (!n) return "";
  let s = n;
  for (const [a, b] of ABBR) s = s.replace(a, b);
  s = SHORT[s] || s;
  return s;
};

const BASE = {
  motorway: 5, trunk: 4, primary: 4, secondary: 3, tertiary: 2, unclassified: 1, residential: 1, living_street: 1,
  motorway_link: 0, trunk_link: 1, primary_link: 1, secondary_link: 1, tertiary_link: 1, service: 0,
};
const DIV = { motorway: 70, trunk: 50, primary: 50, secondary: 36, tertiary: 30 };

const ways = [];
for (const h of d.hw) {
  if (!(h.hw in BASE)) continue;
  if (h.area === "yes") continue;
  const L = len(h.pts);
  if (h.hw === "service") {
    if (h.service && h.service !== "") continue;
    if (h.access === "private" || h.access === "no") continue;
    if (!h.name && L < 90) continue;
  }
  const link = /_link$/.test(h.hw);
  const front = !(h.hw === "motorway" || link || h.hw === "service");
  const park = front && h.hw !== "primary" && h.hw !== "trunk" && h.hw !== "secondary";
  ways.push({ id: +h.id, hw: h.hw, nm: abbr(h.name), raw: h.name, cls: BASE[h.hw], oneway: h.oneway === "yes" || h.hw === "motorway", pts: h.pts.map((p) => [p[0], p[1]]), front, park, div: false });
}

const densify = (pts, step) => {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 1e-6) continue;
    const n = Math.max(1, Math.ceil(L / step));
    for (let j = 0; j < n; j++) out.push({ x: a[0] + (b[0] - a[0]) * j / n, y: a[1] + (b[1] - a[1]) * j / n, dx: (b[0] - a[0]) / L, dy: (b[1] - a[1]) / L, v: j === 0 ? i : -1 });
  }
  const z = pts[pts.length - 1], q = out[out.length - 1];
  out.push({ x: z[0], y: z[1], dx: q.dx, dy: q.dy, v: pts.length - 1 });
  return out;
};

let divs = ways.filter((w) => w.oneway && w.hw in DIV && w.nm);
{
  const k2 = (p) => p[0].toFixed(1) + "," + p[1].toFixed(1);
  let again = true;
  while (again) {
    again = false;
    const starts = new Map();
    for (const w of divs) { const k = k2(w.pts[0]) + "|" + w.nm; if (!starts.has(k)) starts.set(k, []); starts.get(k).push(w); }
    for (const w of divs) {
      if (!w.pts) continue;
      const nx = starts.get(k2(w.pts[w.pts.length - 1]) + "|" + w.nm);
      if (!nx || nx.length !== 1 || nx[0] === w || !nx[0].pts || nx[0].hw !== w.hw) continue;
      const a1 = w.pts[w.pts.length - 2], a2 = w.pts[w.pts.length - 1], b1 = nx[0].pts[0], b2 = nx[0].pts[1];
      const ua = [a2[0] - a1[0], a2[1] - a1[1]], ub = [b2[0] - b1[0], b2[1] - b1[1]];
      if (ua[0] * ub[0] + ua[1] * ub[1] < 0.2 * Math.hypot(...ua) * Math.hypot(...ub)) continue;
      w.pts = w.pts.concat(nx[0].pts.slice(1));
      nx[0].pts = null;
      again = true;
      break;
    }
    divs = divs.filter((w) => w.pts);
  }
  const keep = new Set(divs);
  for (let i = ways.length - 1; i >= 0; i--) if (ways[i].oneway && ways[i].hw in DIV && ways[i].nm && !keep.has(ways[i])) ways.splice(i, 1);
}
const G = 30, grid = new Map();
const key = (i, j) => i * 100003 + j;
const allP = [];
divs.sort((a, b) => a.id - b.id).forEach((w, wi) => {
  w.order = wi;
  w.dp = densify(w.pts, 4);
  w.dp.forEach((p) => {
    p.w = w; p.alive = true; p.mid = null;
    allP.push(p);
    const k = key(Math.floor(p.x / G), Math.floor(p.y / G));
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(p);
  });
});
const near = (x, y, r, fn) => {
  const i0 = Math.floor((x - r) / G), i1 = Math.floor((x + r) / G), j0 = Math.floor((y - r) / G), j1 = Math.floor((y + r) / G);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const L = grid.get(key(i, j)); if (L) for (const q of L) fn(q); }
};
for (const w of divs) {
  const D = DIV[w.hw];
  for (const p of w.dp) {
    if (!p.alive) continue;
    let best = null, bd = D;
    near(p.x, p.y, D, (q) => {
      if (!q.alive || q.w === w || q.w.order < w.order || q.w.nm !== w.nm) return;
      if (p.dx * q.dx + p.dy * q.dy > -0.75) return;
      const dd = Math.hypot(q.x - p.x, q.y - p.y);
      if (dd < bd) { bd = dd; best = q; }
    });
    if (best) { p.mid = [(p.x + best.x) / 2, (p.y + best.y) / 2]; p.sep = bd; }
  }
  for (const p of w.dp) {
    if (!p.mid) continue;
    near(p.x, p.y, p.sep * 1.25 + 6, (q) => {
      if (q.w === w || q.w.order < w.order || q.w.nm !== w.nm) return;
      if (p.dx * q.dx + p.dy * q.dy > -0.5) return;
      if (Math.hypot(q.x - p.x, q.y - p.y) <= p.sep * 1.25 + 6) q.alive = false;
    });
  }
}
const lines = [];
const merged = [];
for (const w of ways) {
  if (!w.dp) { lines.push(w); continue; }
  let run = [], runMid = null, last = null;
  const flush = () => {
    if (run.length >= 2) {
      const m = runMid;
      const o = { ...w, pts: run.map((r) => r.xy), div: m, cls: m ? w.cls : Math.max(1, w.cls - (w.hw === "motorway" ? 2 : 1)) };
      delete o.dp;
      lines.push(o);
      if (m) merged.push(o);
    }
    run = [];
  };
  for (const p of w.dp) {
    if (!p.alive) { flush(); runMid = null; last = null; continue; }
    const isMid = !!p.mid;
    if (run.length && isMid !== runMid) {
      const bridge = run[run.length - 1];
      flush();
      run = [bridge];
    }
    runMid = isMid;
    run.push({ xy: isMid ? p.mid : [p.x, p.y] });
    last = p;
  }
  flush();
}

const carriageNodes = new Set();
for (const w of divs) for (const p of w.pts) carriageNodes.add(p[0].toFixed(1) + "," + p[1].toFixed(1));
const mergedSegs = [];
for (const m of merged) for (let i = 0; i < m.pts.length - 1; i++) mergedSegs.push([m.pts[i], m.pts[i + 1], m]);
const projMerged = (x, y, maxD, nm) => {
  let best = null, bd = maxD;
  for (const [a, b, m] of mergedSegs) {
    if (nm && m.nm !== nm) continue;
    const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2));
    const qx = a[0] + t * dx, qy = a[1] + t * dy, dd = Math.hypot(qx - x, qy - y);
    if (dd < bd) { bd = dd; best = [qx, qy]; }
  }
  return best;
};
let snapped = 0;
for (const l of lines) {
  if (l.div) continue;
  const isDiv = !!l.dp || divs.includes(l);
  l.pts = l.pts.map((p, i) => {
    if (isDiv && i > 0 && i < l.pts.length - 1) return p;
    if (!carriageNodes.has(p[0].toFixed(1) + "," + p[1].toFixed(1))) return p;
    const q = projMerged(p[0], p[1], 45);
    if (q) { snapped++; return q; }
    return p;
  });
  const out = [];
  for (const p of l.pts) if (!out.length || Math.hypot(p[0] - out[out.length - 1][0], p[1] - out[out.length - 1][1]) > 0.3) out.push(p);
  l.pts = out;
}

const clipSeg = (a, b) => {
  let t0 = 0, t1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, q] of [[-dx, a[0] + BOX], [dx, BOX - a[0]], [-dy, a[1] + BOX], [dy, BOX - a[1]]]) {
    if (p === 0) { if (q < 0) return null; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [[a[0] + t0 * dx, a[1] + t0 * dy], [a[0] + t1 * dx, a[1] + t1 * dy], t0 > 0, t1 < 1];
};
const clipLine = (pts) => {
  const out = [];
  let cur = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const c = clipSeg(pts[i], pts[i + 1]);
    if (!c) { if (cur.length > 1) out.push(cur); cur = []; continue; }
    if (!cur.length || c[2]) { if (cur.length > 1) out.push(cur); cur = [c[0]]; }
    cur.push(c[1]);
    if (c[3]) { out.push(cur); cur = []; }
  }
  if (cur.length > 1) out.push(cur);
  return out;
};
let clipped = [];
for (const l of lines) for (const p of clipLine(l.pts)) clipped.push({ ...l, pts: p });

const rk = (p) => p[0].toFixed(1) + "," + p[1].toFixed(1);
const sig = (l) => [l.nm, l.cls, l.front, l.park, !!l.div].join("|");
let changed = true;
while (changed) {
  changed = false;
  const ends = new Map();
  clipped.forEach((l, i) => {
    for (const e of [0, 1]) {
      const k = rk(e ? l.pts[l.pts.length - 1] : l.pts[0]);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push([i, e]);
    }
  });
  const used = new Set();
  for (const [k, L] of ends) {
    if (L.length !== 2) continue;
    const [[i, ei], [j, ej]] = L;
    if (i === j || used.has(i) || used.has(j)) continue;
    const A = clipped[i], B = clipped[j];
    if (!A.nm || sig(A) !== sig(B)) continue;
    if ((A.oneway || B.oneway) && !A.div && ei === ej) continue;
    const pa = ei ? A.pts : A.pts.slice().reverse();
    const pb = ej ? B.pts.slice().reverse() : B.pts;
    A.pts = pa.concat(pb.slice(1));
    B.pts = null;
    used.add(i); used.add(j);
    changed = true;
  }
  clipped = clipped.filter((l) => l.pts);
}

const rdp = (P, eps) => {
  if (P.length < 3) return P;
  const a = P[0], b = P[P.length - 1], abx = b[0] - a[0], aby = b[1] - a[1], L = Math.hypot(abx, aby);
  let k = -1, dm = -1;
  for (let i = 1; i < P.length - 1; i++) {
    const dd = L < 1e-9 ? Math.hypot(P[i][0] - a[0], P[i][1] - a[1]) : Math.abs(abx * (P[i][1] - a[1]) - aby * (P[i][0] - a[0])) / L;
    if (dd > dm) { dm = dd; k = i; }
  }
  if (dm > eps) return rdp(P.slice(0, k + 1), eps).slice(0, -1).concat(rdp(P.slice(k), eps));
  return [a, b];
};
const r1 = (v) => Math.round(v * 10) / 10;
const out = clipped
  .map((l) => ({ nm: l.nm, cls: l.cls, front: l.front ? 1 : 0, park: l.park ? 1 : 0, hw: l.hw, pts: rdp(l.pts, l.div ? EPS * 1.5 : EPS).map((p) => [r1(p[0]), r1(p[1])]) }))
  .filter((l) => l.pts.length >= 2 && len(l.pts) >= 6);

const rails = d.rail.filter((r) => !r.service).map((r) => ({ pts: r.pts.map((p) => [p[0], p[1]]) }));
{
  const k2 = (p) => p[0].toFixed(1) + "," + p[1].toFixed(1);
  let again = true;
  while (again) {
    again = false;
    for (const a of rails) {
      if (!a.pts) continue;
      const b = rails.find((r) => r !== a && r.pts && k2(r.pts[0]) === k2(a.pts[a.pts.length - 1]));
      if (b) { a.pts = a.pts.concat(b.pts.slice(1)); b.pts = null; again = true; }
    }
  }
}
const railChains = rails.filter((r) => r.pts).map((r) => clipLine(r.pts).sort((a, b) => len(b) - len(a))[0]).filter(Boolean).sort((a, b) => len(b) - len(a));
const railOut = rdp(railChains[0], 0.8).map((p) => [r1(p[0]), r1(p[1])]);

fs.writeFileSync(outLines, JSON.stringify(out));
fs.writeFileSync(outRail, JSON.stringify(railOut));
const byC = {};
for (const l of out) { byC[l.cls] = byC[l.cls] || { n: 0, L: 0, pts: 0 }; byC[l.cls].n++; byC[l.cls].L += len(l.pts); byC[l.cls].pts += l.pts.length; }
for (const k in byC) byC[k].L = Math.round(byC[k].L);
const names = new Set(out.map((l) => l.nm).filter(Boolean));
let pieces = 0, far = 0;
for (const l of out) { for (let i = 0; i < l.pts.length - 1; i++) { pieces += Math.max(1, Math.ceil(Math.hypot(l.pts[i + 1][0] - l.pts[i][0], l.pts[i + 1][1] - l.pts[i][1]) / 60)); if (l.cls >= 3) far++; } }
console.log("lines", out.length, "names", names.size, "snapped", snapped, "merged runs", merged.length, "rail pts", railOut.length);
console.log(byC);
console.log("lane pieces", pieces, "far pieces", far, "maxName", Math.max(...[...names].map((n) => n.length)), [...names].filter((n) => n.length > 20));
