import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS, PROMPT_VERSION } from "@/lib/prompt"
import { ResumeOutputSchema, ProfilePageSchema } from "@/lib/schemas"
import { GENERATE_RESUME_OUTPUT_USER_PROMPT } from "@/lib/prompts/agents/generate-resume-output"
import { GENERATE_PROFILE_PAGE_USER_PROMPT } from "@/lib/prompts/agents/generate-profile-page"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

export async function generateOutputs(caseId: string, forceRegenerate = false) {
  const { data: existingOutputs } = await serviceClient
    .from("generated_outputs")
    .select("output_type,version,title,markdown,content,created_at")
    .eq("case_id", caseId)
    .order("version", { ascending: false })

  const outputsArr = Array.isArray(existingOutputs) ? existingOutputs : existingOutputs ? [existingOutputs] : []
  const latestResume = outputsArr.find((o) => o.output_type === "resume_markdown")
  const latestProfile = outputsArr.find((o) => o.output_type === "profile_page")

  if (!forceRegenerate && latestResume && latestProfile) {
    const { data: caseData } = await serviceClient
      .from("cases")
      .select("status")
      .eq("id", caseId)
      .single()

    if (caseData && caseData.status !== "outputs_ready") {
      await serviceClient
        .from("cases")
        .update({ status: "outputs_ready", updated_at: new Date().toISOString() })
        .eq("id", caseId)
    }

    return {
      success: true,
      message: `已有最新输出（简历 v${latestResume.version}、个人主页 v${latestProfile.version}）`,
      resumeVersion: latestResume.version,
      profileVersion: latestProfile.version,
    }
  }

  const { data: posData, error: posError } = await serviceClient
    .from("positionings")
    .select("*")
    .eq("case_id", caseId)
    .eq("selected", true)
    .single()

  if (posError || !posData) {
    return { success: false, error: "请先选择一个职业定位" }
  }
  const selectedPositioning = posData

  const { data: fp, error: fpError } = await serviceClient
    .from("career_fingerprints")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (fpError || !fp) {
    return { success: false, error: "请先生成职业指纹" }
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

  const { data: profile, error: profileError } = await serviceClient
    .from("candidate_profiles")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "请先解析简历" }
  }

  let profileStr: string
  let cardsStr: string
  let jdStr: string
  let fpStr: string
  let posStr: string

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
      recommended_project_types: (jd as Record<string, unknown>).recommended_project_types,
    }
    jdStr = JSON.stringify(trimmedJD, null, 2)

    fpStr = JSON.stringify(fp, null, 2)

    const trimmedPos = {
      version_name: (selectedPositioning as Record<string, unknown>).version_name,
      target_reader: (selectedPositioning as Record<string, unknown>).target_reader,
      career_axis: (selectedPositioning as Record<string, unknown>).career_axis,
      secondary_axis: (selectedPositioning as Record<string, unknown>).secondary_axis,
      one_line_summary: (selectedPositioning as Record<string, unknown>).one_line_summary,
      value_summary: (selectedPositioning as Record<string, unknown>).value_summary,
      tone_tags: (selectedPositioning as Record<string, unknown>).tone_tags,
      recommended_projects: (selectedPositioning as Record<string, unknown>).recommended_projects,
      weak_projects: (selectedPositioning as Record<string, unknown>).weak_projects,
      risks: (selectedPositioning as Record<string, unknown>).risks,
    }
    posStr = JSON.stringify(trimmedPos, null, 2)
  } catch {
    return { success: false, error: "输入数据格式异常" }
  }

  const commonReplacements = {
    "{{candidate_profile}}": profileStr,
    "{{project_cards}}": cardsStr,
    "{{job_description}}": jdStr,
    "{{career_fingerprint}}": fpStr,
    "{{selected_positioning}}": posStr,
  }

  // --- 1. Generate resume_markdown ---
  const resumeUserPrompt = Object.entries(commonReplacements).reduce(
    (p, [k, v]) => p.replace(k, v),
    GENERATE_RESUME_OUTPUT_USER_PROMPT
  )

  const resumeResult = await generateStructuredOutput({
    agent_name: "generate_outputs_resume",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.GENERATE_RESUME_OUTPUT,
    user_prompt: resumeUserPrompt,
    schema_name: "resume_output",
    schema: ResumeOutputSchema,
    max_tokens: 8192,
  })

  if ("error" in resumeResult) {
    return { success: false, error: `简历生成失败：${resumeResult.error}` }
  }

  // --- 2. Generate profile_page ---
  const profileUserPrompt = Object.entries(commonReplacements).reduce(
    (p, [k, v]) => p.replace(k, v),
    GENERATE_PROFILE_PAGE_USER_PROMPT
  )

  const profileResult = await generateStructuredOutput({
    agent_name: "generate_outputs_profile",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.GENERATE_PROFILE_PAGE,
    user_prompt: profileUserPrompt,
    schema_name: "profile_page",
    schema: ProfilePageSchema,
    max_tokens: 8192,
  })

  if ("error" in profileResult) {
    return { success: false, error: `个人主页生成失败：${profileResult.error}` }
  }

  // --- 3. Determine next version ---
  let resumeVersion = 1
  let profileVersion = 1
  for (const row of outputsArr) {
    if (row.output_type === "resume_markdown" && row.version >= resumeVersion) {
      resumeVersion = row.version + 1
    }
    if (row.output_type === "profile_page" && row.version >= profileVersion) {
      profileVersion = row.version + 1
    }
  }

  // --- 4. Insert both ---
  const resumeData = resumeResult.data
  const profileData = profileResult.data

  const outputsToInsert = [
    {
      case_id: caseId,
      output_type: "resume_markdown",
      title: resumeData.title ?? null,
      markdown: resumeData.markdown,
      content: (resumeData.sections ?? null) as Record<string, unknown> | null,
      version: resumeVersion,
      template_id: null,
      prompt_version: PROMPT_VERSION,
    },
    {
      case_id: caseId,
      output_type: "profile_page",
      title: profileData.hero?.positioning_title ?? profileData.hero?.name ?? null,
      markdown: profileData.markdown ?? null,
      content: profileData as unknown as Record<string, unknown>,
      version: profileVersion,
      template_id: null,
      prompt_version: PROMPT_VERSION,
    },
  ]

  const { error: insertError } = await serviceClient
    .from("generated_outputs")
    .insert(outputsToInsert)

  if (insertError) {
    return { success: false, error: `保存生成结果失败：${normalizeError(insertError)}` }
  }

  const { error: statusError } = await serviceClient
    .from("cases")
    .update({ status: "outputs_ready", updated_at: new Date().toISOString() })
    .eq("id", caseId)

  if (statusError) {
    return { success: false, error: `更新案例状态失败：${normalizeError(statusError)}` }
  }

  return {
    success: true,
    message: `已生成简历（v${resumeVersion}）和个人主页（v${profileVersion}）`,
    resumeVersion,
    profileVersion,
  }
}
