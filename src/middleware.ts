import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "admin_token"

const ADMIN_PATHS = ["/admin"]
const API_PATHS = ["/api/cases", "/api/health"]
const PRINT_PATHS = ["/print/cases"]

function requireAuth(pathname: string): boolean {
  if (ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    if (pathname === "/admin/login") return false
    return true
  }
  if (API_PATHS.some((p) => pathname.startsWith(p))) return true
  if (PRINT_PATHS.some((p) => pathname.startsWith(p))) return true
  return false
}

function isAdminLoginPage(pathname: string): boolean {
  return pathname === "/admin/login"
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

async function verifyAdminHmac(cookieValue: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_PASSWORD
    if (!secret) return false

    const [issuedAt, signature] = cookieValue.split(".")
    if (!issuedAt || !signature) return false

    const issuedMs = parseInt(issuedAt, 10)
    if (isNaN(issuedMs)) return false
    const ADMIN_COOKIE_TTL_MS = 24 * 60 * 60 * 1000
    if (Date.now() - issuedMs > ADMIN_COOKIE_TTL_MS) return false

    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(`admin:${issuedAt}`)
    const sigBytes = hexToBytes(signature)

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    )

    return crypto.subtle.verify("HMAC", key, sigBytes.buffer as ArrayBuffer, messageData)
  } catch {
    return false
  }
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value
  if (!cookieValue) return false
  return verifyAdminHmac(cookieValue)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!requireAuth(pathname)) {
    return NextResponse.next()
  }

  const authed = await isAuthenticated(request)

  if (isAdminLoginPage(pathname)) {
    if (authed) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (!authed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const url = request.nextUrl.clone()
    url.pathname = "/admin/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/cases/:path*",
    "/api/health/:path*",
    "/print/cases/:path*",
  ],
}
