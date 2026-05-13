import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { ProfilePageRenderer } from "@/components/profile/profile-page-renderer"
import type { ProfilePageData } from "@/components/profile/profile-page-renderer"
import type { Database } from "@/lib/supabase/types"
import { verifyPageAccessCookie } from "@/lib/auth"
import { PublicPagePasswordGate } from "./password-gate"

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const supabase = await createClient()

  const { data: page } = await supabase
    .from("public_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!page) notFound()

  const row = page as Database["public"]["Tables"]["public_pages"]["Row"]

  if (row.password_hash) {
    const cookieStore = await cookies()
    const accessCookie = cookieStore.get(`page_access_${slug}`)

    if (!accessCookie?.value) {
      return <PublicPagePasswordGate slug={slug} />
    }

    const verified = verifyPageAccessCookie(accessCookie.value, slug, row.password_hash)
    if (!verified) {
      return <PublicPagePasswordGate slug={slug} />
    }
  }

  const pageContent = (row.page_content ?? {}) as Record<string, unknown>
  const profileData: ProfilePageData = pageContent as unknown as ProfilePageData

  return (
    <ProfilePageRenderer
      data={profileData}
      selectedTheme={row.selected_theme ?? "minimal"}
      trustLevel={null}
      trustReason={undefined}
    />
  )
}
