// One-off: apply supabase/fix_profiles_rls.sql to the live EC Coop project via the
// Supabase /sql endpoint using the SERVICE ROLE key (read from .env.local).
// Safe/idempotent — only run on owner's explicit approval.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Parse .env.local (KEY=VALUE lines)
const envText = readFileSync(join(root, ".env.local"), "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const svc = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !svc) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const query = readFileSync(join(root, "supabase", "fix_profiles_rls.sql"), "utf8");

const res = await fetch(`${url}/sql`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    apikey: svc,
    Authorization: `Bearer ${svc}`,
  },
  body: JSON.stringify({ query }),
});

const body = await res.text();
console.log("SQL APPLY STATUS:", res.status);
console.log(body.slice(0, 2000));
process.exit(res.ok ? 0 : 1);
