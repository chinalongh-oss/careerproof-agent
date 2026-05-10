import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { EvidenceCardsOutputSchema } from "@/lib/schemas"
import { BUILD_PROJECT_CARDS_USER_PROMPT } from "@/lib/prompts/agents/build-project-cards"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

export async function buildProjectCards(caseId: string) {
  const { data: docs, error: docsError } = await serviceClient
    .from("documents")
    .select("type,raw_text")
    .eq("case_id", caseId)

  if (docsError) {
    return { success: false, error: `读取文档失败：${normalizeError(docsError)}` }
  }

  const docsArr = Array.isArray(docs) ? docs : docs ? [docs] : []
  const resumeDoc = docsArr.find((d) => d.type === "resume")
  const materialDoc = docsArr.find((d) => d.type === "project_material")

  if (!resumeDoc?.raw_text) {
    return { success: false, error: "未找到简历文本，请先提交简历" }
  }

  const resumeText = resumeDoc.raw_text
  const materialText = materialDoc?.raw_text || "无额外项目材料"

  const { data: profile, error: profileError } = await serviceClient
    .from("candidate_profiles")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "未找到候选人画像，请先解析简历" }
  }

  let profileStr: string
  try {
    profileStr = JSON.stringify(profile, null, 2)
  } catch {
    return { success: false, error: "候选人画像数据格式异常" }
  }

  const userPrompt = BUILD_PROJECT_CARDS_USER_PROMPT
    .replace("{{candidate_profile}}", profileStr)
    .replace("{{resume_text}}", resumeText)
    .replace("{{project_material}}", materialText)

  const result = await generateStructuredOutput({
    agent_name: "build_project_cards",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.GENERATE_EVIDENCE,
    user_prompt: userPrompt,
    schema_name: "evidence_cards",
    schema: EvidenceCardsOutputSchema,
    max_tokens: 8192,
  })

  if ("error" in result) {
    return { success: false, error: `项目证据卡生成失败：${result.error}` }
  }

  const projects = result.data.projects

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return { success: false, error: "AI 未生成任何项目证据卡，请检查简历内容是否包含项目信息" }
  }

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i]
    if (!p.project_name) {
      return { success: false, error: `第 ${i + 1} 张证据卡缺少 project_name` }
    }
  }

  const cardsJson = projects.map((p) => ({
    project_name: p.project_name,
    business_context: p.business_context ?? null,
    business_problem: p.business_problem ?? null,
    candidate_role: p.candidate_role ?? null,
    personal_actions: p.personal_actions ?? null,
    team_actions: p.team_actions ?? null,
    metrics: p.metrics ?? null,
    result_summary: p.result_summary ?? null,
    evidence_level: p.evidence_level ?? null,
    public_visibility: p.public_visibility ?? null,
    risk_flags: p.risk_flags ?? null,
    role_angle_tags: p.role_angle_tags ?? null,
    reader_lens_tags: p.reader_lens_tags ?? null,
    recommended_expression: p.recommended_expression ?? null,
    not_recommended_expression: p.not_recommended_expression ?? null,
    interview_risks: p.interview_risks ?? null,
    is_featured: false,
  }))

  const { data: rpcResult, error: rpcError } = await serviceClient
    .rpc("replace_project_cards", {
      p_case_id: caseId,
      p_cards: cardsJson,
    })

  if (rpcError) {
    return { success: false, error: `保存证据卡失败：${normalizeError(rpcError)}` }
  }

  const rpcData = rpcResult as { ok: boolean; inserted: number } | null
  const insertedCount = rpcData?.inserted ?? projects.length

  return { success: true, message: `已生成 ${insertedCount} 张项目证据卡` }
}
