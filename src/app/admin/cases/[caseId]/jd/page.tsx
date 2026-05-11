import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { JDClient } from "./jd-client"

export default async function JDPage({
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

  const { data: jdData } = await serviceClient
    .from("job_descriptions")
    .select("*")
    .eq("case_id", caseId)
    .single()

  return (
    <JDClient
      caseId={caseId}
      candidateName={caseData.candidate_name}
      targetRole={caseData.target_role}
      jdData={jdData ?? null}
    />
  )
}
