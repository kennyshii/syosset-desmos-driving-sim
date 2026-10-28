export const hull = (P) => {
  const p = P.map((q) => [q[0], q[1]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.slice().reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
};
export const obb = (P) => {
  const H = hull(P);
  let best = null;
  for (let i = 0; i < H.length; i++) {
    const a = H[i], b = H[(i + 1) % H.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 1e-6) continue;
    const ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
    let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
    for (const q of H) { const u = q[0] * ux + q[1] * uy, v = -q[0] * uy + q[1] * ux; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
    const A = (u1 - u0) * (v1 - v0);
    if (!best || A < best.A) { const cu = (u0 + u1) / 2, cv = (v0 + v1) / 2; best = { A, x: cu * ux - cv * uy, y: cu * uy + cv * ux, ux, uy, a: (u1 - u0) / 2, b: (v1 - v0) / 2 }; }
  }
  if (best.a < best.b) best = { ...best, ux: -best.uy, uy: best.ux, a: best.b, b: best.a };
  return best;
};
export const area = (p) => { let s = 0; for (let i = 0; i < p.length - 1; i++) s += p[i][0] * p[i + 1][1] - p[i + 1][0] * p[i][1]; return Math.abs(s) / 2; };
