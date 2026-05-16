import "server-only"

const ADMIN_COOKIE_TTL_MS = 24 * 60 * 60 * 1000

function getSecret(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) {
    throw new Error("ADMIN_PASSWORD environment variable is not set")
  }
  return secret
}

async function hmacSha256(key: string, data: string): Promise<string> {
  const enc = new TextEncoder()
  const keyData = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", keyData, enc.encode(data))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export async function signAdminCookie(): Promise<string> {
  const secret = getSecret()
  const issuedAt = Date.now().toString()
  const signature = await hmacSha256(secret, `admin:${issuedAt}`)
  return `${issuedAt}.${signature}`
}

export async function verifyAdminCookie(cookieValue: string): Promise<boolean> {
  try {
    const secret = getSecret()
    const [issuedAt, signature] = cookieValue.split(".")
    if (!issuedAt || !signature) return false

    const issuedMs = parseInt(issuedAt, 10)
    if (isNaN(issuedMs)) return false
    if (Date.now() - issuedMs > ADMIN_COOKIE_TTL_MS) return false

    const expected = await hmacSha256(secret, `admin:${issuedAt}`)
    return timingSafeEqualStr(signature, expected)
  } catch {
    return false
  }
}

export async function signPageAccessCookie(slug: string, passwordHash: string): Promise<string> {
  const secret = getSecret()
  const issuedAt = Date.now().toString()
  const signature = await hmacSha256(secret, `page:${slug}:${passwordHash}:${issuedAt}`)
  return `${issuedAt}.${signature}`
}

export async function verifyPageAccessCookie(
  cookieValue: string,
  slug: string,
  passwordHash: string
): Promise<boolean> {
  try {
    const secret = getSecret()
    const [issuedAt, signature] = cookieValue.split(".")
    if (!issuedAt || !signature) return false

    const expected = await hmacSha256(secret, `page:${slug}:${passwordHash}:${issuedAt}`)
    return timingSafeEqualStr(signature, expected)
  } catch {
    return false
  }
}

export function getAdminPassword(): string {
  return getSecret()
}
