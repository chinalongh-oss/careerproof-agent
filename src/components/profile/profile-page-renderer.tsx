import { MinimalProfile } from "./themes/minimal-profile"
import { ProfessionalProfile } from "./themes/professional-profile"
import { HeadhunterQuickviewProfile } from "./themes/headhunter-quickview-profile"
import { TrustLevel } from "./shared/trust-badge"

export interface ProfilePageData {
  hero?: {
    name?: string
    positioning_title?: string
    one_line_value?: string
  }
  target_roles?: string[]
  core_capabilities?: string[]
  evidence_highlights?: Array<{
    metric?: string
    description?: string
  }>
  featured_projects?: Array<{
    name?: string
    context?: string
    contribution?: string
    result?: string
  }>
  work_experiences?: Array<{
    company?: string
    role?: string
    period?: string
    highlights?: string[]
  }>
  career_fingerprint?: {
    career_axis?: string
    secondary_axis?: string
    differentiation_summary?: string
  }
  trust_notes?: string[]
  downloadable_resume?: boolean
  contact?: {
    email?: string
    wechat?: string
    linkedin?: string
  }
  markdown?: string
}

interface ProfilePageRendererProps {
  data: ProfilePageData | null
  selectedTheme: string
  trustLevel?: TrustLevel | null
  trustReason?: string
}

export function ProfilePageRenderer({ data, selectedTheme, trustLevel, trustReason }: ProfilePageRendererProps) {
  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-muted-foreground">
        <p>主页内容暂未生成</p>
      </div>
    )
  }

  const theme = selectTheme(selectedTheme, data)

  switch (theme) {
    case "professional":
      return <ProfessionalProfile data={data} trustLevel={trustLevel ?? null} trustReason={trustReason} />
    case "headhunter_quickview":
      return <HeadhunterQuickviewProfile data={data} trustLevel={trustLevel ?? null} trustReason={trustReason} />
    case "minimal":
    default:
      return <MinimalProfile data={data} trustLevel={trustLevel ?? null} trustReason={trustReason} />
  }
}

function selectTheme(selected: string, data: ProfilePageData): string {
  if (selected === "professional" || selected === "headhunter_quickview" || selected === "minimal") {
    return selected
  }
  const aiTheme = (data as Record<string, unknown>).theme as string | undefined
  if (aiTheme === "professional" || aiTheme === "headhunter_quickview" || aiTheme === "minimal") {
    return aiTheme
  }
  return "minimal"
}
