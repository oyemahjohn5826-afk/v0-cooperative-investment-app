// Surgically drop the single recursive profiles policy that causes 42P17,
// and confirm no other profiles policy queries profiles. Idempotent.
// Read-only check afterwards. Reads creds from .env.local.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const env = {};
for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const DATABASE_URL = env.DATABASE_PASSWORD || env.DATABASE_URL;
const { Client } = require("pg");
const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  // Drop the recursive policy (EXISTS (SELECT ... FROM profiles ...))
  await client.query(`drop policy if exists "Admins can view all profiles" on public.profiles;`);
  console.log("Dropped recursive policy: Admins can view all profiles");
  // Show remaining profiles policies and flag any that still query profiles
  const pol = await client.query(
    `select policyname, qual, with_check from pg_policies
     where schemaname='public' and tablename='profiles'`
  );
  console.log("\nRemaining profiles policies:");
  let stillRec = false;
  for (const r of pol.rows) {
    const bad = /from\s+profiles/i.test(r.qual || "") || /from\s+profiles/i.test(r.with_check || "");
    if (bad) stillRec = true;
    console.log(` - ${r.policyname}${bad ? "  <-- STILL REFERENCES profiles!" : ""}`);
  }
  console.log(stillRec ? "\nWARNING: a recursive policy remains" : "\nOK: no remaining policy queries profiles (recursion resolved)");
} catch (e) {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
