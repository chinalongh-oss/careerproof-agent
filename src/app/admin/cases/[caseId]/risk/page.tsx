import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { RiskClient } from "./risk-client"

export default async function RiskPage({
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

  const { data: riskData } = await serviceClient
    .from("risk_issues")
    .select("*")
    .eq("case_id", caseId)
    .order("risk_level", { ascending: false })
    .order("created_at", { ascending: false })

  const risks = Array.isArray(riskData) ? riskData : riskData ? [riskData] : []

  const hasOutputs = caseData.status === "outputs_ready" ||
    caseData.status === "risk_reviewed" ||
    caseData.status === "interview_ready" ||
    caseData.status === "delivered"

  return (
    <RiskClient
      caseId={caseId}
      candidateName={caseData.candidate_name}
      targetRole={caseData.target_role}
      risks={risks}
      hasOutputs={hasOutputs}
    />
  )
}
