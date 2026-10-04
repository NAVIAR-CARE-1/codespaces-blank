// Build-time check: every executable inline script in index.html must be allowed by the CSP in vercel.json.
const fs = require("fs"), crypto = require("crypto"), path = require("path");
const cfg = JSON.parse(fs.readFileSync(process.argv[2] || "vercel.json", "utf8"));
const csp = cfg.headers.flatMap(h => h.headers).find(h => h.key === "Content-Security-Policy").value;
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
let n = 0, bad = 0;
for (const m of html.matchAll(/<script(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
  n++;
  const h = "sha256-" + crypto.createHash("sha256").update(m[1], "utf8").digest("base64");
  if (!csp.includes("'" + h + "'")) { bad++; console.error("CSP does not allow inline script", h); }
}
const sums = JSON.parse(fs.readFileSync(path.join(__dirname, "checksums.json"), "utf8"));
for (const [f, want] of Object.entries(sums)) {
  if (f === "vercel.json") continue;
  const got = crypto.createHash("sha256").update(fs.readFileSync(path.join(__dirname, f))).digest("hex");
  if (got !== want) { bad++; console.error("checksum mismatch", f); }
}
console.log("checked", n, "inline scripts and", Object.keys(sums).length, "files;", bad, "problems");
process.exit(bad || n < 2 ? 1 : 0);
