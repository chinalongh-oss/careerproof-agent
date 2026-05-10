import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { EvidenceClient } from "./evidence-client"

type CardRow = {
  id: string
  case_id: string
  project_name: string | null
  business_context: string | null
  business_problem: string | null
  candidate_role: string | null
  personal_actions: unknown
  team_actions: unknown
  metrics: unknown
  result_summary: string | null
  evidence_level: string | null
  public_visibility: string | null
  risk_flags: unknown
  role_angle_tags: unknown
  reader_lens_tags: unknown
  recommended_expression: string | null
  not_recommended_expression: string | null
  interview_risks: unknown
  is_featured: boolean
  created_at: string
  updated_at: string
}

export default async function EvidencePage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params

  const { data: caseData } = await serviceClient
    .from("cases")
    .select("id,candidate_name,target_role,status")
    .eq("id", caseId)
    .single()

  if (!caseData) notFound()
  const c = caseData

  const { data: cardsData } = await serviceClient
    .from("project_cards")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  const cards: CardRow[] = Array.isArray(cardsData)
    ? cardsData as CardRow[]
    : cardsData
    ? [cardsData as CardRow]
    : []

  return (
    <EvidenceClient
      caseId={caseId}
      candidateName={c.candidate_name}
      targetRole={c.target_role}
      initialCards={cards}
    />
  )
}
