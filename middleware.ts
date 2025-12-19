import { NextResponse, type NextRequest } from "next/server"

type SessionPayload = {
  id: string
  email: string
  role: string
  name: string
}

function readSession(req: NextRequest): SessionPayload | null {
  const raw = req.cookies.get("session")?.value
  if (!raw) return null

  try {
    const json = atob(raw)
    const parsed = JSON.parse(json)

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.role !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return null
    }

    return parsed as SessionPayload
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const protectedPrefixes = ["/admin", "/counter", "/waiter", "/kitchen", "/reports", "/settings"]
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  const session = readSession(req)

  if (pathname === "/login") {
    if (!session) return NextResponse.next()

    const role = session.role
    const url = req.nextUrl.clone()
    if (role === "admin") url.pathname = "/admin"
    else if (role === "counter") url.pathname = "/counter"
    else if (role === "waiter") url.pathname = "/waiter"
    else if (role === "kitchen") url.pathname = "/kitchen"
    else url.pathname = "/"

    return NextResponse.redirect(url)
  }

  if (!isProtected) return NextResponse.next()

  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  const role = session.role
  const rolePrefixMap: Record<string, string> = {
    admin: "/admin",
    counter: "/counter",
    waiter: "/waiter",
    kitchen: "/kitchen",
  }

  const allowedPrefix = rolePrefixMap[role]
  const isRoleArea = allowedPrefix
    ? pathname === allowedPrefix || pathname.startsWith(`${allowedPrefix}/`)
    : false

  if (["/reports", "/settings"].some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  if (!isRoleArea) {
    const url = req.nextUrl.clone()
    url.pathname = allowedPrefix || "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/counter/:path*",
    "/waiter/:path*",
    "/kitchen/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/login",
  ],
}
