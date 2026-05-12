import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { ResumePrintView } from "@/components/resume/resume-print-view"
import { normalizePersonalInfo, type CaseContactFields } from "@/lib/resume/personal-info"

export const dynamic = "force-dynamic"

export default async function PrintResumePage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params

  const { data: caseData } = await serviceClient
    .from("cases")
    .select("candidate_name,email,wechat,current_title,target_role,target_direction")
    .eq("id", caseId)
    .single()

  if (!caseData) notFound()

  const { data: outputsData } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,version,created_at")
    .eq("case_id", caseId)
    .eq("output_type", "resume_markdown")
    .order("version", { ascending: false })
    .limit(1)

  const outputsArr = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []
  const resume = outputsArr[0] ?? null

  if (!resume || !resume.markdown) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#666", margin: "0 0 8px" }}>
            请先生成简历内容
          </p>
          <p style={{ fontSize: "14px", color: "#999", margin: 0 }}>
            在交付物页面先生成简历 Markdown，然后刷新此页面。
          </p>
        </div>
      </div>
    )
  }

  const { data: profileData } = await serviceClient
    .from("candidate_profiles")
    .select("personal_info")
    .eq("case_id", caseId)
    .single()

  const personalInfoRaw = (profileData as Record<string, unknown> | null)?.personal_info as Record<string, unknown> | null

  const caseFields: CaseContactFields = {
    candidate_name: (caseData as Record<string, unknown>).candidate_name as string | null,
    email: (caseData as Record<string, unknown>).email as string | null,
    wechat: (caseData as Record<string, unknown>).wechat as string | null,
    current_title: (caseData as Record<string, unknown>).current_title as string | null,
    target_role: (caseData as Record<string, unknown>).target_role as string | null,
    target_direction: (caseData as Record<string, unknown>).target_direction as string | null,
  }

  const personalInfo = normalizePersonalInfo(personalInfoRaw, caseFields, resume.markdown)

  return (
    <ResumePrintView
      markdown={resume.markdown}
      personalInfo={personalInfo}
      version={resume.version}
      createdAt={resume.created_at}
    />
  )
}
