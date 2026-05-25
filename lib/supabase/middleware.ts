import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ✅ Public routes — never redirect these
  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/auth/login",
    "/auth/register",
    "/auth/callback",
    "/auth/pending",
    "/auth/awaiting-approval",
    "/auth/sign-up-success",
  ]

  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)

  // Not logged in + trying to access protected route → send to login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Logged in + trying to access login/register → send to dashboard
  if (user && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return supabaseResponse
}