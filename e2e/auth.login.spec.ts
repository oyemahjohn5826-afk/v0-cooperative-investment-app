import { test, expect, type Page, type BrowserContext } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// The Playwright worker process does NOT inherit Next.js's .env.local, so load it
// explicitly so we can build a service-role client to provision the throwaway user.
function loadEnvLocal() {
  const p = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}

let testEmail: string;
let testPassword = "E2Etest!123";
let userId: string | undefined;

test.beforeAll(async () => {
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  testEmail = `e2e_${Date.now()}_${Math.floor(Math.random() * 1e6)}@example.com`;

  // Create a confirmed throwaway member so signInWithPassword works without email confirmation.
  const { data, error } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
    user_metadata: { full_name: "E2E Test Member" },
  });

  if (error) {
    throw new Error(`E2E setup failed (createUser): ${error.message}`);
  }
  userId = data.user?.id;

  // Ensure the profiles row exists with an approved member status.
  const { error: upsertError } = await admin
    .from("profiles")
    .upsert(
      { id: userId, email: testEmail, role: "member", status: "approved" },
      { onConflict: "id" },
    );

  if (upsertError) {
    // surface but don't hard-fail; the test itself will reveal profile issues
    console.warn("E2E setup: profiles upsert warning:", upsertError.message);
  }
});

test.afterAll(async () => {
  if (!userId) return;
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  // Remove the throwaway user so there is no production residue.
  await admin.auth.admin.deleteUser(userId).catch((e) => {
    console.warn("E2E cleanup: deleteUser warning:", e?.message);
  });
});

test("approved member reaches /dashboard with ec_status=approved", async ({
  page,
  context,
}: {
  page: Page;
  context: BrowserContext;
}) => {
  await page.goto("/auth/member-login");

  await page.fill("#email", testEmail);
  await page.fill("#password", testPassword);
  await page.click('button[type="submit"]');

  // The login page routes approved members to /dashboard.
  await page.waitForURL("http://localhost:3000/dashboard", { timeout: 30000 });

  const cookies = await context.cookies();
  const ecStatus = cookies.find((c) => c.name === "ec_status");
  expect(ecStatus, "ec_status cookie should be present").toBeDefined();
  expect(ecStatus?.value, "ec_status should be 'approved'").toBe("approved");
});
