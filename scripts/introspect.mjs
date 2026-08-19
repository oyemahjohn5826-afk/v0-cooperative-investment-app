// Introspect actual public tables + existing policies (read-only), so we apply
// RLS only where tables exist. Reads creds from .env.local.
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
  const tables = await client.query(
    `select table_name from information_schema.tables
     where table_schema='public' and table_type='BASE TABLE'
     order by table_name`
  );
  console.log("TABLES:", tables.rows.map(r => r.table_name).join(", "));
  const pol = await client.query(
    `select tablename, policyname from pg_policies
     where schemaname='public' order by tablename, policyname`
  );
  console.log("EXISTING POLICIES:", pol.rows.length ? pol.rows.map(r => `${r.tablename}.${r.policyname}`).join(", ") : "(none)");
} catch (e) {
  console.error("INTROSPECT FAILED:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
