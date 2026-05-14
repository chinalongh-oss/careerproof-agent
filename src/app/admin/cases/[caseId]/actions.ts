"use server"

import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"
import { serviceClient, normalizeError } from "@/lib/supabase/service"
import { parseResume } from "@/lib/agents/parse-resume"
import { buildProjectCards } from "@/lib/agents/build-project-cards"
import { parseJD } from "@/lib/agents/parse-jd"
import { generateCareerFingerprint } from "@/lib/agents/generate-career-fingerprint"
import { generatePositionings } from "@/lib/agents/generate-positionings"
import { generateOutputs } from "@/lib/agents/generate-outputs"
import { auditRisks } from "@/lib/agents/audit-risks"
import { generateInterviewPack } from "@/lib/agents/generate-interview-pack"
import { applyRiskFixes } from "@/lib/agents/apply-risk-fixes"
import { evaluateJobFit } from "@/lib/agents/evaluate-job-fit"
import { generateQualityReview } from "@/lib/agents/generate-quality-review"

export async function updateDocText(docId: string, caseId: string, rawText: string) {
  try {
    const { error } = await serviceClient
      .from("documents")
      .update({ raw_text: rawText })
      .eq("id", docId)
      .eq("case_id", caseId)

    if (error) {
      return { success: false, error: `保存失败：${normalizeError(error)}` }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: `保存异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function updateCasePrivacyNotes(caseId: string, privacyNotes: string) {
  try {
    const { error } = await serviceClient
      .from("cases")
      .update({ privacy_notes: privacyNotes, updated_at: new Date().toISOString() })
      .eq("id", caseId)

    if (error) {
      return { success: false, error: `保存失败：${normalizeError(error)}` }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: `保存异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function updateCaseStatus(caseId: string, status: string) {
  try {
    const { error } = await serviceClient
      .from("cases")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", caseId)

    if (error) {
      return { success: false, error: `更新状态失败：${normalizeError(error)}` }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: `更新状态异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function parseResumeAction(caseId: string) {
  try {
    const result = await parseResume(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/evidence`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `解析简历异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function buildProjectCardsAction(caseId: string) {
  try {
    const result = await buildProjectCards(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/evidence`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `生成证据卡异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

const PROJECT_CARD_EDITABLE_FIELDS = new Set([
  "project_name",
  "business_context",
  "business_problem",
  "candidate_role",
  "personal_actions",
  "team_actions",
  "metrics",
  "result_summary",
  "evidence_level",
  "public_visibility",
  "risk_flags",
  "recommended_expression",
  "not_recommended_expression",
  "interview_risks",
  "role_angle_tags",
  "reader_lens_tags",
  "is_featured",
])

export async function updateProjectCard(
  cardId: string,
  caseId: string,
  data: Record<string, unknown>
) {
  try {
    const filtered: Record<string, unknown> = {}
    for (const key of Object.keys(data)) {
      if (PROJECT_CARD_EDITABLE_FIELDS.has(key)) {
        filtered[key] = data[key]
      }
    }

    if (Object.keys(filtered).length === 0) {
      return { success: false, error: "没有可更新的字段" }
    }

    const { error } = await serviceClient
      .from("project_cards")
      .update(filtered)
      .eq("id", cardId)
      .eq("case_id", caseId)

    if (error) {
      return { success: false, error: `保存失败：${normalizeError(error)}` }
    }

    revalidatePath(`/admin/cases/${caseId}/evidence`)
    return { success: true, message: "保存成功" }
  } catch (e) {
    return { success: false, error: `保存异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function toggleFeaturedAction(cardId: string, caseId: string, currentFeatured: boolean) {
  try {
    const { error } = await serviceClient
      .from("project_cards")
      .update({ is_featured: !currentFeatured })
      .eq("id", cardId)
      .eq("case_id", caseId)

    if (error) {
      return { success: false, error: `标记失败：${normalizeError(error)}` }
    }

    revalidatePath(`/admin/cases/${caseId}/evidence`)
    return { success: true, message: currentFeatured ? "已取消重点项目" : "已标记为重点项目" }
  } catch (e) {
    return { success: false, error: `操作异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function regenerateCardsAction(caseId: string) {
  try {
    const result = await buildProjectCards(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/evidence`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `重新生成异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function parseJDAction(caseId: string) {
  try {
    const result = await parseJD(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/jd`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `解析 JD 异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function generateFingerprintAction(caseId: string) {
  try {
    const result = await generateCareerFingerprint(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/positioning`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `生成职业指纹异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function generatePositioningsAction(caseId: string) {
  try {
    const result = await generatePositionings(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/positioning`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `生成职业定位异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function selectPositioningAction(caseId: string, positioningId: string) {
  try {
    const { data: pos, error: posError } = await serviceClient
      .from("positionings")
      .select("id,case_id")
      .eq("id", positioningId)
      .eq("case_id", caseId)
      .single()

    if (posError || !pos) {
      return { success: false, error: "定位不存在或不属于当前案例" }
    }

    const { error: unsetError } = await serviceClient
      .from("positionings")
      .update({ selected: false })
      .eq("case_id", caseId)
      .eq("selected", true)

    if (unsetError) {
      return { success: false, error: `取消旧选择失败：${normalizeError(unsetError)}` }
    }

    const { error: setError } = await serviceClient
      .from("positionings")
      .update({ selected: true })
      .eq("id", positioningId)
      .eq("case_id", caseId)

    if (setError) {
      return { success: false, error: `选择定位失败：${normalizeError(setError)}` }
    }

    revalidatePath(`/admin/cases/${caseId}/positioning`)
    return { success: true, message: "已选择此定位策略" }
  } catch (e) {
    return { success: false, error: `选择定位异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function generateOutputsAction(
  caseId: string,
  options?: { forceRegenerate?: boolean; forceGenerate?: boolean }
) {
  try {
    const result = await generateOutputs(caseId, options?.forceRegenerate ?? false, options?.forceGenerate ?? false)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/outputs`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `生成交付物异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function saveOutputAction(
  caseId: string,
  outputType: string,
  markdown: string,
  title?: string
) {
  try {
    const { data: allVersions } = await serviceClient
      .from("generated_outputs")
      .select("version,content,template_id,prompt_version,is_current,delivery_mode,target_role,delivery_variant_key")
      .eq("case_id", caseId)
      .eq("output_type", outputType)
      .order("version", { ascending: false })

    const versions = Array.isArray(allVersions) ? allVersions : allVersions ? [allVersions] : []
    const currentVersion = versions.length > 0 ? versions[0].version : 0
    const newVersion = currentVersion + 1

    const versionWithContent = versions.find(
      (v) => v.content != null && typeof v.content === "object" && Object.keys(v.content as Record<string, unknown>).length > 0
    )
    const existingContent = versionWithContent?.content ?? null
    const existingTemplateId = versions.length > 0 ? versions[0].template_id : null
    const existingPromptVersion = versions.length > 0 ? versions[0].prompt_version : "manual_edit"

    const currentVariant = versions.find(
      (v) => v.is_current === true
    )
    const existingDeliveryMode = (currentVariant as Record<string, unknown> | null)?.delivery_mode as string | null ?? null
    const existingTargetRole = (currentVariant as Record<string, unknown> | null)?.target_role as string | null ?? null
    const existingVariantKey = (currentVariant as Record<string, unknown> | null)?.delivery_variant_key as string | null ?? null

    if (existingVariantKey) {
      await serviceClient
        .from("generated_outputs")
        .update({ is_current: false })
        .eq("case_id", caseId)
        .eq("output_type", outputType)
        .eq("delivery_variant_key", existingVariantKey)
        .eq("is_current", true)
    }

    const { error: insertError } = await serviceClient
      .from("generated_outputs")
      .insert({
        case_id: caseId,
        output_type: outputType,
        title: title || null,
        markdown,
        content: existingContent,
        version: newVersion,
        template_id: existingTemplateId,
        prompt_version: existingPromptVersion,
        delivery_mode: existingDeliveryMode,
        target_role: existingTargetRole,
        delivery_variant_key: existingVariantKey,
        is_current: true,
      })

    if (insertError) {
      return { success: false, error: `保存失败：${normalizeError(insertError)}` }
    }

    revalidatePath(`/admin/cases/${caseId}/outputs`)
    return { success: true, message: `已保存为 v${newVersion}` }
  } catch (e) {
    return { success: false, error: `保存异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function setDeliveryTargetAction(
  caseId: string,
  deliveryMode: string,
  sourceType: string,
  forceGenerate: boolean,
  forceReason?: string,
  targetRole?: string,
  riskAcknowledged = false
) {
  try {
    const roleVal = targetRole ?? null
    let query = serviceClient
      .from("selected_delivery_targets")
      .select("id")
      .eq("case_id", caseId)
      .eq("delivery_mode", deliveryMode)

    if (roleVal === null) {
      query = query.is("target_role", null)
    } else {
      query = query.eq("target_role", roleVal)
    }

    const { data: existing } = await query.limit(1)

    const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : []

    if (existingArr.length > 0) {
      const { error } = await serviceClient
        .from("selected_delivery_targets")
        .delete()
        .eq("id", (existingArr[0] as Record<string, unknown>).id as string)

      if (error) {
        return { success: false, error: `取消选择失败：${normalizeError(error)}` }
      }
    } else {
      const { error } = await serviceClient
        .from("selected_delivery_targets")
        .insert({
          case_id: caseId,
          source_type: sourceType,
          delivery_mode: deliveryMode,
          target_role: roleVal,
          force_generate: forceGenerate,
          force_reason: forceReason ?? null,
          risk_acknowledged: riskAcknowledged,
        })

      if (error) {
        return { success: false, error: `保存交付目标失败：${normalizeError(error)}` }
      }
    }

    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/outputs`)
    return { success: true, message: existingArr.length > 0 ? "已取消选择" : "已选择" }
  } catch (e) {
    return { success: false, error: `操作异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function evaluateJobFitAction(caseId: string) {
  try {
    const result = await evaluateJobFit(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/positioning`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `岗位适配判断异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function auditRisksAction(caseId: string) {
  try {
    const result = await auditRisks(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/risk`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `风险审查异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function generateInterviewPackAction(caseId: string, forceRegenerate = false) {
  try {
    const result = await generateInterviewPack(caseId, forceRegenerate)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/interview`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `生成面试准备包异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function updateRiskIssueAction(
  issueId: string,
  caseId: string,
  status: string
) {
  try {
    const { error } = await serviceClient
      .from("risk_issues")
      .update({ status })
      .eq("id", issueId)
      .eq("case_id", caseId)

    if (error) {
      return { success: false, error: `更新风险状态失败：${normalizeError(error)}` }
    }

    revalidatePath(`/admin/cases/${caseId}/risk`)
    return { success: true, message: "风险状态已更新" }
  } catch (e) {
    return { success: false, error: `更新风险状态异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function applyAcceptedRisksAction(caseId: string) {
  try {
    const result = await applyRiskFixes(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/risk`)
    revalidatePath(`/admin/cases/${caseId}/outputs`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `应用风险建议异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

async function computeTrustLevel(caseId: string): Promise<{
  level: string
  reason?: string
}> {
  const { data: caseData } = await serviceClient
    .from("cases")
    .select("status")
    .eq("id", caseId)
    .single()

  const status = (caseData as Record<string, unknown> | null)?.status as string | undefined

  const reviewedStatuses = ["risk_reviewed", "interview_ready", "delivered"]
  const statusReviewed = status ? reviewedStatuses.includes(status) : false

  let runsReviewed = false
  if (!statusReviewed) {
    const { data: runs } = await serviceClient
      .from("generation_runs")
      .select("error")
      .eq("case_id", caseId)
      .eq("agent_name", "audit_risks")
      .order("created_at", { ascending: false })
      .limit(1)

    const runsArr = Array.isArray(runs) ? runs : runs ? [runs] : []
    if (runsArr.length > 0) {
      const latest = runsArr[0] as Record<string, unknown>
      runsReviewed = latest.error === null
    }
  }

  if (!statusReviewed && !runsReviewed) {
    return { level: "未审查", reason: "尚未运行风险审查" }
  }

  const { data: issues } = await serviceClient
    .from("risk_issues")
    .select("risk_type,risk_level,status")
    .eq("case_id", caseId)

  const issuesArr = Array.isArray(issues) ? issues : issues ? [issues] : []

  const hasOpenHigh = issuesArr.some(
    (r: Record<string, unknown>) => r.risk_level === "high" && r.status === "open"
  )
  if (hasOpenHigh) {
    return { level: "需说明", reason: "存在高风险待处理" }
  }

  const hasSensitiveFixed = issuesArr.some(
    (r: Record<string, unknown>) =>
      r.risk_type === "sensitive_info" && (r.status === "accepted" || r.status === "fixed")
  )
  if (hasSensitiveFixed) {
    return { level: "已脱敏", reason: "已处理敏感信息" }
  }

  const hasOpenMediumHigh = issuesArr.some(
    (r: Record<string, unknown>) =>
      (r.risk_level === "high" || r.risk_level === "medium") && r.status === "open"
  )
  if (!hasOpenMediumHigh) {
    return { level: "已审查", reason: "无重大风险项" }
  }

  return { level: "需说明", reason: "存在需说明的风险项" }
}

export async function savePublicPageThemeAction(
  caseId: string,
  selectedTheme: string
) {
  try {
    if (!["minimal", "professional", "headhunter_quickview"].includes(selectedTheme)) {
      return { success: false, error: "无效的主题值" }
    }

    const { data: existing } = await serviceClient
      .from("public_pages")
      .select("id")
      .eq("case_id", caseId)
      .limit(1)

    const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : []

    if (existingArr.length > 0) {
      const { error } = await serviceClient
        .from("public_pages")
        .update({ selected_theme: selectedTheme })
        .eq("case_id", caseId)

      if (error) {
        return { success: false, error: `保存主题失败：${normalizeError(error)}` }
      }
    } else {
      const { data: caseData } = await serviceClient
        .from("cases")
        .select("candidate_name")
        .eq("id", caseId)
        .single()

      const { generateSlug } = await import("@/lib/slug")
      const slug = generateSlug(caseData?.candidate_name ?? null)

      const { error: insertError } = await serviceClient
        .from("public_pages")
        .insert({
          case_id: caseId,
          slug,
          selected_theme: selectedTheme,
          is_published: false,
          page_content: null,
        })

      if (insertError) {
        return { success: false, error: `创建主题草稿失败：${normalizeError(insertError)}` }
      }
    }

    revalidatePath(`/admin/cases/${caseId}/outputs`)
    return { success: true, message: "主题已保存" }
  } catch (e) {
    return { success: false, error: `保存主题异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function upsertPublicPageAction(
  caseId: string,
  slug?: string,
  selectedTheme?: string,
  outputId?: string
) {
  try {
    const theme = selectedTheme ?? "minimal"
    if (!["minimal", "professional", "headhunter_quickview"].includes(theme)) {
      return { success: false, error: "无效的主题值" }
    }

    let profileContent: Record<string, unknown> | null = null

    if (outputId) {
      const { data: output } = await serviceClient
        .from("generated_outputs")
        .select("content")
        .eq("id", outputId)
        .eq("case_id", caseId)
        .single()

      if (!output) {
        return { success: false, error: "找不到指定的生成输出" }
      }
      profileContent = output.content as Record<string, unknown> | null
    } else {
      const { data: outputs } = await serviceClient
        .from("generated_outputs")
        .select("content,version")
        .eq("case_id", caseId)
        .eq("output_type", "profile_page")
        .order("version", { ascending: false })

      const outputsArr = Array.isArray(outputs) ? outputs : outputs ? [outputs] : []
      if (outputsArr.length === 0) {
        return { success: false, error: "请先生成个人主页内容" }
      }

      const versionWithContent = outputsArr.find(
        (v) => v.content != null && typeof v.content === "object" && Object.keys(v.content as Record<string, unknown>).length > 0
      )
      profileContent = (versionWithContent?.content ?? null) as Record<string, unknown> | null
    }

    if (!profileContent || typeof profileContent !== "object" || Object.keys(profileContent).length === 0) {
      return { success: false, error: "个人主页结构化内容为空，请先点击「重新生成」通过 AI 生成主页内容" }
    }

    const trustResult = await computeTrustLevel(caseId)

    const enrichedContent = {
      ...profileContent,
      _computed_trust_level: trustResult.level,
      _computed_trust_reason: trustResult.reason,
    }

    let finalSlug = slug

    if (!finalSlug) {
      const { data: caseData } = await serviceClient
        .from("cases")
        .select("candidate_name")
        .eq("id", caseId)
        .single()

      const { generateSlug } = await import("@/lib/slug")
      finalSlug = generateSlug(caseData?.candidate_name ?? null)
    }

    const { validateSlug, checkSlugUnique } = await import("@/lib/slug")
    const slugError = validateSlug(finalSlug)
    if (slugError) {
      return { success: false, error: slugError }
    }

    const isUnique = await checkSlugUnique(finalSlug, caseId)
    if (!isUnique) {
      return { success: false, error: `slug "${finalSlug}" 已被占用，请使用其他 slug` }
    }

    const { data: existing } = await serviceClient
      .from("public_pages")
      .select("id")
      .eq("case_id", caseId)
      .limit(1)

    const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : []

    if (existingArr.length > 0) {
      const { error: updateError } = await serviceClient
        .from("public_pages")
        .update({
          slug: finalSlug,
          selected_theme: theme,
          page_content: enrichedContent,
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("case_id", caseId)

      if (updateError) {
        return { success: false, error: `更新公开页失败：${normalizeError(updateError)}` }
      }
    } else {
      const { error: insertError } = await serviceClient
        .from("public_pages")
        .insert({
          case_id: caseId,
          slug: finalSlug,
          selected_theme: theme,
          page_content: enrichedContent,
          is_published: true,
        })

      if (insertError) {
        return { success: false, error: `创建公开页失败：${normalizeError(insertError)}` }
      }
    }

    revalidatePath(`/admin/cases/${caseId}/outputs`)
    revalidatePath(`/p/${finalSlug}`)
    return { success: true, message: "公开主页已发布", slug: finalSlug }
  } catch (e) {
    return { success: false, error: `发布异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function markDeliveredAction(caseId: string, resumeOutputId?: string) {
  try {
    const { data: resumeOutputs } = await serviceClient
      .from("generated_outputs")
      .select("id,markdown")
      .eq("case_id", caseId)
      .eq("output_type", "resume_markdown")
      .order("version", { ascending: false })
      .limit(1)

    const resumeArr = Array.isArray(resumeOutputs) ? resumeOutputs : resumeOutputs ? [resumeOutputs] : []
    const latestResume = resumeArr[0] ?? null

    if (!latestResume || !latestResume.markdown) {
      return { success: false, error: "请先生成简历内容（resume_markdown）" }
    }

    const effectiveResumeId = resumeOutputId ?? latestResume.id

    const { data: resumeOutput } = await serviceClient
      .from("generated_outputs")
      .select("is_current")
      .eq("id", effectiveResumeId)
      .eq("case_id", caseId)
      .single()

    const outputRow = resumeOutput as Record<string, unknown> | null
    if (!outputRow || !outputRow.is_current) {
      return { success: false, error: "当前简历版本不是最新交付版本，请重新生成交付包" }
    }

    const { data: artifacts } = await serviceClient
      .from("export_artifacts")
      .select("id,sha256,source_output_id")
      .eq("case_id", caseId)
      .eq("artifact_type", "resume_pdf")
      .order("created_at", { ascending: false })
      .limit(1)

    const artifactsArr = Array.isArray(artifacts) ? artifacts : artifacts ? [artifacts] : []
    const latestArtifact = artifactsArr[0] ?? null

    if (!latestArtifact || !latestArtifact.sha256) {
      return { success: false, error: "请先导出 PDF 简历（需有有效 sha256）" }
    }

    const artifactSourceId = (latestArtifact as Record<string, unknown>).source_output_id as string | null
    if (artifactSourceId !== effectiveResumeId) {
      return { success: false, error: "PDF 版本与当前简历不一致，请重新导出 PDF 后再标记交付" }
    }

    const { data: interviewOutputs } = await serviceClient
      .from("generated_outputs")
      .select("id")
      .eq("case_id", caseId)
      .eq("output_type", "interview_pack")
      .limit(1)

    const interviewArr = Array.isArray(interviewOutputs) ? interviewOutputs : interviewOutputs ? [interviewOutputs] : []
    if (interviewArr.length === 0) {
      return { success: false, error: "请先生成面试准备包（interview_pack）" }
    }

    const { data: caseData } = await serviceClient
      .from("cases")
      .select("status")
      .eq("id", caseId)
      .single()

    if (!caseData) {
      return { success: false, error: "案例不存在" }
    }

    const { data: risks } = await serviceClient
      .from("risk_issues")
      .select("risk_level,status")
      .eq("case_id", caseId)
      .eq("status", "open")
      .in("risk_level", ["high", "medium"])

    const risksArr = Array.isArray(risks) ? risks : risks ? [risks] : []
    const hasHighRisk = risksArr.some(
      (r: Record<string, unknown>) => r.risk_level === "high"
    )

    if (hasHighRisk) {
      return { success: false, error: "存在高风险待处理，请先完成风险审查" }
    }

    if (risksArr.length > 0) {
      return { success: false, error: "存在中等风险待处理，请先完成风险审查" }
    }

    const { data: publicPages } = await serviceClient
      .from("public_pages")
      .select("id,is_published")
      .eq("case_id", caseId)
      .limit(1)

    const pagesArr = Array.isArray(publicPages) ? publicPages : publicPages ? [publicPages] : []
    if (pagesArr.length > 0) {
      const page = pagesArr[0] as Record<string, unknown>
      if (!page.is_published) {
        return { success: false, error: "个人主页已创建但未发布，请先发布主页或将主页设为已发布状态" }
      }
    }

    const { data: qualityData } = await serviceClient
      .from("resume_quality_assessments")
      .select("user_decision")
      .eq("case_id", caseId)
      .limit(1)

    const qualityArr = Array.isArray(qualityData) ? qualityData : qualityData ? [qualityData] : []
    const userDecision = qualityArr.length > 0 ? (qualityArr[0] as Record<string, unknown>).user_decision as string : null

    if (!userDecision || userDecision === "pending") {
      return { success: false, error: "请先在质量对比页选择使用决策（采用新版/旧版/替代岗位版等）" }
    }

    const { error } = await serviceClient
      .from("cases")
      .update({ status: "delivered", updated_at: new Date().toISOString() })
      .eq("id", caseId)

    if (error) {
      return { success: false, error: `更新交付状态失败：${normalizeError(error)}` }
    }

    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/outputs`)
    return { success: true, message: "已标记为已交付" }
  } catch (e) {
    return { success: false, error: `标记已交付异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function setPagePasswordAction(caseId: string, password: string) {
  try {
    if (!password || password.length === 0) {
      return { success: false, error: "密码不能为空" }
    }

    const passwordHash = await hash(password, 10)

    const { data: existing } = await serviceClient
      .from("public_pages")
      .select("id")
      .eq("case_id", caseId)
      .limit(1)

    const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : []

    if (existingArr.length > 0) {
      const { error } = await serviceClient
        .from("public_pages")
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq("case_id", caseId)

      if (error) {
        return { success: false, error: `设置密码失败：${normalizeError(error)}` }
      }
    } else {
      const { data: caseData } = await serviceClient
        .from("cases")
        .select("candidate_name")
        .eq("id", caseId)
        .single()

      const { generateSlug } = await import("@/lib/slug")
      const slug = generateSlug(caseData?.candidate_name ?? null)

      const { error } = await serviceClient
        .from("public_pages")
        .insert({
          case_id: caseId,
          slug,
          selected_theme: "minimal",
          is_published: false,
          page_content: null,
          password_hash: passwordHash,
        })

      if (error) {
        return { success: false, error: `创建密码草稿失败：${normalizeError(error)}` }
      }
    }

    revalidatePath(`/admin/cases/${caseId}/outputs`)
    return { success: true, message: "主页密码已设置" }
  } catch (e) {
    return { success: false, error: `设置密码异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function clearPagePasswordAction(caseId: string) {
  try {
    const { error } = await serviceClient
      .from("public_pages")
      .update({ password_hash: null, updated_at: new Date().toISOString() })
      .eq("case_id", caseId)

    if (error) {
      return { success: false, error: `清除密码失败：${normalizeError(error)}` }
    }

    revalidatePath(`/admin/cases/${caseId}/outputs`)
    return { success: true, message: "主页密码已清除" }
  } catch (e) {
    return { success: false, error: `清除密码异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function generateQualityReviewAction(caseId: string) {
  try {
    const result = await generateQualityReview(caseId)
    if (!result.success) {
      return { success: false, error: result.error }
    }
    revalidatePath(`/admin/cases/${caseId}`)
    revalidatePath(`/admin/cases/${caseId}/quality-review`)
    return { success: true, message: result.message }
  } catch (e) {
    return { success: false, error: `生成质量评审异常：${e instanceof Error ? e.message : String(e)}` }
  }
}

export async function submitUserDecisionAction(caseId: string, decision: string) {
  try {
    const validDecisions = ["use_new", "use_old", "generate_alternative_role", "force_target_version", "request_revision"]
    if (!validDecisions.includes(decision)) {
      return { success: false, error: "无效的决策类型" }
    }

    const { data: existing } = await serviceClient
      .from("resume_quality_assessments")
      .select("id")
      .eq("case_id", caseId)
      .limit(1)

    const existingArr = Array.isArray(existing) ? existing : existing ? [existing] : []

    if (existingArr.length > 0) {
      const { error } = await serviceClient
        .from("resume_quality_assessments")
        .update({ user_decision: decision, updated_at: new Date().toISOString() })
        .eq("case_id", caseId)

      if (error) {
        return { success: false, error: `保存决策失败：${normalizeError(error)}` }
      }
    } else {
      const { error } = await serviceClient
        .from("resume_quality_assessments")
        .insert({
          case_id: caseId,
          user_decision: decision,
        })

      if (error) {
        return { success: false, error: `保存决策失败：${normalizeError(error)}` }
      }
    }

    revalidatePath(`/admin/cases/${caseId}/quality-review`)
    return { success: true, message: "决策已保存" }
  } catch (e) {
    return { success: false, error: `保存决策异常：${e instanceof Error ? e.message : String(e)}` }
  }
}
