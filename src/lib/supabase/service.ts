import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set")
    }
    if (!serviceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set")
    }

    _client = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })
  }
  return _client
}

const _handler: ProxyHandler<object> = {
  get(_, prop) {
    const client = getClient()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(client) : value
  },
}

export const serviceClient = new Proxy({}, _handler) as SupabaseClient

export function normalizeError(error: unknown): string {
  if (!error) return "未知错误"
  if (typeof error === "string") return error
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}
