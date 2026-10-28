import fs from "node:fs";
import { chromium } from "playwright";
const [stateF, oldDF, newDF, outF] = process.argv.slice(2);
const P13 = fs.readFileSync(new URL("../src/patch13.js", import.meta.url), "utf8");
const S0 = JSON.parse(fs.readFileSync(stateF, "utf8"));
const b = await chromium.launch({ channel: "chrome", headless: true });
const pg = await b.newPage();
await pg.goto("https://www.desmos.com/calculator", { waitUntil: "load" });
await pg.waitForFunction(() => window.Calc && window.Calc.setState);
console.log(await pg.evaluate(P13));
if (oldDF !== "-") {
  const Dold = JSON.parse(fs.readFileSync(oldDF, "utf8"));
  const v = await pg.evaluate(([s, d]) => { try { const r = window.__build13(s, d, { verify: true }); return r.mism; } catch (e) { return ["ERR " + e]; } }, [S0, Dold]);
  console.log("verify mismatches:", v.length);
  v.slice(0, 12).forEach((m) => console.log(m));
}
if (newDF !== "-") {
  const D = JSON.parse(fs.readFileSync(newDF, "utf8"));
  const r = await pg.evaluate(([s, d]) => { try { const r = window.__build13(s, d); return { S: r.S, log: r.log }; } catch (e) { return { err: String(e) }; } }, [S0, D]);
  if (r.err) { console.log("ERROR", r.err); process.exit(1); }
  console.log(r.log.join(" | "));
  fs.writeFileSync(outF, JSON.stringify(r.S));
  console.log("exprs", r.S.expressions.list.length, "KB", Math.round(fs.statSync(outF).size / 1024));
}
await b.close();
