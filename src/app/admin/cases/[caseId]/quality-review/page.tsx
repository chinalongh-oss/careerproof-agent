import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { QualityReviewClient } from "./quality-review-client"
import type { ResumeQualityAssessment } from "@/lib/supabase/types"

export default async function QualityReviewPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params

  const { data: caseData } = await serviceClient
    .from("cases")
    .select("candidate_name,target_role,status")
    .eq("id", caseId)
    .single()

  if (!caseData) notFound()

  const { data: qualityData } = await serviceClient
    .from("resume_quality_assessments")
    .select("*")
    .eq("case_id", caseId)
    .limit(1)

  const qualityArr = Array.isArray(qualityData) ? qualityData : qualityData ? [qualityData] : []
  const qualityAssessment = qualityArr[0] as ResumeQualityAssessment | null ?? null

  const { data: documents } = await serviceClient
    .from("documents")
    .select("id,type,raw_text,file_name")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  const docsArr = Array.isArray(documents) ? documents : documents ? [documents] : []
  const oldResumeDoc = docsArr.find((d) => d.type === "resume") ?? null

  const { data: outputsData } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,output_type,title,delivery_variant_key,is_current")
    .eq("case_id", caseId)
    .eq("output_type", "resume_markdown")
    .eq("is_current", true)
    .order("version", { ascending: false })

  const outputsArr = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []

  const hasOutputs = caseData.status === "outputs_ready" ||
    caseData.status === "risk_reviewed" ||
    caseData.status === "interview_ready" ||
    caseData.status === "delivered"

  return (
    <QualityReviewClient
      caseId={caseId}
      candidateName={caseData.candidate_name}
      targetRole={caseData.target_role}
      caseStatus={(caseData as Record<string, unknown>).status as string}
      qualityAssessment={qualityAssessment}
      oldResumeDoc={oldResumeDoc}
      newResumeOutputs={outputsArr}
      hasOutputs={hasOutputs}
    />
  )
}
