import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { ResumeQualityAssessmentSchema } from "@/lib/schemas"
import { GENERATE_QUALITY_REVIEW_USER_PROMPT } from "@/lib/prompts/agents/generate-quality-review"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

export async function generateQualityReview(caseId: string) {
  const { data: documents, error: docsError } = await serviceClient
    .from("documents")
    .select("id,type,raw_text,file_name")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  if (docsError) {
    return { success: false, error: `读取文档失败：${normalizeError(docsError)}` }
  }
  const docsArr = Array.isArray(documents) ? documents : documents ? [documents] : []
  const oldResumeDoc = docsArr.find((d) => d.type === "resume")
  const oldResumeText = typeof oldResumeDoc?.raw_text === "string" ? oldResumeDoc.raw_text : ""

  const { data: outputsData } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,output_type,delivery_variant_key,is_current")
    .eq("case_id", caseId)
    .eq("output_type", "resume_markdown")
    .eq("is_current", true)
    .order("version", { ascending: false })

  const outputsArr = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []
  const newResumeMarkdown = outputsArr.length > 0 ? (outputsArr[0] as Record<string, unknown>).markdown as string ?? "" : ""

  if (!newResumeMarkdown) {
    return { success: false, error: "请先生成新版简历" }
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("candidate_profiles")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "请先解析简历" }
  }

  const { data: cards, error: cardsError } = await serviceClient
    .from("project_cards")
    .select("id,project_name,business_context,business_problem,candidate_role,personal_actions,team_actions,metrics,result_summary,evidence_level")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  if (cardsError) {
    return { success: false, error: `读取项目证据卡失败：${normalizeError(cardsError)}` }
  }
  const cardsArr = Array.isArray(cards) ? cards : cards ? [cards] : []

  const { data: jd, error: jdError } = await serviceClient
    .from("job_descriptions")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (jdError || !jd) {
    return { success: false, error: "请先解析 JD" }
  }

  const { data: fitData } = await serviceClient
    .from("job_fit_assessments")
    .select("*")
    .eq("case_id", caseId)
    .single()

  let profileStr: string
  let cardsStr: string
  let jdStr: string
  let fitStr: string

  try {
    const trimmedProfile = {
      personal_info: (profile as Record<string, unknown>).personal_info,
      education: (profile as Record<string, unknown>).education,
      work_experiences: (profile as Record<string, unknown>).work_experiences,
      skills: (profile as Record<string, unknown>).skills,
      metrics: (profile as Record<string, unknown>).metrics,
    }
    profileStr = JSON.stringify(trimmedProfile, null, 2)

    const trimmedCards = cardsArr.map((c: Record<string, unknown>) => ({
      id: c.id,
      project_name: c.project_name,
      business_context: c.business_context,
      business_problem: c.business_problem,
      candidate_role: c.candidate_role,
      personal_actions: c.personal_actions,
      team_actions: c.team_actions,
      metrics: c.metrics,
      result_summary: c.result_summary,
      evidence_level: c.evidence_level,
    }))
    cardsStr = JSON.stringify(trimmedCards, null, 2)

    const trimmedJD = {
      role_name: (jd as Record<string, unknown>).role_name,
      company_type: (jd as Record<string, unknown>).company_type,
      seniority_level: (jd as Record<string, unknown>).seniority_level,
      core_responsibilities: (jd as Record<string, unknown>).core_responsibilities,
      required_skills: (jd as Record<string, unknown>).required_skills,
      keywords: (jd as Record<string, unknown>).keywords,
      resume_strategy: (jd as Record<string, unknown>).resume_strategy,
    }
    jdStr = JSON.stringify(trimmedJD, null, 2)

    fitStr = JSON.stringify(fitData ?? {}, null, 2)
  } catch {
    return { success: false, error: "输入数据格式异常" }
  }

  const userPrompt = GENERATE_QUALITY_REVIEW_USER_PROMPT
    .replace("{{old_resume_text}}", oldResumeText)
    .replace("{{new_resume_markdown}}", newResumeMarkdown)
    .replace("{{candidate_profile}}", profileStr)
    .replace("{{project_cards}}", cardsStr)
    .replace("{{job_description}}", jdStr)
    .replace("{{job_fit_assessment}}", fitStr)

  const result = await generateStructuredOutput({
    agent_name: "generate_quality_review",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.GENERATE_QUALITY_REVIEW,
    user_prompt: userPrompt,
    schema_name: "resume_quality_assessment",
    schema: ResumeQualityAssessmentSchema,
    max_tokens: 8192,
  })

  if ("error" in result) {
    return { success: false, error: `质量评审生成失败：${result.error}` }
  }

  const data = result.data

  const { data: existing } = await serviceClient
    .from("resume_quality_assessments")
    .select("id")
    .eq("case_id", caseId)
    .limit(1)

  const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : []
  const existingId = existingArr.length > 0 ? (existingArr[0] as Record<string, unknown>).id as string : null

  const rowData = {
    case_id: caseId,
    old_resume_score: data.old_resume_score as unknown as Record<string, unknown> | null ?? null,
    new_resume_score: data.new_resume_score as unknown as Record<string, unknown> | null ?? null,
    score_delta: data.score_delta as unknown as Record<string, unknown> | null ?? null,
    overall_conclusion: data.overall_conclusion,
    recommendation_level: data.recommendation_level,
    improved_points: data.improved_points as unknown as Record<string, unknown> | null ?? null,
    regressed_points: data.regressed_points as unknown as Record<string, unknown> | null ?? null,
    new_risks: data.new_risks as unknown as Record<string, unknown> | null ?? null,
    usage_suggestions: data.usage_suggestions as unknown as Record<string, unknown> | null ?? null,
    user_decision: "pending",
    updated_at: new Date().toISOString(),
  }

  let saveError = null

  if (existingId) {
    const { error: updateError } = await serviceClient
      .from("resume_quality_assessments")
      .update(rowData)
      .eq("id", existingId)

    saveError = updateError
  } else {
    const { error: insertError } = await serviceClient
      .from("resume_quality_assessments")
      .insert(rowData)

    saveError = insertError
  }

  if (saveError) {
    return { success: false, error: `保存质量评审失败：${normalizeError(saveError)}` }
  }

  return {
    success: true,
    message: "新旧简历质量对比评审完成",
  }
}
