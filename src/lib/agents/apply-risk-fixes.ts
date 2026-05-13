import "server-only"

import { serviceClient, normalizeError } from "@/lib/supabase/service"
import { generateOutputs } from "@/lib/agents/generate-outputs"

export async function applyRiskFixes(caseId: string) {
  const { data: acceptedIssues, error: issuesError } = await serviceClient
    .from("risk_issues")
    .select("*")
    .eq("case_id", caseId)
    .eq("status", "accepted")

  if (issuesError) {
    return { success: false, error: `读取风险问题失败：${normalizeError(issuesError)}` }
  }

  const issuesArr = Array.isArray(acceptedIssues) ? acceptedIssues : acceptedIssues ? [acceptedIssues] : []
  if (issuesArr.length === 0) {
    return { success: false, error: "没有已接受的风险建议需要应用" }
  }

  const { data: resumeOutputs } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,version,title,content,template_id,prompt_version")
    .eq("case_id", caseId)
    .eq("output_type", "resume_markdown")
    .order("version", { ascending: false })
    .limit(1)

  const resumeArr = Array.isArray(resumeOutputs) ? resumeOutputs : resumeOutputs ? [resumeOutputs] : []
  const latestResume = resumeArr[0] ?? null

  const { data: profileOutputs } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,version,title,content,template_id,prompt_version")
    .eq("case_id", caseId)
    .eq("output_type", "profile_page")
    .order("version", { ascending: false })
    .limit(1)

  const profileArr = Array.isArray(profileOutputs) ? profileOutputs : profileOutputs ? [profileOutputs] : []
  const latestProfile = profileArr[0] ?? null

  if (!latestResume && !latestProfile) {
    return { success: false, error: "未找到可应用的交付物" }
  }

  let resumeMarkdown = latestResume?.markdown ?? null
  let profileMarkdown = latestProfile?.markdown ?? null
  let resumePatched = false
  let profilePatched = false
  const unmatchedIssues: typeof issuesArr = []

  for (const issue of issuesArr) {
    const sourceText = issue.source_text as string | null
    const saferRewrite = issue.safer_rewrite as string | null
    const sourceType = issue.source_type as string | null

    if (!sourceText || !saferRewrite) {
      unmatchedIssues.push(issue)
      continue
    }

    let applied = false

    if (sourceType === "resume_markdown" && resumeMarkdown) {
      if (resumeMarkdown.includes(sourceText)) {
        resumeMarkdown = resumeMarkdown.split(sourceText).join(saferRewrite)
        applied = true
        resumePatched = true
      }
    }

    if (sourceType === "profile_page" && profileMarkdown) {
      if (profileMarkdown.includes(sourceText)) {
        profileMarkdown = profileMarkdown.split(sourceText).join(saferRewrite)
        applied = true
        profilePatched = true
      }
    }

    if (!sourceType || sourceType === "project_card") {
      if (resumeMarkdown && resumeMarkdown.includes(sourceText)) {
        resumeMarkdown = resumeMarkdown.split(sourceText).join(saferRewrite)
        applied = true
        resumePatched = true
      }
      if (!applied && profileMarkdown && profileMarkdown.includes(sourceText)) {
        profileMarkdown = profileMarkdown.split(sourceText).join(saferRewrite)
        applied = true
        profilePatched = true
      }
    }

    if (applied) {
      await serviceClient
        .from("risk_issues")
        .update({ status: "applied" })
        .eq("id", issue.id)
        .eq("case_id", caseId)
    } else {
      unmatchedIssues.push(issue)
    }
  }

  if (unmatchedIssues.length > 0) {
    const result = await generateOutputs(caseId, true)
    if (!result.success) {
      return { success: false, error: `部分风险建议无法直接匹配，重新生成失败：${result.error}` }
    }

    const { data: newResume } = await serviceClient
      .from("generated_outputs")
      .select("markdown")
      .eq("case_id", caseId)
      .eq("output_type", "resume_markdown")
      .order("version", { ascending: false })
      .limit(1)

    const newResumeArr = Array.isArray(newResume) ? newResume : newResume ? [newResume] : []
    const newResumeMd = newResumeArr[0]?.markdown ?? ""

    for (const issue of unmatchedIssues) {
      const sourceText = issue.source_text as string | null
      if (sourceText && newResumeMd.includes(sourceText)) {
        return {
          success: false,
          error: `重新生成后风险点 "${sourceText.slice(0, 80)}..." 仍然存在，请手动处理`,
        }
      }
    }

    for (const issue of unmatchedIssues) {
      await serviceClient
        .from("risk_issues")
        .update({ status: "applied" })
        .eq("id", issue.id)
        .eq("case_id", caseId)
    }

    return {
      success: true,
      message: "已通过重新生成应用所有风险建议",
      patched: false,
      regenerated: true,
    }
  }

  if (resumePatched || profilePatched) {
    const outputsToInsert: {
      case_id: string
      output_type: string
      title: string | null
      markdown: string
      content: Record<string, unknown> | null
      version: number
      template_id: string | null
      prompt_version: string | null
    }[] = []

    if (resumePatched && resumeMarkdown && latestResume) {
      const newVersion = latestResume.version + 1
      outputsToInsert.push({
        case_id: caseId,
        output_type: "resume_markdown",
        title: latestResume.title ?? null,
        markdown: resumeMarkdown,
        content: latestResume.content as Record<string, unknown> | null,
        version: newVersion,
        template_id: latestResume.template_id ?? null,
        prompt_version: "risk_fix_applied",
      })
    }

    if (profilePatched && profileMarkdown && latestProfile) {
      const newVersion = latestProfile.version + 1
      outputsToInsert.push({
        case_id: caseId,
        output_type: "profile_page",
        title: latestProfile.title ?? null,
        markdown: profileMarkdown,
        content: latestProfile.content as Record<string, unknown> | null,
        version: newVersion,
        template_id: latestProfile.template_id ?? null,
        prompt_version: "risk_fix_applied",
      })
    }

    if (outputsToInsert.length > 0) {
      const { error: insertError } = await serviceClient
        .from("generated_outputs")
        .insert(outputsToInsert)

      if (insertError) {
        return { success: false, error: `保存新版本失败：${normalizeError(insertError)}` }
      }
    }

    for (const issue of issuesArr) {
      const sourceText = issue.source_text as string | null
      const sourceType = issue.source_type as string | null

      if (sourceText) {
        const targetMd = sourceType === "profile_page" ? profileMarkdown : resumeMarkdown
        if (targetMd && targetMd.includes(sourceText)) {
          return {
            success: false,
            error: `应用后风险原文 "${sourceText.slice(0, 80)}..." 仍然存在，可能存在部分匹配问题`,
          }
        }
      }
    }

    return {
      success: true,
      message: `已应用 ${issuesArr.length} 条风险建议，创建新版本`,
      patched: true,
      regenerated: false,
    }
  }

  return { success: false, error: "没有可应用的修改" }
}
