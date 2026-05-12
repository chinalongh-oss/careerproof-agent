import { Suspense } from "react"
import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { InterviewClient } from "./interview-client"

export default async function InterviewPage({
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
    .select("*")
    .eq("case_id", caseId)
    .eq("output_type", "interview_pack")
    .order("version", { ascending: false })
    .limit(1)

  const outputsArr = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []
  const interviewPack = outputsArr[0] ?? null

  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">加载中...</div>}>
      <InterviewClient
        caseId={caseId}
        candidateName={caseData.candidate_name}
        targetRole={caseData.target_role}
        interviewPack={interviewPack}
      />
    </Suspense>
  )
}
