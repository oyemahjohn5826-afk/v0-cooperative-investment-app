// Dump the real, live schema so migrations can be regenerated accurately.
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
  const tbls = await client.query(
    `select table_name from information_schema.tables
     where table_schema='public' and table_type='BASE TABLE' order by table_name`
  );
  const out = [];
  for (const { table_name } of tbls.rows) {
    const cols = await client.query(
      `select column_name, data_type, is_nullable, column_default
       from information_schema.columns where table_schema='public' and table_name=$1
       order by ordinal_position`,
      [table_name]
    );
    const pk = await client.query(
      `select a.attname as col
       from pg_index i join pg_attribute a on a.attrelid=i.indrelid and a.attnum=any(i.indkey)
       where i.indrelid=($1::regclass) and i.indisprimary`,
      [table_name]
    );
    const rls = await client.query(
      `select relrowsecurity as rls from pg_class where oid=($1::regclass)`,
      [table_name]
    );
    out.push({ table: table_name, columns: cols.rows, pk: pk.rows.map(r=>r.col), rls: rls.rows[0]?.rls });
  }
  console.log(JSON.stringify(out, null, 2));
} catch (e) {
  console.error("DUMP FAILED:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
