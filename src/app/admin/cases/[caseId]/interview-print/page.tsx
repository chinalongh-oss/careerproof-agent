import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { InterviewPrintView } from "@/components/interview/interview-print-view"

export const dynamic = "force-dynamic"

export default async function InterviewPrintPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params

  const { data: caseData } = await serviceClient
    .from("cases")
    .select("candidate_name,target_role")
    .eq("id", caseId)
    .single()

  if (!caseData) notFound()

  const { data: outputsData } = await serviceClient
    .from("generated_outputs")
    .select("content,version,created_at")
    .eq("case_id", caseId)
    .eq("output_type", "interview_pack")
    .order("version", { ascending: false })
    .limit(1)

  const outputsArr = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []
  const pack = outputsArr[0] ?? null

  return (
    <InterviewPrintView
      candidateName={caseData.candidate_name}
      targetRole={caseData.target_role}
      content={(pack?.content as Record<string, unknown> | null) ?? null}
      version={pack?.version ?? 0}
      createdAt={pack?.created_at ?? new Date().toISOString()}
    />
  )
}
