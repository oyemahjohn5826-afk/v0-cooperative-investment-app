import { NextRequest, NextResponse } from "next/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

function jsonError(message: string, details?: any, status = 500) {
  return NextResponse.json({ ok: false, error: message, details }, { status })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    const accessToken = body?.access_token as string | undefined
    const email = (body?.email as string | undefined) || undefined
    const fullName = (body?.full_name as string | undefined) || ""
    const phone = (body?.phone as string | undefined) || null

    if (!fullName) {
      return jsonError("missing_full_name", "Please provide full_name", 400)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      console.error("register: missing env vars", {
        hasUrl: !!supabaseUrl,
        hasAnon: !!supabaseAnonKey,
        hasService: !!serviceRoleKey,
      })
      return jsonError(
        "missing_env",
        "Ensure NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set",
        500
      )
    }

    let userId: string | null = null
    let userEmail: string | null = email ?? null

    // Preferred: validate access token and extract the logged-in user
    if (accessToken) {
      const authClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      })

      const { data: userData, error: userError } = await authClient.auth.getUser()

      if (userError || !userData?.user) {
        console.error("register: auth.getUser error:", userError)
        return jsonError("invalid_access_token", userError?.message ?? "User not found", 401)
      }

      userId = userData.user.id
      userEmail = userData.user.email ?? userEmail
    } else {
      // Fallback: look up the auth user by email using the Supabase Admin REST endpoint
      if (!email) {
        return jsonError("missing_email_or_token", "Provide access_token or email", 400)
      }

      const adminUrl = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/admin/users?email=${encodeURIComponent(email)}`

      const adminRes = await fetch(adminUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
          "Content-Type": "application/json",
        },
      })

      if (!adminRes.ok) {
        const text = await adminRes.text().catch(() => null)
        console.error("register: admin lookup HTTP error", adminRes.status, text)
        return jsonError("user_lookup_failed", { status: adminRes.status, body: text }, 500)
      }

      const adminJson = await adminRes.json().catch(() => null)

      let foundUser: any = null

      if (Array.isArray(adminJson)) {
        foundUser = adminJson[0] ?? null
      } else if (adminJson?.users && Array.isArray(adminJson.users)) {
        foundUser = adminJson.users[0] ?? null
      } else if (adminJson?.id) {
        foundUser = adminJson
      }

      if (!foundUser?.id) {
        console.error("register: no auth user found for email", email, adminJson)
        return jsonError(
          "auth_user_not_found",
          "No auth user exists for provided email; ensure signUp completed",
          404
        )
      }

      userId = foundUser.id
      userEmail = foundUser.email ?? email
    }

    if (!userId) {
      return jsonError("no_user_id", "Unable to determine auth user id", 500)
    }

    // Create or update profile
    const serviceClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    const profilePayload = {
      id: userId,
      email: userEmail,
      full_name: fullName,
      phone,
      role: "member",
      status: "pending",
    }

    const { data: upsertedData, error: upsertErr } = await serviceClient
      .from("profiles")
      .upsert(profilePayload, { onConflict: "id" })
      .select()
      .single()

    if (upsertErr) {
      console.error("register: upsert error:", upsertErr)
      return jsonError("profile_upsert_failed", upsertErr.message ?? upsertErr, 500)
    }

    return NextResponse.json({ ok: true, profile: upsertedData })
  } catch (err: any) {
    console.error("register: unexpected error:", err)
    return jsonError("unexpected_error", String(err?.message ?? err), 500)
  }
}