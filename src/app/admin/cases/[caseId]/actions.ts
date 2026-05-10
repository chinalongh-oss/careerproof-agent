"use server"

import { revalidatePath } from "next/cache"
import { serviceClient, normalizeError } from "@/lib/supabase/service"
import { parseResume } from "@/lib/agents/parse-resume"
import { buildProjectCards } from "@/lib/agents/build-project-cards"

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
