// Apply supabase/fix_profiles_rls.sql via a direct Postgres connection (DATABASE_URL).
// Reads creds from .env.local. Used only on owner approval.
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
// .env.local stores the full postgres URI under DATABASE_PASSWORD
const DATABASE_URL = env.DATABASE_PASSWORD || env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_PASSWORD (or DATABASE_URL) missing in .env.local");
  process.exit(2);
}

const query = readFileSync(join(root, "supabase", "fix_profiles_rls.sql"), "utf8");

const { Client } = require("pg");
const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  console.log("Connected to Postgres. Applying fix...");
  await client.query(query);
  console.log("APPLY OK");
} catch (e) {
  console.error("APPLY FAILED:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
