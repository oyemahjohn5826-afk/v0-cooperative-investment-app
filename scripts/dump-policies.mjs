// Dump existing RLS policies + profiles trigger defs so the migration is faithful.
// Read-only. Reads creds from .env.local.
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
  const pol = await client.query(
    `select schemaname, tablename, policyname, cmd, qual, with_check
     from pg_policies where schemaname='public' order by tablename, policyname`
  );
  console.log("=== POLICIES ===");
  for (const r of pol.rows) {
    console.log(`\n[${r.tablename}] ${r.policyname} (${r.cmd})`);
    console.log("  USING :", r.qual);
    console.log("  CHECK :", r.with_check);
  }
} catch (e) {
  console.error("FAILED:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
