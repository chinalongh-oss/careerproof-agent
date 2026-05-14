import "server-only"

import { createHmac, timingSafeEqual } from "crypto"

const ADMIN_COOKIE_TTL_MS = 24 * 60 * 60 * 1000

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) {
    throw new Error("ADMIN_PASSWORD environment variable is not set")
  }
  return secret
}

export function signAdminCookie(): string {
  const secret = getSecret()
  const issuedAt = Date.now().toString()
  const signature = createHmac("sha256", secret)
    .update(`admin:${issuedAt}`)
    .digest("hex")
  return `${issuedAt}.${signature}`
}

export function verifyAdminCookie(cookieValue: string): boolean {
  try {
    const secret = getSecret()
    const [issuedAt, signature] = cookieValue.split(".")
    if (!issuedAt || !signature) return false

    const issuedMs = parseInt(issuedAt, 10)
    if (isNaN(issuedMs)) return false
    if (Date.now() - issuedMs > ADMIN_COOKIE_TTL_MS) return false

    const expected = createHmac("sha256", secret)
      .update(`admin:${issuedAt}`)
      .digest("hex")

    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export function signPageAccessCookie(slug: string, passwordHash: string): string {
  const secret = getSecret()
  const issuedAt = Date.now().toString()
  const signature = createHmac("sha256", secret)
    .update(`page:${slug}:${passwordHash}:${issuedAt}`)
    .digest("hex")
  return `${issuedAt}.${signature}`
}

export function verifyPageAccessCookie(
  cookieValue: string,
  slug: string,
  passwordHash: string
): boolean {
  try {
    const secret = getSecret()
    const [issuedAt, signature] = cookieValue.split(".")
    if (!issuedAt || !signature) return false

    const expected = createHmac("sha256", secret)
      .update(`page:${slug}:${passwordHash}:${issuedAt}`)
      .digest("hex")

    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export function getAdminPassword(): string {
  return getSecret()
}
