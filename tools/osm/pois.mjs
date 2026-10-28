import fs from "node:fs";
import { obb, area } from "./obb.mjs";

const [src, out] = process.argv.slice(2);
const d = JSON.parse(fs.readFileSync(src, "utf8"));
const BOX = 2280;
const inBox = (x, y, m = 0) => Math.abs(x) < BOX - m && Math.abs(y) < BOX - m;
const pip = (x, y, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const r1 = (v) => Math.round(v * 10) / 10, r3 = (v) => Math.round(v * 1000) / 1000;

const BRAND = [
  [/^Chipotle/, "chipotle", "Chipotle", "food", 1], [/^Starbucks/, "starbucks", "Starbucks", "food", 1], [/^Dunkin/, "dunkin", "Dunkin'", "food", 1],
  [/^McDonald/, "mcdonalds", "McDonald's", "food", 1], [/^CVS/, "cvs", "CVS Pharmacy", "store", 1], [/^Burger King/, "burgerking", "Burger King", "food", 1],
  [/^7-Eleven/, "seveneleven", "7-Eleven", "store", 1], [/^Wendy/, "wendys", "Wendy's", "food", 1], [/^Chase$/, "chase", "Chase Bank", "bank", 1],
  [/^Wells Fargo/, "wellsfargo", "Wells Fargo", "bank", 1], [/^Citibank/, "citi", "Citibank", "bank", 0], [/^The Home Depot/, "homedepot", "The Home Depot", "store", 1],
  [/^Lidl/, "lidl", "Lidl", "store", 1], [/^AT&T/, "att", "AT&T", "store", 0], [/^Shell$/, "shell", "Shell", "gas", 1], [/^BP$/, "bp", "BP", "gas", 1],
  [/^Domino/, "dominos", "Domino's", "food", 1], [/^Panera/, "panera", "Panera Bread", "food", 1], [/^Tesla Long Island/, "tesla", "Tesla", "car", 1],
  [/^Nissan$/, "nissan", "Nissan", "car", 0], [/^Legend Nissan/, "nissan", "Legend Nissan", "car", 0], [/^The UPS Store/, "ups", "The UPS Store", "store", 0],
  [/^Sherwin-Williams/, "sherwin", "Sherwin-Williams", "store", 0], [/^Marshalls/, "marshalls", "Marshalls", "store", 1], [/^HomeGoods/, "homegoods", "HomeGoods", "store", 0],
  [/^Friendly/, "friendlys", "Friendly's", "food", 1], [/^Public Storage/, "publicstorage", "Public Storage", "store", 0], [/^Best Western/, "bestwestern", "Best Western", "hotel", 0],
  [/^Days Inn/, "daysinn", "Days Inn", "hotel", 0], [/^Life Time/, "lifetime", "Life Time", "gym", 1], [/^WebsterBank/, "webster", "Webster Bank", "bank", 0],
  [/^Roslyn Savings/, "roslyn", "Roslyn Savings Bank", "bank", 0], [/^Red Mango/, "redmango", "Red Mango", "food", 0], [/^AMF Syosset/, "amf", "AMF Syosset Lanes", "fun", 1],
  [/^Celebrity Diner/, "celebrity", "Celebrity Diner", "food", 1], [/^Power Poke/, "powerpoke", "Power Poke", "food", 0], [/^Kebab Express/, "kebab", "Kebab Express", "food", 0],
  [/^C2 Education/, "c2", "C2 Education", "store", 0], [/^Shine Dental/, "shinedental", "Shine Dental", "store", 0],
];
const SKIPNAME = /^(Syosset Train Station|Platform|Syosset$|Little Free|EVgo|eVgo|Tesla Supercharger|FedEx|AMOTT|Syosset Depot|Western Union|BP Shop|Days Inn$)/;
const TEXTSHOP = new Set(["restaurant", "fast_food", "cafe", "bakery", "pharmacy", "bank", "supermarket", "convenience", "clothes", "jewelry", "hairdresser", "beauty", "dry_cleaning", "wine", "greengrocer", "paint", "deli", "ice_cream", "car_repair", "car", "bicycle", "stationery", "post_office", "veterinary", "dentist", "doctors", "funeral_directors", "furniture", "theatre", "bowling_alley", "fitness_centre", "ice_rink", "hotel", "storage_rental", "department_store", "houseware", "doityourself", "mobile_phone", "tobacco", "clinic", "insurance Agency", "carpet", "sports_centre"]);
const SHORT = {
  "Kebab Express Halal Grill Syosset": "Kebab Express", "Signature Premier Properties | Syosset": "Signature Premier", "Rollin Automotive Auto Repair": "Rollin Automotive",
  "Syosset Tire & Auto Repair": "Syosset Tire & Auto", "Trackside Smoke & Convenience": "Trackside Smoke Shop", "Village Pharmacy of Syosset": "Village Pharmacy",
  "R&Z Syosset Carpet Cleaning": "R&Z Carpet Cleaning", "Northwell Health, Syosset SurgiCenter": "Northwell SurgiCenter", "Weissman Agency: Allstate Insurance": "Allstate Insurance",
  "Master Chef Chinese Asian Cuisine| Japanese Sushi": "Master Chef", "Syosset-Woodbury Community Park Community Center": "Community Center", "Labiaplasty NYC Long Island": null,
};
const clean = (s) => s.replace(/[|:,]/g, " ").replace(/\s+/g, " ").trim();
const brandOf = (t) => { const n = t.brand || t.name || ""; for (const b of BRAND) if (b[0].test(n) || (t.name && b[0].test(t.name))) return b; return null; };

const areas = d.areas.map((a) => ({ ...a, o: a.pts.length >= 4 ? obb(a.pts) : null, A: a.pts.length >= 4 ? area(a.pts) : 0 }));
const bld = areas.filter((a) => a.tags.building && a.o && inBox(a.o.x, a.o.y, 10));
const containing = (x, y) => bld.filter((b) => b.A > 30 && pip(x, y, b.pts)).sort((p, q) => p.A - q.A)[0];

const sites = new Map();
const siteOf = (b) => { if (!sites.has(b.id)) sites.set(b.id, { id: b.id, o: b.o, A: b.A, tags: b.tags, tenants: [] }); return sites.get(b.id); };
const tenants = [];
for (const a of areas) {
  const t = a.tags;
  if (!a.o || !(t.name || t.brand) || !(t.amenity || t.shop || t.brand || t.leisure === "bowling_alley" || t.leisure === "fitness_centre" || t.leisure === "ice_rink" || t.tourism === "hotel" || t.building === "hotel")) continue;
  if (!inBox(a.o.x, a.o.y, 10)) continue;
  tenants.push({ src: "area", tags: t, x: a.o.x, y: a.o.y, area: a });
}
for (const p of d.pois) {
  const t = p.tags;
  if (!(t.name || t.brand)) continue;
  const [x, y] = p.xy;
  if (!inBox(x, y, 10)) continue;
  tenants.push({ src: "node", tags: t, x, y });
}
const seen = [];
const outT = [];
for (const T of tenants) {
  const t = T.tags, nm0 = t.name || t.brand;
  if (SKIPNAME.test(nm0)) continue;
  const b = brandOf(t);
  const kind = t.amenity || t.shop || t.leisure || t.tourism || "";
  if (!b && !TEXTSHOP.has(kind)) continue;
  const name = b ? b[2] : SHORT[nm0] === undefined ? clean(nm0) : SHORT[nm0];
  if (!name) continue;
  if (seen.some((s) => s.name === name && Math.hypot(s.x - T.x, s.y - T.y) < 40)) continue;
  let host = null;
  if (T.area && T.area.tags.building) host = T.area;
  else { const c = containing(T.x, T.y); if (c) host = c; else if (T.area) host = T.area; }
  if (!host || !host.o) continue;
  if (host.o.a > 160 || host.o.b > 120) continue;
  seen.push({ name, x: T.x, y: T.y });
  const S = siteOf(host);
  S.tenants.push({ name, logo: b ? b[1] : null, kind: b ? b[3] : kind, dest: b ? !!b[4] : false, x: r1(T.x), y: r1(T.y), osmKind: kind });
}
const fuel = areas.filter((a) => a.tags.amenity === "fuel" && a.o && inBox(a.o.x, a.o.y, 10)).map((a) => ({ x: r1(a.o.x), y: r1(a.o.y), ux: r3(a.o.ux), uy: r3(a.o.uy), a: r1(a.o.a), b: r1(a.o.b), name: a.tags.brand || a.tags.name || "" }));

const levelsH = (t, kind) => {
  const lv = parseFloat(t["building:levels"]);
  if (lv > 0) return Math.min(30, 1.2 + 3.6 * lv);
  if (t.height) return Math.min(30, parseFloat(t.height) || 7);
  return { commercial: 8, retail: 6.4, industrial: 9, office: 10, school: 9, church: 12, hotel: 10, apartments: 11, yes: 7, civic: 8, public: 8, train_station: 6, warehouse: 9, supermarket: 7, hospital: 16, fire_station: 8, government: 8 }[kind] || 7;
};
const NONHOUSE = new Set(["commercial", "retail", "industrial", "office", "school", "church", "hotel", "apartments", "yes", "civic", "public", "warehouse", "supermarket", "hospital", "fire_station", "government", "kindergarten", "college", "train_station", "transportation", "service", "roof", "sports_centre", "religious", "synagogue", "chapel"]);
const buildings = [];
for (const b of bld) {
  const kind = b.tags.building;
  if (!NONHOUSE.has(kind)) continue;
  if (b.A < (kind === "yes" ? 220 : 90)) continue;
  if (b.o.a > 170 || b.o.b > 120) continue;
  const S = sites.get(b.id);
  buildings.push({ id: b.id, x: r1(b.o.x), y: r1(b.o.y), ux: r3(b.o.ux), uy: r3(b.o.uy), a: r1(b.o.a), b: r1(b.o.b), h: r1(levelsH(b.tags, kind)), kind, roof: kind === "roof" ? 1 : 0, name: b.tags.name || "", tenants: S ? S.tenants : [] });
}
for (const S of sites.values()) {
  if (buildings.some((b) => b.id === S.id)) continue;
  const kind = S.tags.building || "retail";
  if (S.A < 25) continue;
  buildings.push({ id: S.id, x: r1(S.o.x), y: r1(S.o.y), ux: r3(S.o.ux), uy: r3(S.o.uy), a: r1(Math.max(S.o.a, 3)), b: r1(Math.max(S.o.b, 3)), h: r1(levelsH(S.tags, kind === "yes" ? "retail" : kind)), kind, roof: 0, name: S.tags.name || "", tenants: S.tenants });
}
const lots = areas.filter((a) => a.tags.amenity === "parking" && a.o && inBox(a.o.x, a.o.y, 30) && a.A > 250 && a.A < 40000 && (a.tags.parking || "surface") === "surface").map((a) => ({ x: r1(a.o.x), y: r1(a.o.y), ux: r3(a.o.ux), uy: r3(a.o.uy), a: r1(a.o.a), b: r1(a.o.b), fill: r3(a.A / (4 * a.o.a * a.o.b)) }));
const parks = areas.filter((a) => (a.tags.leisure === "park" || a.tags.leisure === "pitch") && a.o && inBox(a.o.x, a.o.y, 20)).map((a) => ({ x: r1(a.o.x), y: r1(a.o.y), name: a.tags.name || "", A: Math.round(a.A), kind: a.tags.leisure }));
fs.writeFileSync(out, JSON.stringify({ buildings, lots, fuel, parks }));
const ten = buildings.flatMap((b) => b.tenants);
console.log("buildings", buildings.length, "with tenants", buildings.filter((b) => b.tenants.length).length, "tenants", ten.length, "logos", ten.filter((t) => t.logo).length, "dest", ten.filter((t) => t.dest).length, "lots", lots.length, "fuel", fuel.length);
console.log(ten.filter((t) => t.logo).map((t) => t.name + "@" + Math.round(t.x) + "," + Math.round(t.y)).join(" | "));
console.log(ten.filter((t) => !t.logo).map((t) => t.name).join(" | "));
