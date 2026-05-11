import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfilePageRenderer } from "@/components/profile/profile-page-renderer"
import type { ProfilePageData } from "@/components/profile/profile-page-renderer"
import { TrustLevel } from "@/components/profile/shared/trust-badge"
import type { Database } from "@/lib/supabase/types"

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
  const pageContent = (row.page_content ?? {}) as Record<string, unknown>
  const profileData: ProfilePageData = pageContent as unknown as ProfilePageData

  const trustLevel = (pageContent._computed_trust_level as TrustLevel) ?? "需说明"
  const trustReason = pageContent._computed_trust_reason as string | undefined

  return (
    <ProfilePageRenderer
      data={profileData}
      selectedTheme={row.selected_theme ?? "minimal"}
      trustLevel={trustLevel}
      trustReason={trustReason}
    />
  )
}
