// Summarize eslint JSON output: warnings by file+rule, grouped.
// Usage: npx eslint . -f json > eslint.json ; node scripts/lint-report.mjs eslint.json
import { readFileSync } from "node:fs";
const path = process.argv[2] || "eslint.json";
const data = JSON.parse(readFileSync(path, "utf8"));
const byFileRule = {};
const byRule = {};
for (const f of data) {
  const base = f.filePath.split(/[\\/]/).pop();
  for (const msg of f.messages) {
    if (msg.severity !== 1) continue;
    const fr = `${base} :: ${msg.ruleId}`;
    byFileRule[fr] = (byFileRule[fr] || 0) + 1;
    byRule[msg.ruleId] = (byRule[msg.ruleId] || 0) + 1;
  }
}
console.log("=== WARNINGS by RULE ===");
for (const [k, v] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) console.log(v, k);
console.log("\n=== WARNINGS by FILE (rule) ===");
for (const [k, v] of Object.entries(byFileRule).sort((a, b) => b[1] - a[1])) console.log(v, k);
