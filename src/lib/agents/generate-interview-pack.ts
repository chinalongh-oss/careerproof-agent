import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { InterviewPackSchema } from "@/lib/schemas"
import { GENERATE_INTERVIEW_PACK_USER_PROMPT } from "@/lib/prompts/agents/generate-interview-pack"
import { serviceClient, normalizeError } from "@/lib/supabase/service"

export async function generateInterviewPack(caseId: string, forceRegenerate = false) {
  const { data: existingOutputs } = await serviceClient
    .from("generated_outputs")
    .select("output_type,version")
    .eq("case_id", caseId)
    .eq("output_type", "interview_pack")
    .order("version", { ascending: false })

  const outputsArr = Array.isArray(existingOutputs) ? existingOutputs : existingOutputs ? [existingOutputs] : []
  const latest = outputsArr[0] ?? null

  if (!forceRegenerate && latest) {
    const { data: caseData } = await serviceClient
      .from("cases")
      .select("status")
      .eq("id", caseId)
      .single()

    if (caseData && caseData.status !== "interview_ready") {
      await serviceClient
        .from("cases")
        .update({ status: "interview_ready", updated_at: new Date().toISOString() })
        .eq("id", caseId)
    }

    return {
      success: true,
      message: `已有面试准备包 v${latest.version}`,
      version: latest.version,
    }
  }

  const { data: resumeOutputs } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,version")
    .eq("case_id", caseId)
    .eq("output_type", "resume_markdown")
    .order("version", { ascending: false })
    .limit(1)

  const resumeArr = Array.isArray(resumeOutputs) ? resumeOutputs : resumeOutputs ? [resumeOutputs] : []
  const latestResume = resumeArr[0] ?? null

  if (!latestResume || !latestResume.markdown) {
    return { success: false, error: "请先生成简历" }
  }

  const { data: cards, error: cardsError } = await serviceClient
    .from("project_cards")
    .select("id,project_name,business_context,business_problem,candidate_role,personal_actions,team_actions,metrics,result_summary,evidence_level,risk_flags,interview_risks,public_visibility,recommended_expression,not_recommended_expression,role_angle_tags,reader_lens_tags")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  if (cardsError) {
    return { success: false, error: `读取项目证据卡失败：${normalizeError(cardsError)}` }
  }
  const cardsArr = Array.isArray(cards) ? cards : cards ? [cards] : []
  if (cardsArr.length === 0) {
    return { success: false, error: "请先生成项目证据卡" }
  }

  const { data: riskIssues } = await serviceClient
    .from("risk_issues")
    .select("source_type,source_text,risk_type,risk_level,reason,suggestion")
    .eq("case_id", caseId)

  const risksArr = Array.isArray(riskIssues) ? riskIssues : riskIssues ? [riskIssues] : []

  const { data: jd, error: jdError } = await serviceClient
    .from("job_descriptions")
    .select("*")
    .eq("case_id", caseId)
    .single()

  if (jdError || !jd) {
    return { success: false, error: "请先解析 JD" }
  }

  const { data: posData } = await serviceClient
    .from("positionings")
    .select("*")
    .eq("case_id", caseId)
    .eq("selected", true)
    .single()

  if (!posData) {
    return { success: false, error: "请先选择职业定位" }
  }

  let resumeStr: string
  let cardsStr: string
  let risksStr: string
  let jdStr: string
  let posStr: string

  try {
    resumeStr = latestResume.markdown

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
      risk_flags: c.risk_flags,
      interview_risks: c.interview_risks,
      public_visibility: c.public_visibility,
      recommended_expression: c.recommended_expression,
      not_recommended_expression: c.not_recommended_expression,
      role_angle_tags: c.role_angle_tags,
      reader_lens_tags: c.reader_lens_tags,
    }))
    cardsStr = JSON.stringify(trimmedCards, null, 2)

    risksStr = JSON.stringify(risksArr, null, 2)

    const trimmedJD = {
      role_name: (jd as Record<string, unknown>).role_name,
      company_type: (jd as Record<string, unknown>).company_type,
      seniority_level: (jd as Record<string, unknown>).seniority_level,
      core_responsibilities: (jd as Record<string, unknown>).core_responsibilities,
      required_skills: (jd as Record<string, unknown>).required_skills,
      keywords: (jd as Record<string, unknown>).keywords,
      resume_strategy: (jd as Record<string, unknown>).resume_strategy,
      interview_focus: (jd as Record<string, unknown>).interview_focus,
    }
    jdStr = JSON.stringify(trimmedJD, null, 2)

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
  } catch {
    return { success: false, error: "输入数据格式异常" }
  }

  const userPrompt = GENERATE_INTERVIEW_PACK_USER_PROMPT
    .replace("{{resume_markdown}}", resumeStr)
    .replace("{{project_cards}}", cardsStr)
    .replace("{{risk_issues}}", risksStr)
    .replace("{{job_description}}", jdStr)
    .replace("{{selected_positioning}}", posStr)

  const result = await generateStructuredOutput({
    agent_name: "generate_interview_pack",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.GENERATE_INTERVIEW_PREP,
    user_prompt: userPrompt,
    schema_name: "interview_pack",
    schema: InterviewPackSchema,
    max_tokens: 8192,
  })

  if ("error" in result) {
    return { success: false, error: `面试准备包生成失败：${result.error}` }
  }

  const packData = result.data as Record<string, unknown>

  if (!packData.overall_interview_strategy || typeof packData.overall_interview_strategy !== "string" || packData.overall_interview_strategy.trim().length === 0) {
    return { success: false, error: "生成校验失败：缺少整体面试策略（overall_interview_strategy）" }
  }

  const checklist = packData.preparation_checklist as Array<unknown> | undefined
  if (!checklist || checklist.length < 1) {
    return { success: false, error: "生成校验失败：准备清单（preparation_checklist）至少需要 1 条" }
  }

  const projectQuestions = packData.project_questions as Array<unknown> | undefined
  if (!projectQuestions || projectQuestions.length < 1) {
    return { success: false, error: "生成校验失败：项目追问（project_questions）至少需要 1 条" }
  }

  let nextVersion = 1
  for (const row of outputsArr) {
    if (row.version >= nextVersion) {
      nextVersion = row.version + 1
    }
  }

  const markdown = buildInterviewPackMarkdown(packData)

  const { error: insertError } = await serviceClient
    .from("generated_outputs")
    .insert({
      case_id: caseId,
      output_type: "interview_pack",
      title: "面试准备包",
      markdown,
      content: packData,
      version: nextVersion,
      template_id: null,
      prompt_version: "0.1.0",
    })

  if (insertError) {
    return { success: false, error: `保存面试准备包失败：${normalizeError(insertError)}` }
  }

  await serviceClient
    .from("cases")
    .update({ status: "interview_ready", updated_at: new Date().toISOString() })
    .eq("id", caseId)

  return {
    success: true,
    message: "面试准备包生成成功",
    version: nextVersion,
  }
}

function buildInterviewPackMarkdown(pack: Record<string, unknown>): string {
  const lines: string[] = []

  lines.push("# 面试准备包")
  lines.push("")

  if (pack.overall_interview_strategy) {
    lines.push("## 整体面试策略")
    lines.push("")
    lines.push(pack.overall_interview_strategy as string)
    lines.push("")
  }

  const topRisks = pack.top_risks as Array<Record<string, unknown>> | undefined
  if (topRisks && topRisks.length > 0) {
    lines.push("## 主要风险及应对")
    lines.push("")
    for (const r of topRisks) {
      lines.push(`- **风险**：${r.risk || ""}`)
      lines.push(`  - 来源：${r.source || ""}`)
      lines.push(`  - 应对：${r.interview_approach || ""}`)
      lines.push("")
    }
  }

  const checklist = pack.preparation_checklist as Array<Record<string, unknown>> | undefined
  if (checklist && checklist.length > 0) {
    lines.push("## 准备清单")
    lines.push("")
    for (const item of checklist) {
      lines.push(`- **${item.item || ""}**：${item.detail || ""}（${item.reason || ""}）`)
    }
    lines.push("")
  }

  const projectQuestions = pack.project_questions as Array<Record<string, unknown>> | undefined
  if (projectQuestions && projectQuestions.length > 0) {
    lines.push("## 重点项目追问")
    lines.push("")
    for (const pq of projectQuestions) {
      lines.push(`### ${pq.project_name || ""}`)
      lines.push("")
      if (pq.project_summary) lines.push(`${pq.project_summary}`)
      lines.push("")

      if (pq.why_asked) {
        lines.push(`**面试官关注点**：${pq.why_asked}`)
        lines.push("")
      }

      if (pq.answer_structure) {
        lines.push(`**回答框架**：${pq.answer_structure}`)
        lines.push("")
      }

      const likelyQs = pq.likely_questions as Array<Record<string, unknown>> | undefined
      if (likelyQs && likelyQs.length > 0) {
        lines.push("**可能问题**：")
        for (const q of likelyQs) {
          lines.push(`- ${q.question || ""}`)
        }
        lines.push("")
      }

      const highRiskQs = pq.high_risk_questions as Array<Record<string, unknown>> | undefined
      if (highRiskQs && highRiskQs.length > 0) {
        lines.push("**⚠️ 高风险追问**：")
        for (const q of highRiskQs) {
          lines.push(`- ${q.question || ""}（风险来源：${q.risk_source || ""}）`)
        }
        lines.push("")
      }

      const dataToPrepare = pq.data_to_prepare as string[] | undefined
      if (dataToPrepare && dataToPrepare.length > 0) {
        lines.push("**数据准备**：")
        for (const d of dataToPrepare) {
          lines.push(`- ${d}`)
        }
        lines.push("")
      }

      const doNot = pq.do_not_overclaim as string[] | undefined
      if (doNot && doNot.length > 0) {
        lines.push("**不要过度声称**：")
        for (const d of doNot) {
          lines.push(`- ${d}`)
        }
        lines.push("")
      }

      if (pq.suggested_boundary_statement) {
        lines.push(`**边界声明**：${pq.suggested_boundary_statement}`)
        lines.push("")
      }
    }
  }

  return lines.join("\n")
}
