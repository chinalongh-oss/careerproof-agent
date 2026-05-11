"use server"

import { revalidatePath } from "next/cache"
import { serviceClient, normalizeError } from "@/lib/supabase/service"
import { parseResume } from "@/lib/agents/parse-resume"
import { buildProjectCards } from "@/lib/agents/build-project-cards"
import { parseJD } from "@/lib/agents/parse-jd"
import { generateCareerFingerprint } from "@/lib/agents/generate-career-fingerprint"
import { generatePositionings } from "@/lib/agents/generate-positionings"
import { generateOutputs } from "@/lib/agents/generate-outputs"
import { auditRisks } from "@/lib/agents/audit-risks"

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

export async function updateProjectCard(
  cardId: string,
  caseId: string,
  data: Record<string, unknown>
) {
  try {
    const { error } = await serviceClient
      .from("project_cards")
      .update(data)
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

export async function generateOutputsAction(caseId: string) {
  try {
    const result = await generateOutputs(caseId)
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
      .select("version,content,template_id,prompt_version")
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

async function computeTrustLevel(caseId: string): Promise<{
  level: string
  reason?: string
}> {
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
