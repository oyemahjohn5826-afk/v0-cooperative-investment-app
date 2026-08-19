// Probe which Supabase management endpoints are reachable for this project,
// and test a trivial authed query. Reads creds from .env.local.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const env = {};
for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const svc = env.SUPABASE_SERVICE_ROLE_KEY;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function tryPost(path, headers, body) {
  try {
    const res = await fetch(`${url}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const txt = await res.text();
    return { path, status: res.status, body: txt.slice(0, 200) };
  } catch (e) {
    return { path, error: String(e) };
  }
}

console.log("URL:", url);
console.log("1) /sql with trivial query:");
console.log(await tryPost("/sql", { "Content-Type": "application/json", apikey: svc, Authorization: `Bearer ${svc}` }, { query: "select 1 as ok" }));

console.log("2) anon GET profiles (should now be 200 or still 500):");
try {
  const r = await fetch(`${url}/rest/v1/profiles?select=id&limit=1`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  console.log({ status: r.status, body: (await r.text()).slice(0, 200) });
} catch (e) {
  console.log({ error: String(e) });
}
