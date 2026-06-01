// app/api/debug/profile/route.ts
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            // no-op for debug route
          },
        },
      }
    )

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    const user = userData?.user ?? null

    if (!user) {
      return NextResponse.json({ ok: true, serverUser: null, profile: null, note: "No server-side user (no cookies)" })
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, email, role, status")
      .eq("id", user.id)
      .single()

    return NextResponse.json({
      ok: true,
      serverUser: user,
      profile: profile ?? null,
      userError: userErr ?? null,
      profileError: profileErr ?? null,
    })
  } catch (err: any) {
    console.error("Debug profile route error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}