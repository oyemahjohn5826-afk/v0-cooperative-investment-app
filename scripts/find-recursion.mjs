// Find the ACTUAL source of the 42P17 recursion: dump profiles policy definitions,
// triggers, and function bodies that touch profiles. Read-only.
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
    `select policyname, cmd, qual, with_check
     from pg_policies where schemaname='public' and tablename='profiles'`
  );
  console.log("=== profiles policies (qual/with_check) ===");
  for (const r of pol.rows) {
    console.log(`\n[${r.policyname}] cmd=${r.cmd}`);
    console.log("  USING :", r.qual);
    console.log("  CHECK :", r.with_check);
  }
  const trig = await client.query(
    `select tgname, tgtype, pg_get_triggerdef(oid) as def
     from pg_trigger where tgrelid='public.profiles'::regclass and not tgisinternal`
  );
  console.log("\n=== profiles triggers ===");
  for (const r of trig.rows) console.log(`[${r.tgname}] ${r.def}`);
  const fn = await client.query(
    `select n.nspname||'.'||p.proname as fname, pg_get_functiondef(p.oid) as def
     from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where p.prosrc ilike '%profiles%'
       and n.nspname in ('public','auth','extensions')
     order by fname`
  );
  console.log("\n=== functions referencing profiles ===");
  for (const r of fn.rows) console.log(`\n[${r.fname}]\n${r.def}`);
} catch (e) {
  console.error("QUERY FAILED:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
