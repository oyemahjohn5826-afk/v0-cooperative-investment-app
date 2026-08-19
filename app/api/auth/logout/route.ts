import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// POST /api/auth/logout
// Clears the Supabase session (best effort) and expires the custom SSR
// route-guard cookies (ec_*) plus any Supabase auth (sb-*) cookies on the
// response. Clients do not read the body — they redirect after calling this.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut().catch(() => {})
  } catch {
    // ignore — cookie expiry below is what actually logs the user out of SSR
  }

  const res = NextResponse.json({ ok: true })

  // Expire the custom SSR route-guard cookies used by /dashboard and /admin.
  const ecCookies = [
    "ec_role",
    "ec_status",
    "ec_user_id",
    "ec_email",
    "ec_full_name",
  ]
  for (const name of ecCookies) {
    res.cookies.set(name, "", { path: "/", maxAge: 0, expires: new Date(0) })
  }

  // Also expire any Supabase auth cookies present on the request.
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      res.cookies.set(cookie.name, "", { path: "/", maxAge: 0, expires: new Date(0) })
    }
  }

  return res
}
