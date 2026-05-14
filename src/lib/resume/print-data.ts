import { serviceClient } from "@/lib/supabase/service"
import { normalizePersonalInfo, type CaseContactFields } from "@/lib/resume/personal-info"

export type ResumePrintData = {
  markdown: string
  personalInfo: ReturnType<typeof normalizePersonalInfo>
  version: number
  createdAt: string
} | null

export async function getResumePrintData(caseId: string, outputId?: string): Promise<ResumePrintData> {
  const { data: caseData } = await serviceClient
    .from("cases")
    .select("candidate_name,email,wechat,current_title,target_role,target_direction")
    .eq("id", caseId)
    .single()

  if (!caseData) return null

  let resume: { id: string; markdown: string | null; version: number; title: string | null; created_at: string } | null = null

  if (outputId) {
    const { data: singleOutput } = await serviceClient
      .from("generated_outputs")
      .select("id,markdown,version,title,created_at")
      .eq("id", outputId)
      .eq("case_id", caseId)
      .eq("output_type", "resume_markdown")
      .single()

    resume = singleOutput as typeof resume | null
  }

  if (!resume) {
    const { data: outputsData } = await serviceClient
      .from("generated_outputs")
      .select("id,markdown,version,title,created_at")
      .eq("case_id", caseId)
      .eq("output_type", "resume_markdown")
      .order("version", { ascending: false })
      .limit(1)

    const outputsArr = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []
    resume = outputsArr[0] ?? null
  }

  if (!resume || !resume.markdown) return null

  const { data: profileData } = await serviceClient
    .from("candidate_profiles")
    .select("personal_info")
    .eq("case_id", caseId)
    .single()

  const personalInfoRaw = (profileData as Record<string, unknown> | null)?.personal_info as Record<string, unknown> | null

  let resolvedTargetRole = (caseData as Record<string, unknown>).target_role as string | null

  if (resume.title) {
    const altMatch = resume.title.match(/【替代岗位[：:]\s*(.+?)】/)
    if (altMatch) {
      resolvedTargetRole = altMatch[1].trim()
    }
  }

  const caseFields: CaseContactFields = {
    candidate_name: (caseData as Record<string, unknown>).candidate_name as string | null,
    email: (caseData as Record<string, unknown>).email as string | null,
    wechat: (caseData as Record<string, unknown>).wechat as string | null,
    current_title: (caseData as Record<string, unknown>).current_title as string | null,
    target_role: resolvedTargetRole,
    target_direction: (caseData as Record<string, unknown>).target_direction as string | null,
  }

  const personalInfo = normalizePersonalInfo(personalInfoRaw, caseFields, resume.markdown)

  return {
    markdown: resume.markdown,
    personalInfo,
    version: resume.version,
    createdAt: resume.created_at,
  }
}
