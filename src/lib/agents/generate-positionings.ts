import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { PositioningsOutputSchema } from "@/lib/schemas"
import { GENERATE_POSITIONING_USER_PROMPT } from "@/lib/prompts/agents/generate-positioning"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

export async function generatePositionings(caseId: string) {
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

  const { data: fingerprint, error: fpError } = await serviceClient
    .from("career_fingerprints")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (fpError || !fingerprint) {
    return { success: false, error: "未找到职业指纹，请先生成职业指纹" }
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

  let fpStr: string
  try {
    fpStr = JSON.stringify(fingerprint, null, 2)
  } catch {
    return { success: false, error: "职业指纹数据格式异常" }
  }

  const userPrompt = GENERATE_POSITIONING_USER_PROMPT
    .replace("{{project_cards}}", cardsStr)
    .replace("{{job_description}}", jdStr)
    .replace("{{career_fingerprint}}", fpStr)

  const result = await generateStructuredOutput({
    agent_name: "generate_positionings",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.GENERATE_POSITIONING,
    user_prompt: userPrompt,
    schema_name: "positionings",
    schema: PositioningsOutputSchema,
    max_tokens: 8192,
  })

  if ("error" in result) {
    return { success: false, error: `职业定位生成失败：${result.error}` }
  }

  const positionings = result.data.positionings

  if (!positionings || !Array.isArray(positionings) || positionings.length === 0) {
    return { success: false, error: "AI 未生成任何职业定位" }
  }

  if (positionings.length !== 3) {
    return { success: false, error: `AI 应生成恰好 3 条定位，实际生成了 ${positionings.length} 条` }
  }

  const validCardIds = new Set(cardsArr.map((c: { id: string }) => c.id))

  for (let i = 0; i < positionings.length; i++) {
    const p = positionings[i]
    if (Array.isArray(p.recommended_projects)) {
      const invalid = p.recommended_projects.filter((id: string) => !validCardIds.has(id))
      if (invalid.length > 0) {
        return {
          success: false,
          error: `第 ${i + 1} 条定位的 recommended_projects 包含不存在的 project id: ${invalid.join(", ")}`,
        }
      }
    }
    if (Array.isArray(p.weak_projects)) {
      const invalid = p.weak_projects.filter((id: string) => !validCardIds.has(id))
      if (invalid.length > 0) {
        return {
          success: false,
          error: `第 ${i + 1} 条定位的 weak_projects 包含不存在的 project id: ${invalid.join(", ")}`,
        }
      }
    }
  }

  const positionsToInsert = positionings.map((p) => ({
    case_id: caseId,
    version_name: p.version_name ?? null,
    target_reader: p.target_reader ?? null,
    career_axis: p.career_axis ?? null,
    secondary_axis: p.secondary_axis ?? null,
    one_line_summary: p.one_line_summary ?? null,
    value_summary: p.value_summary ?? null,
    tone_tags: p.tone_tags ?? null,
    recommended_projects: p.recommended_projects ?? null,
    weak_projects: p.weak_projects ?? null,
    risks: p.risks ?? null,
    selected: false,
  }))

  const { error: deleteError } = await serviceClient
    .from("positionings")
    .delete()
    .eq("case_id", caseId)

  if (deleteError) {
    return { success: false, error: `清除旧定位数据失败：${normalizeError(deleteError)}` }
  }

  const { error: insertError } = await serviceClient
    .from("positionings")
    .insert(positionsToInsert)

  if (insertError) {
    return { success: false, error: `保存职业定位失败：${normalizeError(insertError)}` }
  }

  const { error: statusError } = await serviceClient
    .from("cases")
    .update({ status: "positioning_ready", updated_at: new Date().toISOString() })
    .eq("id", caseId)

  if (statusError) {
    return { success: false, error: `更新案例状态失败：${normalizeError(statusError)}` }
  }

  return { success: true, message: `已生成 ${positionsToInsert.length} 条职业定位` }
}
