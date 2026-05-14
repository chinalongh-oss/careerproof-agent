import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS, PROMPT_VERSION } from "@/lib/prompt"
import { ResumeOutputSchema, ProfilePageSchema } from "@/lib/schemas"
import { GENERATE_RESUME_OUTPUT_USER_PROMPT } from "@/lib/prompts/agents/generate-resume-output"
import { GENERATE_PROFILE_PAGE_USER_PROMPT } from "@/lib/prompts/agents/generate-profile-page"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

interface ResumeTarget {
  deliveryMode: string
  targetRole: string
  label: string
  variantKey: string
  directive: string
  fitReason: string | null
}

export async function generateOutputs(caseId: string, forceRegenerate = false, forceGenerate = false) {
  const { data: existingOutputs } = await serviceClient
    .from("generated_outputs")
    .select("output_type,version,title,markdown,content,created_at,delivery_variant_key,is_current")
    .eq("case_id", caseId)
    .order("version", { ascending: false })

  const outputsArr = Array.isArray(existingOutputs) ? existingOutputs : existingOutputs ? [existingOutputs] : []
  const latestResume = outputsArr.find((o) => o.output_type === "resume_markdown")
  const latestProfile = outputsArr.find((o) => o.output_type === "profile_page")

  const { data: deliveryTarget } = await serviceClient
    .from("selected_delivery_targets")
    .select("*")
    .eq("case_id", caseId)

  const targetsArr = Array.isArray(deliveryTarget) ? deliveryTarget as Record<string, unknown>[] : deliveryTarget ? [deliveryTarget as Record<string, unknown>] : []
  const hasDeliveryTargets = targetsArr.length > 0

  const { data: fitData } = await serviceClient
    .from("job_fit_assessments")
    .select("*")
    .eq("case_id", caseId)
    .single()

  const fitAssessment = fitData as Record<string, unknown> | null

  if (!fitAssessment && !forceRegenerate && !forceGenerate) {
    if (latestResume || latestProfile) {
      return { success: false, error: "请先完成岗位适配判断" }
    }
  }

  if (!forceRegenerate && latestResume && latestProfile && !hasDeliveryTargets) {
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
    .select("id,project_name,business_context,business_problem,candidate_role,personal_actions,team_actions,metrics,result_summary,evidence_level,public_visibility,risk_flags,recommended_expression,not_recommended_expression,interview_risks,role_angle_tags,reader_lens_tags")
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
      public_visibility: c.public_visibility,
      risk_flags: c.risk_flags,
      recommended_expression: c.recommended_expression,
      not_recommended_expression: c.not_recommended_expression,
      interview_risks: c.interview_risks,
      role_angle_tags: c.role_angle_tags,
      reader_lens_tags: c.reader_lens_tags,
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
    "{{target_role}}": (jd as Record<string, unknown>).role_name as string || "",
  }

  if (!fitAssessment) {
    return { success: false, error: "请先完成岗位适配判断" }
  }
  const fitLevel = (fitAssessment.fit_level as string) ?? ""
  const recommendedDeliveryMode = (fitAssessment.recommended_delivery_mode as string) ?? ""

  if (!fitLevel) {
    return { success: false, error: "岗位适配判断数据不完整，请重新执行岗位适配判断" }
  }

  const hasForcedTargetSelected = targetsArr.some(t => t.delivery_mode === "forced_target_resume")
  const hasDiagnosticTarget = targetsArr.some(t => t.delivery_mode === "diagnostic_report")
  const fitStr = JSON.stringify(fitAssessment ?? {}, null, 2)

  if (targetsArr.length === 0) {
    if (!forceGenerate && recommendedDeliveryMode === "reject_direct_application") {
      return {
        success: false,
        error: `岗位适配判断为 no_fit，不建议为当前 JD 生成简历。建议在下方选择交付目标（替代岗位 / 诊断报告），或使用强制模式。`,
      }
    }

    if (!forceGenerate && recommendedDeliveryMode === "diagnostic_report" && fitLevel !== "medium") {
      return {
        success: false,
        error: `岗位适配判断为 ${fitLevel}，推荐交付模式为 diagnostic_report。请在下方选择交付目标，或使用强制模式。`,
      }
    }
  }

  let fitGateDirective = ""
  if (hasForcedTargetSelected || recommendedDeliveryMode === "forced_target_resume") {
    fitGateDirective = `

## ⚠️ 岗位适配约束 — 目标 JD 尝试版（forced_target_resume）

岗位匹配等级：${fitLevel}
用户已确认风险，系统基于原目标 JD 生成尝试版交付物。

### 硬性约束（必须遵守）：
1. **禁止**把候选人写成目标岗位专家（如"资深 AI coding 产品经理"）
2. **禁止**编造 AI coding / 开发者工具 / LLM 产品经验，不得伪造任何缺失方向的经验
3. **必须**使用"转向 / 探索 / 可迁移 / 相关能力"等表达来描述与目标岗位的关系
4. **必须**在 trust_notes 中保留岗位适配风险说明
5. **必须**在摘要中诚实说明候选人核心经历方向与目标 JD 的关系
6. 简历标题**必须**使用过渡性表达，例如"商业化产品经理｜数据实验 / 策略协同 / AI 工具方向探索"
7. 核心能力板块**必须**体现可迁移能力，不得直接将目标岗位要求写为已有能力

安全的定位表述：${fitAssessment?.safe_positioning_statement ?? "基于可迁移能力的转型方向"}
不应使用的表述：${fitAssessment?.unsafe_positioning_statement ?? "直接将目标岗位作为候选人身份"}

此交付物属于**目标 JD 尝试版**，不是正式高匹配版。
`
  } else if (recommendedDeliveryMode !== "full_resume") {
    fitGateDirective = `

## ⚠️ 岗位适配约束（必须遵守）

推荐交付模式：${recommendedDeliveryMode}
岗位匹配等级：${fitLevel}

### 约束规则：
1. **禁止**把目标岗位直接写成候选人的当前身份或过往身份
2. **禁止**在简历标题中使用无证据支撑的目标岗位名称（如"资深 AI coding 产品经理"）
3. **必须**使用"转向 / 探索 / 可迁移 / 相关能力"等表达来描述目标岗位
4. **必须**在 trust_notes 中保留风险说明
5. 如果候选人的核心经历与 JD 方向不同，**必须**在摘要中诚实说明，不得强行包装
6. 目标岗位标题**必须**使用过渡性表达，例如"产品经理（商业化 / AI 方向探索）"

安全的定位表述：${fitAssessment?.safe_positioning_statement ?? "基于可迁移能力的转型方向"}
不应使用的表述：${fitAssessment?.unsafe_positioning_statement ?? "直接将目标岗位作为候选人身份"}
`
  }

  if (forceGenerate && (recommendedDeliveryMode === "diagnostic_report" || recommendedDeliveryMode === "reject_direct_application")) {
    fitGateDirective += `

## ⚠️ 强制生成模式（附加风险）

当前为强制生成模式。虽然不推荐为当前 JD 生成正式简历，但用户选择强制生成。
请在生成的内容中：
1. 保持上述约束
2. 在 trust_notes 中明确标注"此简历为强制生成，存在 JD 过度匹配风险"
`
  }

  const originalJdRole = (jd as Record<string, unknown>).role_name as string || ""

  // --- 1. Generate profile_page (once) ---
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

  const profileData = profileResult.data
  let profileVersion = 1
  for (const row of outputsArr) {
    if (row.output_type === "profile_page" && row.version >= profileVersion) {
      profileVersion = row.version + 1
    }
  }

  const profileToInsert = {
    case_id: caseId,
    output_type: "profile_page",
    title: profileData.hero?.positioning_title ?? profileData.hero?.name ?? null,
    markdown: profileData.markdown ?? "",
    content: profileData as unknown as Record<string, unknown>,
    version: profileVersion,
    template_id: null,
    prompt_version: PROMPT_VERSION,
  }

  // --- 2. Build ResumeTargets from selected_delivery_targets ---
  const resumeTargets: ResumeTarget[] = []

  for (const t of targetsArr) {
    const dm = t.delivery_mode as string
    const tr = t.target_role as string | null

    if (dm === "full_resume" && tr) {
      const altRoles = fitAssessment?.alternative_roles as Array<{ role?: string; fit_reason?: string }> | undefined
      const fitReason = altRoles?.find(a => a.role === tr)?.fit_reason ?? null

      resumeTargets.push({
        deliveryMode: "full_resume",
        targetRole: tr,
        label: `替代岗位: ${tr}`,
        variantKey: `full_resume::${tr}`,
        directive: `\n\n## ⚠️ 替代岗位正式简历指令\n\n这是替代岗位正式简历，请以该替代岗位为目标重组经历，不要继续按原始 AI coding JD 强行优化，不得编造 AI coding / LLM / 开发者工具经验。\n\n目标替代岗位：${tr}\n`,
        fitReason,
      })
    } else if (dm === "forced_target_resume") {
      resumeTargets.push({
        deliveryMode: "forced_target_resume",
        targetRole: originalJdRole,
        label: "目标 JD 尝试版",
        variantKey: `forced_target_resume::${originalJdRole}`,
        directive: fitGateDirective,
        fitReason: null,
      })
    }
  }

  // Fallback: no targets selected, generate one default resume
  if (resumeTargets.length === 0 && targetsArr.length === 0) {
    resumeTargets.push({
      deliveryMode: "full_resume",
      targetRole: originalJdRole,
      label: "标准版",
      variantKey: `full_resume::${originalJdRole}`,
      directive: recommendedDeliveryMode !== "full_resume" ? fitGateDirective : "",
      fitReason: null,
    })
  }

  // --- 3. Generate resumes: for each target, invalidate old then insert new ---
  const generatedResumes: Array<{
    title: string | null
    markdown: string
    content: Record<string, unknown> | null
    deliveryMode: string
    targetRole: string
    variantKey: string
  }> = []

  for (const rt of resumeTargets) {
    // Set old versions of this variant to is_current = false
    const { error: invalidateError } = await serviceClient
      .from("generated_outputs")
      .update({ is_current: false })
      .eq("case_id", caseId)
      .eq("output_type", "resume_markdown")
      .eq("delivery_variant_key", rt.variantKey)
      .eq("is_current", true)

    if (invalidateError) {
      return { success: false, error: `更新旧版本状态失败：${normalizeError(invalidateError)}` }
    }

    const replMap = { ...commonReplacements }
    replMap["{{target_role}}"] = rt.targetRole
    const prompt = Object.entries(replMap).reduce(
      (p, [k, v]) => p.replace(k, v),
      GENERATE_RESUME_OUTPUT_USER_PROMPT
    ) + rt.directive

    const res = await generateStructuredOutput({
      agent_name: "generate_outputs_resume",
      case_id: caseId,
      system_prompt: SYSTEM_PROMPT,
      system_prompt_key: PROMPT_KEYS.GENERATE_RESUME_OUTPUT,
      user_prompt: prompt,
      schema_name: "resume_output",
      schema: ResumeOutputSchema,
      max_tokens: 8192,
    })

    if ("error" in res) {
      return { success: false, error: `简历生成失败 (${rt.label})：${res.error}` }
    }

    generatedResumes.push({
      title: `【${rt.label}】${res.data.title ?? ""}`,
      markdown: res.data.markdown,
      content: (res.data.sections ?? null) as Record<string, unknown> | null,
      deliveryMode: rt.deliveryMode,
      targetRole: rt.targetRole,
      variantKey: rt.variantKey,
    })
  }

  // --- 4. Generate diagnostic_report if selected ---
  let diagnosticReport: { title: string; markdown: string } | null = null

  if (hasDiagnosticTarget) {
    // Invalidate old diagnostic_report for this case
    await serviceClient
      .from("generated_outputs")
      .update({ is_current: false })
      .eq("case_id", caseId)
      .eq("output_type", "diagnostic_report")
      .eq("delivery_variant_key", "diagnostic_report::job_fit_diagnostic")
      .eq("is_current", true)

    const diagnosticPrompt = `请基于以下信息生成一份诊断报告：

## 岗位适配评估
${fitStr}

## 候选人画像
${profileStr}

## 项目证据卡
${cardsStr}

请生成一份包含以下内容的诊断报告（Markdown 格式）：
1. 岗位匹配度总结
2. 缺失能力清单
3. 可迁移能力分析
4. 替代岗位建议
5. 提升建议`

    const diagRes = await generateStructuredOutput({
      agent_name: "generate_diagnostic_report",
      case_id: caseId,
      system_prompt: SYSTEM_PROMPT,
      system_prompt_key: PROMPT_KEYS.EVALUATE_JOB_FIT,
      user_prompt: diagnosticPrompt,
      schema_name: "resume_output",
      schema: ResumeOutputSchema,
      max_tokens: 4096,
    })

    if (!("error" in diagRes)) {
      diagnosticReport = {
        title: "诊断报告",
        markdown: diagRes.data.markdown,
      }
    }
  }

  // --- 5. Insert all outputs with is_current = true ---
  const outputsToInsert: Array<{
    case_id: string
    output_type: string
    title: string | null
    markdown: string
    content: Record<string, unknown> | null
    version: number
    template_id: null
    prompt_version: string
    delivery_mode: string | null
    target_role: string | null
    delivery_variant_key: string | null
    is_current: boolean
  }> = [
    {
      ...profileToInsert,
      delivery_mode: null,
      target_role: null,
      delivery_variant_key: null,
      is_current: true,
    },
  ]

  let resumeVersion = 1
  for (const row of outputsArr) {
    if (row.output_type === "resume_markdown" && row.version >= resumeVersion) {
      resumeVersion = row.version + 1
    }
  }

  for (let i = 0; i < generatedResumes.length; i++) {
    outputsToInsert.push({
      case_id: caseId,
      output_type: "resume_markdown",
      title: generatedResumes[i].title,
      markdown: generatedResumes[i].markdown,
      content: generatedResumes[i].content,
      version: resumeVersion + i,
      template_id: null,
      prompt_version: PROMPT_VERSION,
      delivery_mode: generatedResumes[i].deliveryMode,
      target_role: generatedResumes[i].targetRole,
      delivery_variant_key: generatedResumes[i].variantKey,
      is_current: true,
    })
  }

  if (diagnosticReport) {
    let diagVersion = 1
    for (const row of outputsArr) {
      if (row.output_type === "diagnostic_report" && row.version >= diagVersion) {
        diagVersion = row.version + 1
      }
    }
    outputsToInsert.push({
      case_id: caseId,
      output_type: "diagnostic_report",
      title: `【诊断报告】岗位适配分析`,
      markdown: diagnosticReport.markdown,
      content: null,
      version: diagVersion,
      template_id: null,
      prompt_version: PROMPT_VERSION,
      delivery_mode: "diagnostic_report",
      target_role: null,
      delivery_variant_key: "diagnostic_report::job_fit_diagnostic",
      is_current: true,
    })
  }

  const { error: insertError } = await serviceClient
    .from("generated_outputs")
    .insert(outputsToInsert)

  if (insertError) {
    return { success: false, error: `保存生成结果失败：${normalizeError(insertError)}` }
  }

  // --- 6. Risk issues for forced target ---
  if (hasForcedTargetSelected) {
    const forceRiskIssues: Array<{
      case_id: string
      output_id: null
      source_type: string
      source_text: string
      risk_type: string
      risk_level: string
      reason: string
      suggestion: string
      safer_rewrite?: string | null
      risk_source: string
      status: string
    }> = [
      {
        case_id: caseId,
        output_id: null,
        source_type: "original_jd",
        source_text: `forced_target_resume 模式：用户确认风险后基于原目标 JD 生成尝试版`,
        risk_type: "jd_overfit",
        risk_level: "high",
        reason: `候选人与目标 JD 匹配度为 ${fitLevel}，用户选择继续生成目标 JD 尝试版（forced_target_resume）。存在岗位过度匹配风险。`,
        suggestion: "面试时需诚实说明候选人核心经历方向与目标岗位的关系，强调可迁移能力和转型意愿。",
        safer_rewrite: (fitAssessment?.safe_positioning_statement as string) ?? "基于可迁移能力的职业定位",
        risk_source: "system_gate",
        status: "open",
      },
      {
        case_id: caseId,
        output_id: null,
        source_type: "original_jd",
        source_text: `目标 JD 尝试版：简历标题可能无法支撑目标岗位身份`,
        risk_type: "unsupported_target_title",
        risk_level: "high",
        reason: `候选人实际经历与目标 JD 方向不同，简历标题不应使用无证据支撑的目标岗位名称。`,
        suggestion: "使用过渡性标题，如'\u201c商业化产品经理\u2502AI 方向探索\u201d'。",
        risk_source: "system_gate",
        status: "open",
      },
      {
        case_id: caseId,
        output_id: null,
        source_type: "original_jd",
        source_text: `目标 JD 核心要求与候选人实际经历存在显著差异`,
        risk_type: "identity_mismatch",
        risk_level: "high",
        reason: `候选人核心经历与目标 JD 方向存在显著差异，简历中可能出现身份不匹配问题。`,
        suggestion: "确保简历摘要诚实说明转型意愿，不将目标岗位包装为已有身份。",
        risk_source: "system_gate",
        status: "open",
      },
      {
        case_id: caseId,
        output_id: null,
        source_type: "original_jd",
        source_text: `目标 JD 中的硬性技能要求候选人可能不满足`,
        risk_type: "hard_requirement_missing",
        risk_level: "high",
        reason: `目标 JD 可能包含候选人尚不具备的硬性要求（如特定技术栈、行业经验等）。`,
        suggestion: "在简历中诚实呈现现有能力，不编造缺失经验。",
        risk_source: "system_gate",
        status: "open",
      },
    ]
    await serviceClient.from("risk_issues").insert(forceRiskIssues as Record<string, unknown>[])
  } else if (forceGenerate && recommendedDeliveryMode !== "full_resume") {
    const forceRiskIssues: Array<{
      case_id: string
      output_id: null
      source_type: string
      source_text: string
      risk_type: string
      risk_level: string
      reason: string
      suggestion: string
      safer_rewrite?: string | null
      risk_source: string
      status: string
    }> = [
      {
        case_id: caseId,
        output_id: null,
        source_type: "resume_markdown",
        source_text: `强制生成模式：岗位匹配等级 ${fitLevel}，推荐交付模式 ${recommendedDeliveryMode}`,
        risk_type: "jd_overfit",
        risk_level: "high",
        reason: `候选人与目标 JD 匹配度为 ${fitLevel}，系统推荐交付模式为 ${recommendedDeliveryMode}。用户选择强制生成正式简历，存在岗位过度匹配风险，可能导致面试时被质疑。`,
        suggestion: "建议使用诊断报告或迁移型简历，诚实呈现可迁移能力而非强行包装为专业经验。",
        safer_rewrite: (fitAssessment?.safe_positioning_statement as string) ?? "基于可迁移能力的职业定位",
        risk_source: "system_gate",
        status: "open",
      },
    ]
    if (recommendedDeliveryMode === "diagnostic_report" || recommendedDeliveryMode === "reject_direct_application") {
      forceRiskIssues.push({
        case_id: caseId,
        output_id: null,
        source_type: "resume_markdown",
        source_text: `目标岗位与候选人实际经历方向不同`,
        risk_type: "identity_mismatch",
        risk_level: "high",
        reason: `候选人核心经历与目标 JD 方向存在显著差异，简历中可能出现身份不匹配问题。`,
        suggestion: "确保简历摘要诚实说明转型意愿，不将目标岗位包装为已有身份。",
        risk_source: "system_gate",
        status: "open",
      })
    }
    await serviceClient.from("risk_issues").insert(forceRiskIssues as Record<string, unknown>[])
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
