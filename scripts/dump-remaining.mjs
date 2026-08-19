// Dump remaining non-any warnings (unused-vars, location-assign, react-hooks/*)
// for files other than admin-ledger.tsx (already fixed), from eslint.json.
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("eslint.json", "utf8"));
const want = [
  "@typescript-eslint/no-unused-vars",
  "@next/next/no-location-assign-relative-destination",
  "react-hooks/static-components",
  "react-hooks/incompatible-library",
  "react-hooks/purity",
  "react-hooks/set-state-in-effect",
];
for (const f of data) {
  const base = f.filePath.split(/[\\/]/).pop();
  if (base === "admin-ledger.tsx") continue;
  for (const m of f.messages) {
    if (want.includes(m.ruleId)) {
      console.log(base, m.line + ":" + m.column, m.ruleId, "-", m.message.split("\n")[0]);
    }
  }
}
