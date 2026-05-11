import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { FingerprintSchema } from "@/lib/schemas"
import { GENERATE_FINGERPRINT_USER_PROMPT } from "@/lib/prompts/agents/generate-fingerprint"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

export async function generateCareerFingerprint(caseId: string) {
  const { data: profile, error: profileError } = await serviceClient
    .from("candidate_profiles")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "未找到候选人画像，请先解析简历" }
  }

  const { data: cards, error: cardsError } = await serviceClient
    .from("project_cards")
    .select("id,project_name")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  if (cardsError) {
    return { success: false, error: `读取项目证据卡失败：${normalizeError(cardsError)}` }
  }

  const cardsArr = Array.isArray(cards) ? cards : cards ? [cards] : []
  if (cardsArr.length === 0) {
    return { success: false, error: "未找到项目证据卡，请先生成项目证据卡" }
  }

  const { data: jd, error: jdError } = await serviceClient
    .from("job_descriptions")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (jdError || !jd) {
    return { success: false, error: "未找到 JD 解析结果，请先解析 JD" }
  }

  let profileStr: string
  try {
    profileStr = JSON.stringify(profile, null, 2)
  } catch {
    return { success: false, error: "候选人画像数据格式异常" }
  }

  let cardsStr: string
  try {
    cardsStr = JSON.stringify(cardsArr, null, 2)
  } catch {
    return { success: false, error: "项目证据卡数据格式异常" }
  }

  let jdStr: string
  try {
    jdStr = JSON.stringify(jd, null, 2)
  } catch {
    return { success: false, error: "JD 数据格式异常" }
  }

  const userPrompt = GENERATE_FINGERPRINT_USER_PROMPT
    .replace("{{candidate_profile}}", profileStr)
    .replace("{{project_cards}}", cardsStr)
    .replace("{{job_description}}", jdStr)

  const result = await generateStructuredOutput({
    agent_name: "generate_career_fingerprint",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.GENERATE_FINGERPRINT,
    user_prompt: userPrompt,
    schema_name: "fingerprint",
    schema: FingerprintSchema,
  })

  if ("error" in result) {
    return { success: false, error: `职业指纹生成失败：${result.error}` }
  }

  const data = result.data

  const validCardIds = new Set(cardsArr.map((c: { id: string }) => c.id))
  const signatureProjects = Array.isArray(data.signature_projects)
    ? data.signature_projects.filter((id: string) => validCardIds.has(id))
    : []

  const { error: upsertError } = await serviceClient
    .from("career_fingerprints")
    .upsert({
      case_id: caseId,
      career_axis: data.career_axis ?? null,
      secondary_axis: data.secondary_axis ?? null,
      decision_style: data.decision_style ?? null,
      expression_style: data.expression_style ?? null,
      differentiation_summary: data.differentiation_summary ?? null,
      signature_projects: signatureProjects,
      not_recommended_positioning: data.not_recommended_positioning ?? null,
    }, { onConflict: "case_id" })

  if (upsertError) {
    return { success: false, error: `保存职业指纹失败：${normalizeError(upsertError)}` }
  }

  const { error: statusError } = await serviceClient
    .from("cases")
    .update({ status: "fingerprint_ready", updated_at: new Date().toISOString() })
    .eq("id", caseId)

  if (statusError) {
    return { success: false, error: `更新案例状态失败：${normalizeError(statusError)}` }
  }

  return { success: true, message: "职业指纹生成完成" }
}
