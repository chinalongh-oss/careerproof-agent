import "server-only"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

function randomSuffix(length = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function sanitizeForSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function generateSlug(candidateName: string | null): string {
  const base = candidateName ? sanitizeForSlug(candidateName) : ""
  const stem = base.length > 0 ? base : "candidate"
  return `${stem}-${randomSuffix()}`
}

export function validateSlug(slug: string): string | null {
  if (!slug || slug.length < 3) {
    return "slug 至少需要 3 个字符"
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return "slug 只能包含小写字母、数字和短横线，且不能以短横线开头或结尾"
  }
  return null
}

export async function checkSlugUnique(slug: string, excludeCaseId?: string): Promise<boolean> {
  let query = serviceClient
    .from("public_pages")
    .select("id,case_id")
    .eq("slug", slug)

  if (excludeCaseId) {
    query = query.neq("case_id", excludeCaseId)
  }

  const { data, error } = await query.limit(1)

  if (error) {
    throw new Error(`检查 slug 唯一性失败：${normalizeError(error)}`)
  }

  return !data || data.length === 0
}
