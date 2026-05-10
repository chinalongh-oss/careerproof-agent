"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { serviceClient } from "@/lib/supabase/service"

export async function submitCaseAction(formData: FormData) {
  const candidate_name = (formData.get("candidate_name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const wechat = (formData.get("wechat") as string)?.trim()
  const current_title = (formData.get("current_title") as string)?.trim()
  const target_direction = (formData.get("target_direction") as string)?.trim()
  const target_role = (formData.get("target_role") as string)?.trim()
  const resume_text = (formData.get("resume_text") as string)?.trim()
  const raw_jd = (formData.get("raw_jd") as string)?.trim()
  const project_material = (formData.get("project_material") as string)?.trim()
  const portfolio_links = (formData.get("portfolio_links") as string)?.trim()
  const privacy_notes = (formData.get("privacy_notes") as string)?.trim()

  if (!candidate_name) return { success: false, error: "请填写姓名" }
  if (!resume_text) return { success: false, error: "请填写简历文本" }

  try {
    const insertPayload = {
      candidate_name,
      email: email || null,
      wechat: wechat || null,
      current_title: current_title || null,
      target_direction: target_direction || null,
      target_role: target_role || null,
      status: "new_submitted",
      privacy_notes: privacy_notes || null,
    }

    const { data: caseData, error: caseError } = await serviceClient
      .from("cases")
      .insert(insertPayload)
      .select("id")
      .single()

    if (caseError || !caseData) {
      return { success: false, error: `创建案例失败：${caseError?.message || "未知错误"}` }
    }

    const caseId = caseData.id

    const docsToInsert: { case_id: string; type: string; raw_text: string }[] = [
      { case_id: caseId, type: "resume", raw_text: resume_text },
    ]

    if (raw_jd) {
      docsToInsert.push({ case_id: caseId, type: "jd", raw_text: raw_jd })
    }

    const combinedMaterial = [project_material, portfolio_links]
      .filter(Boolean)
      .join("\n\n---\n\n")

    if (combinedMaterial) {
      docsToInsert.push({
        case_id: caseId,
        type: "project_material",
        raw_text: combinedMaterial,
      })
    }

    const { error: docError } = await serviceClient
      .from("documents")
      .insert(docsToInsert)

    if (docError) {
      return { success: false, error: `保存文档失败：${docError.message}` }
    }
  } catch (e) {
    return { success: false, error: `提交异常：${e instanceof Error ? e.message : String(e)}` }
  }

  revalidatePath("/admin/cases")
  redirect("/submit/success")
}
