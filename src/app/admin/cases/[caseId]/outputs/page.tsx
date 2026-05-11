import { Suspense } from "react"
import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { OutputsClient } from "./outputs-client"

export default async function OutputsPage({
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
    .order("version", { ascending: false })

  const allOutputs = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []

  const resumeOutput = allOutputs.find((o) => o.output_type === "resume_markdown") ?? null
  const profileOutput = allOutputs.find((o) => o.output_type === "profile_page") ?? null

  const { data: publicPage } = await serviceClient
    .from("public_pages")
    .select("*")
    .eq("case_id", caseId)
    .limit(1)

  const publicPagesArr = Array.isArray(publicPage) ? publicPage : publicPage ? [publicPage] : []
  const currentPublicPage = publicPagesArr[0] ?? null

  return (
    <Suspense fallback={<div className="py-12 text-center text-muted-foreground">加载中...</div>}>
      <OutputsClient
        caseId={caseId}
        candidateName={caseData.candidate_name}
        targetRole={caseData.target_role}
        resumeOutput={resumeOutput}
        profileOutput={profileOutput}
        publicPage={currentPublicPage}
      />
    </Suspense>
  )
}
