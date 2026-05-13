import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { PositioningClient } from "./positioning-client"
import type { JobFitAssessment } from "@/lib/supabase/types"

export default async function PositioningPage({
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

  const { data: fingerprint } = await serviceClient
    .from("career_fingerprints")
    .select("*")
    .eq("case_id", caseId)
    .single()

  const { data: posData } = await serviceClient
    .from("positionings")
    .select("*")
    .eq("case_id", caseId)
    .order("selected", { ascending: false })
    .order("created_at", { ascending: true })

  const positionings = Array.isArray(posData) ? posData : posData ? [posData] : []

  const { data: cardsData } = await serviceClient
    .from("project_cards")
    .select("id,project_name")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  const cardsArr = Array.isArray(cardsData) ? cardsData : cardsData ? [cardsData] : []
  const projectMap: Record<string, string> = {}
  for (const card of cardsArr) {
    projectMap[card.id] = card.project_name || card.id
  }

  const { data: jdData } = await serviceClient
    .from("job_descriptions")
    .select("id")
    .eq("case_id", caseId)
    .single()

  const hasJD = !!jdData
  const hasCards = cardsArr.length > 0

  const { data: fitData } = await serviceClient
    .from("job_fit_assessments")
    .select("*")
    .eq("case_id", caseId)
    .single()

  return (
    <PositioningClient
      caseId={caseId}
      candidateName={caseData.candidate_name}
      targetRole={caseData.target_role}
      hasJD={hasJD}
      hasCards={hasCards}
      fingerprint={fingerprint ?? null}
      positionings={positionings}
      projectMap={projectMap}
      jobFitAssessment={fitData as JobFitAssessment | null}
    />
  )
}
