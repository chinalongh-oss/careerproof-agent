import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { JobFitAssessmentSchema } from "@/lib/schemas"
import { EVALUATE_JOB_FIT_USER_PROMPT } from "@/lib/prompts/agents/evaluate-job-fit"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

export async function evaluateJobFit(caseId: string) {
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
  if (cardsArr.length === 0) {
    return { success: false, error: "请先生成项目证据卡" }
  }

  const { data: jd, error: jdError } = await serviceClient
    .from("job_descriptions")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (jdError || !jd) {
    return { success: false, error: "请先解析 JD" }
  }

  const { data: documents, error: docsError } = await serviceClient
    .from("documents")
    .select("id,type,raw_text,file_name")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  if (docsError) {
    return { success: false, error: `读取文档失败：${normalizeError(docsError)}` }
  }
  const docsArr = Array.isArray(documents) ? documents : documents ? [documents] : []

  let profileStr: string
  let cardsStr: string
  let jdStr: string
  let docsStr: string

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
      hidden_requirements: (jd as Record<string, unknown>).hidden_requirements,
      keywords: (jd as Record<string, unknown>).keywords,
      resume_strategy: (jd as Record<string, unknown>).resume_strategy,
    }
    jdStr = JSON.stringify(trimmedJD, null, 2)

    const trimmedDocs = docsArr.map((d: Record<string, unknown>) => ({
      type: d.type,
      file_name: d.file_name,
      raw_text: typeof d.raw_text === "string" ? (d.raw_text as string).slice(0, 3000) : null,
    }))
    docsStr = JSON.stringify(trimmedDocs, null, 2)
  } catch {
    return { success: false, error: "输入数据格式异常" }
  }

  const userPrompt = EVALUATE_JOB_FIT_USER_PROMPT
    .replace("{{candidate_profile}}", profileStr)
    .replace("{{project_cards}}", cardsStr)
    .replace("{{job_description}}", jdStr)
    .replace("{{documents}}", docsStr)

  const result = await generateStructuredOutput({
    agent_name: "evaluate_job_fit",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.EVALUATE_JOB_FIT,
    user_prompt: userPrompt,
    schema_name: "job_fit_assessment",
    schema: JobFitAssessmentSchema,
    max_tokens: 4096,
  })

  if ("error" in result) {
    return { success: false, error: `岗位适配判断失败：${result.error}` }
  }

  const fitData = result.data

  const { data: existing } = await serviceClient
    .from("job_fit_assessments")
    .select("id")
    .eq("case_id", caseId)
    .limit(1)

  const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : []

  if (existingArr.length > 0) {
    const { error: updateError } = await serviceClient
      .from("job_fit_assessments")
      .update({
        fit_score: fitData.fit_score,
        fit_level: fitData.fit_level,
        summary: fitData.summary,
        matched_requirements: fitData.matched_requirements as unknown as Record<string, unknown> | null,
        partially_matched_requirements: fitData.partially_matched_requirements as unknown as Record<string, unknown> | null,
        missing_requirements: fitData.missing_requirements as unknown as Record<string, unknown> | null,
        hard_gaps: fitData.hard_gaps as unknown as Record<string, unknown> | null,
        transferable_capabilities: fitData.transferable_capabilities as unknown as Record<string, unknown> | null,
        overfit_risks: fitData.overfit_risks as unknown as Record<string, unknown> | null,
        recommended_delivery_mode: fitData.recommended_delivery_mode,
        safe_positioning_statement: fitData.safe_positioning_statement ?? null,
        unsafe_positioning_statement: fitData.unsafe_positioning_statement ?? null,
        alternative_roles: fitData.alternative_roles as unknown as Record<string, unknown> | null,
        evidence_to_collect: fitData.evidence_to_collect as unknown as Record<string, unknown> | null,
      })
      .eq("case_id", caseId)

    if (updateError) {
      return { success: false, error: `保存岗位适配结果失败：${normalizeError(updateError)}` }
    }
  } else {
    const { error: insertError } = await serviceClient
      .from("job_fit_assessments")
      .insert({
        case_id: caseId,
        fit_score: fitData.fit_score,
        fit_level: fitData.fit_level,
        summary: fitData.summary,
        matched_requirements: fitData.matched_requirements as unknown as Record<string, unknown> | null,
        partially_matched_requirements: fitData.partially_matched_requirements as unknown as Record<string, unknown> | null,
        missing_requirements: fitData.missing_requirements as unknown as Record<string, unknown> | null,
        hard_gaps: fitData.hard_gaps as unknown as Record<string, unknown> | null,
        transferable_capabilities: fitData.transferable_capabilities as unknown as Record<string, unknown> | null,
        overfit_risks: fitData.overfit_risks as unknown as Record<string, unknown> | null,
        recommended_delivery_mode: fitData.recommended_delivery_mode,
        safe_positioning_statement: fitData.safe_positioning_statement ?? null,
        unsafe_positioning_statement: fitData.unsafe_positioning_statement ?? null,
        alternative_roles: fitData.alternative_roles as unknown as Record<string, unknown> | null,
        evidence_to_collect: fitData.evidence_to_collect as unknown as Record<string, unknown> | null,
      })

    if (insertError) {
      return { success: false, error: `保存岗位适配结果失败：${normalizeError(insertError)}` }
    }
  }

  return {
    success: true,
    message: `岗位适配判断完成：fit_level = ${fitData.fit_level}，推荐交付模式 = ${fitData.recommended_delivery_mode}`,
    fitLevel: fitData.fit_level,
    deliveryMode: fitData.recommended_delivery_mode,
  }
}
