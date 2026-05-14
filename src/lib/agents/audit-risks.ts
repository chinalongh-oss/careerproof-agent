import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { RiskReviewOutputSchema } from "@/lib/schemas"
import { AUDIT_RISKS_USER_PROMPT } from "@/lib/prompts/agents/audit-risks"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

const MAX_CHUNK_CHARS = 8000

function splitMarkdownIntoSections(markdown: string): { heading: string; content: string }[] {
  const sections: { heading: string; content: string }[] = []
  const lines = markdown.split("\n")
  let currentHeading = "(文档开头)"
  let currentContent: string[] = []

  for (const line of lines) {
    if (/^#{1,3}\s/.test(line)) {
      if (currentContent.length > 0 || currentHeading !== "(文档开头)") {
        sections.push({ heading: currentHeading, content: currentContent.join("\n").trim() })
      }
      currentHeading = line.trim()
      currentContent = []
    } else {
      currentContent.push(line)
    }
  }
  if (currentContent.length > 0 || sections.length === 0) {
    sections.push({ heading: currentHeading, content: currentContent.join("\n").trim() })
  }
  return sections
}

function chunkSections(
  sections: { heading: string; content: string }[],
  sourceLabel: string,
  maxChunkChars: number
): string[] {
  const chunks: string[] = []
  let currentChunk = ""

  for (const section of sections) {
    const sectionBlock = `### [${sourceLabel}] ${section.heading}\n${section.content}\n`
    if (currentChunk.length + sectionBlock.length > maxChunkChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sectionBlock
    } else {
      currentChunk += sectionBlock
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }
  return chunks.length > 0 ? chunks : [""]
}

function formatContentAsSections(
  markdown: string,
  sourceLabel: string,
  maxChunkChars: number = MAX_CHUNK_CHARS
): string[] {
  const sections = splitMarkdownIntoSections(markdown)
  return chunkSections(sections, sourceLabel, maxChunkChars)
}

export async function auditRisks(caseId: string) {
  const { data: resumeOutputs } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,content,version")
    .eq("case_id", caseId)
    .eq("output_type", "resume_markdown")
    .order("version", { ascending: false })
    .limit(1)

  const resumeArr = Array.isArray(resumeOutputs) ? resumeOutputs : resumeOutputs ? [resumeOutputs] : []
  const latestResume = resumeArr[0] ?? null

  if (!latestResume) {
    return { success: false, error: "请先生成简历" }
  }

  const { data: profileOutputs } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,content,version")
    .eq("case_id", caseId)
    .eq("output_type", "profile_page")
    .order("version", { ascending: false })
    .limit(1)

  const profileArr = Array.isArray(profileOutputs) ? profileOutputs : profileOutputs ? [profileOutputs] : []
  const latestProfile = profileArr[0] ?? null

  if (!latestProfile) {
    return { success: false, error: "请先生成个人主页" }
  }

  const { data: cards, error: cardsError } = await serviceClient
    .from("project_cards")
    .select("*")
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

  const { data: posData } = await serviceClient
    .from("positionings")
    .select("*")
    .eq("case_id", caseId)
    .eq("selected", true)
    .single()

  let cardsStr: string
  let jdStr: string
  let candidateProfileStr: string
  let posStr: string

  try {
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

    const trimmedProfile = {
      personal_info: (profile as Record<string, unknown>).personal_info,
      education: (profile as Record<string, unknown>).education,
      work_experiences: (profile as Record<string, unknown>).work_experiences,
      skills: (profile as Record<string, unknown>).skills,
      metrics: (profile as Record<string, unknown>).metrics,
    }
    candidateProfileStr = JSON.stringify(trimmedProfile, null, 2)

    if (posData) {
      const trimmedPos = {
        version_name: (posData as Record<string, unknown>).version_name,
        target_reader: (posData as Record<string, unknown>).target_reader,
        career_axis: (posData as Record<string, unknown>).career_axis,
        secondary_axis: (posData as Record<string, unknown>).secondary_axis,
        one_line_summary: (posData as Record<string, unknown>).one_line_summary,
        value_summary: (posData as Record<string, unknown>).value_summary,
        tone_tags: (posData as Record<string, unknown>).tone_tags,
        recommended_projects: (posData as Record<string, unknown>).recommended_projects,
        risks: (posData as Record<string, unknown>).risks,
      }
      posStr = JSON.stringify(trimmedPos, null, 2)
    } else {
      posStr = "未选择定位"
    }
  } catch {
    return { success: false, error: "输入数据格式异常" }
  }

  const { data: fitData } = await serviceClient
    .from("job_fit_assessments")
    .select("fit_score,fit_level,recommended_delivery_mode,safe_positioning_statement,unsafe_positioning_statement,missing_requirements,hard_gaps,overfit_risks")
    .eq("case_id", caseId)
    .single()

  const fitStr = fitData ? JSON.stringify(fitData, null, 2) : "未进行岗位适配判断"

  const resumeMarkdown = latestResume.markdown ?? ""
  const profileMarkdown = latestProfile.markdown ?? ""

  const resumeChunks = formatContentAsSections(resumeMarkdown, "resume_markdown")
  const profileChunks = formatContentAsSections(profileMarkdown, "profile_page")

  const sharedPlaceholders: Record<string, string> = {
    "{{project_cards}}": cardsStr,
    "{{job_description}}": jdStr,
    "{{candidate_profile}}": candidateProfileStr,
    "{{selected_positioning}}": posStr,
    "{{job_fit_assessment}}": fitStr,
  }

  const chunkPairs: { resumeChunk: string; profileChunk: string }[] = []
  const maxLen = Math.max(resumeChunks.length, profileChunks.length)
  for (let i = 0; i < maxLen; i++) {
    chunkPairs.push({
      resumeChunk: resumeChunks[i] ?? "",
      profileChunk: profileChunks[i] ?? "",
    })
  }

  interface RiskIssue {
    source_type: string
    source_text: string
    risk_type: string
    risk_level: string
    reason: string
    suggestion: string
    safer_rewrite?: string | null
  }

  const allIssues: RiskIssue[] = []

  for (const pair of chunkPairs) {
    const userPrompt = AUDIT_RISKS_USER_PROMPT
      .replace("{{resume_markdown}}", pair.resumeChunk || "（本块无简历内容）")
      .replace("{{profile_page}}", pair.profileChunk || "（本块无个人主页内容）")
      .replace("{{project_cards}}", sharedPlaceholders["{{project_cards}}"])
      .replace("{{job_description}}", sharedPlaceholders["{{job_description}}"])
      .replace("{{candidate_profile}}", sharedPlaceholders["{{candidate_profile}}"])
      .replace("{{selected_positioning}}", sharedPlaceholders["{{selected_positioning}}"])
      .replace("{{job_fit_assessment}}", sharedPlaceholders["{{job_fit_assessment}}"])

    const result = await generateStructuredOutput({
      agent_name: "audit_risks",
      case_id: caseId,
      system_prompt: SYSTEM_PROMPT,
      system_prompt_key: PROMPT_KEYS.RUN_RISK_REVIEW,
      user_prompt: userPrompt,
      schema_name: "risk_review",
      schema: RiskReviewOutputSchema,
      max_tokens: 4096,
    })

    if ("error" in result) {
      return { success: false, error: `风险审查失败：${result.error}` }
    }

    const issues = (result.data.issues ?? []) as RiskIssue[]
    for (const issue of issues) {
      allIssues.push(issue)
    }
  }

  const seen = new Set<string>()
  const dedupedIssues = allIssues.filter((issue) => {
    const key = `${issue.source_type}|${issue.source_text}|${issue.risk_type}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  await serviceClient
    .from("risk_issues")
    .delete()
    .eq("case_id", caseId)
    .eq("status", "open")

  const issuesToInsert = dedupedIssues.map((issue) => {
    const sourceType = issue.source_type ?? "resume_markdown"
    let outputId: string | null = null
    if (sourceType === "resume_markdown") {
      outputId = latestResume.id
    } else if (sourceType === "profile_page") {
      outputId = latestProfile.id
    }

    return {
      case_id: caseId,
      output_id: outputId,
      source_type: sourceType,
      source_text: issue.source_text ?? null,
      risk_type: issue.risk_type ?? null,
      risk_level: issue.risk_level ?? null,
      reason: issue.reason ?? null,
      suggestion: issue.suggestion ?? null,
      safer_rewrite: issue.safer_rewrite ?? null,
      status: "open" as const,
    }
  })

  if (issuesToInsert.length > 0) {
    const { error: insertError } = await serviceClient
      .from("risk_issues")
      .insert(issuesToInsert)

    if (insertError) {
      return { success: false, error: `保存风险审查结果失败：${normalizeError(insertError)}` }
    }
  }

  const { error: statusError } = await serviceClient
    .from("cases")
    .update({ status: "risk_reviewed", updated_at: new Date().toISOString() })
    .eq("id", caseId)

  if (statusError) {
    return { success: false, error: `更新案例状态失败：${normalizeError(statusError)}` }
  }

  return {
    success: true,
    message: `风险审查完成，共发现 ${issuesToInsert.length} 个风险点`,
    issuesCount: issuesToInsert.length,
  }
}
