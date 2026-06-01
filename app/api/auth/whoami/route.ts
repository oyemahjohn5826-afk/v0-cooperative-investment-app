// app/api/auth/whoami/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Robust whoami route (POST)
 * Body: { access_token: "<​access_token>" }
 *
 * Returns JSON with either { ok: true, profile: {...} } or { ok: false, error: "...", details: ... }
 *
 * This implementation logs detailed errors to the server console to help debugging.
 */

function makeJsonError(message: string, details?: any, status = 500) {
  return NextResponse.json({ ok: false, error: message, details }, { status })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const accessToken = body?.access_token

    if (!accessToken) {
      return makeJsonError("missing_access_token", "Please POST { access_token } in the request body", 400)
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!SUPABASE_URL || !SUPABASE_ANON) {
      console.error("whoami: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing")
      return makeJsonError("missing_public_env", { NEXT_PUBLIC_SUPABASE_URL: !!SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: !!SUPABASE_ANON }, 500)
    }

    if (!SUPABASE_SERVICE) {
      console.error("whoami: SUPABASE_SERVICE_ROLE_KEY missing")
      return makeJsonError("missing_service_role_key", "Set SUPABASE_SERVICE_ROLE_KEY in .env.local (server-only)", 500)
    }

    // Create an auth client that uses the provided access_token in Authorization header
    const authClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })

    const { data: userData, error: userError } = await authClient.auth.getUser()
    if (userError) {
      console.error("whoami: auth.getUser error:", userError)
      return makeJsonError("auth_get_user_failed", userError.message, 401)
    }

    const user = userData?.user
    if (!user || !user.id) {
      console.error("whoami: no user returned from auth.getUser", userData)
      return makeJsonError("no_user", userData, 401)
    }

    // Use service role client to read profiles (bypass RLS)
    const serviceClient = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE, {
      auth: { persistSession: false },
    })

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("id, email, full_name, role, status")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("whoami: profile query error:", profileError)
      return makeJsonError("profile_query_failed", profileError.message, 500)
    }

    // Compose normalized profile
    const normalized = {
      id: profile?.id ?? user.id,
      email: profile?.email ?? user.email ?? "",
      full_name: profile?.full_name ?? "",
      role: (profile?.role ?? "member").toString().toLowerCase(),
      status: (profile?.status ?? "pending").toString().toLowerCase(),
    }

    // Return profile and set cookies describing role/status (these are optional)
    const res = NextResponse.json({ ok: true, profile: normalized })

    // Set short-lived server cookies for SSR route guards (optional)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }

    try {
      res.cookies.set("ec_user_id", String(normalized.id), cookieOptions)
      res.cookies.set("ec_email", String(normalized.email), cookieOptions)
      res.cookies.set("ec_full_name", String(normalized.full_name), cookieOptions)
      res.cookies.set("ec_role", String(normalized.role), cookieOptions)
      res.cookies.set("ec_status", String(normalized.status), cookieOptions)
    } catch (cookieErr) {
      // Log but don't fail the request if cookie writing fails
      console.error("whoami: failed to set cookies:", cookieErr)
    }

    return res
  } catch (err: any) {
    console.error("whoami: unexpected error:", err)
    return makeJsonError("unexpected_error", String(err?.message ?? err), 500)
  }
}