import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const role = (request.cookies.get("ec_role")?.value || "").toLowerCase()
  const status = (request.cookies.get("ec_status")?.value || "").toLowerCase()

  const publicPaths = [
    "/",
    "/about",
    "/contact",
    "/auth/login",
    "/auth/register",
    "/auth/admin-login",
    "/auth/member-login",
    "/auth/pending",
    "/api/auth/whoami",
    "/api/auth/logout",
  ]

  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)

  if (isPublic) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/auth/admin-login", request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/dashboard")) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }

    if (!status) {
      return NextResponse.redirect(new URL("/auth/member-login", request.url))
    }

    if (status !== "approved") {
      return NextResponse.redirect(new URL("/auth/pending", request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}