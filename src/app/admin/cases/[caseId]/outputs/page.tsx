import { Suspense } from "react"
import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { OutputsClient } from "./outputs-client"
import type { JobFitAssessment, SelectedDeliveryTarget } from "@/lib/supabase/types"

export default async function OutputsPage({
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

  const { data: outputsData } = await serviceClient
    .from("generated_outputs")
    .select("*")
    .eq("case_id", caseId)
    .order("version", { ascending: false })

  const allOutputs = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []

  const resumeOutput = allOutputs.find((o) => o.output_type === "resume_markdown") ?? null
  const profileOutput = allOutputs.find((o) => o.output_type === "profile_page") ?? null
  const interviewPack = allOutputs.find((o) => o.output_type === "interview_pack") ?? null

  const { data: publicPage } = await serviceClient
    .from("public_pages")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(1)

  const publicPagesArr = Array.isArray(publicPage) ? publicPage : publicPage ? [publicPage] : []
  const currentPublicPage = publicPagesArr[0] ?? null

  const { data: artifactsData } = await serviceClient
    .from("export_artifacts")
    .select("*")
    .eq("case_id", caseId)
    .eq("artifact_type", "resume_pdf")
    .order("created_at", { ascending: false })
    .limit(1)

  const artifactsArr = Array.isArray(artifactsData) ? artifactsData : artifactsData ? [artifactsData] : []
  const recentArtifact = artifactsArr[0] ?? null

  const { data: jdData } = await serviceClient
    .from("job_descriptions")
    .select("id,case_id,role_name,keywords,core_responsibilities,required_skills,hidden_requirements,resume_strategy,interview_focus")
    .eq("case_id", caseId)
    .single()

  const targetRole = (jdData as Record<string, unknown> | null)?.role_name as string | undefined
    ?? (caseData as Record<string, unknown>).target_role as string | undefined
    ?? null

  const { data: fitData } = await serviceClient
    .from("job_fit_assessments")
    .select("*")
    .eq("case_id", caseId)
    .single()

  const { data: dtData } = await serviceClient
    .from("selected_delivery_targets")
    .select("*")
    .eq("case_id", caseId)

  const deliveryTargets = Array.isArray(dtData) ? dtData as SelectedDeliveryTarget[] : dtData ? [dtData as SelectedDeliveryTarget] : []

  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">加载中...</div>}>
      <OutputsClient
        caseId={caseId}
        candidateName={caseData.candidate_name}
        targetRole={targetRole}
        caseStatus={(caseData as Record<string, unknown>).status as string}
        resumeOutput={resumeOutput}
        profileOutput={profileOutput}
        publicPage={currentPublicPage}
        recentArtifact={recentArtifact}
        interviewPack={interviewPack}
        jdData={jdData}
        jobFitAssessment={fitData as JobFitAssessment | null}
        deliveryTargets={deliveryTargets}
      />
    </Suspense>
  )
}
