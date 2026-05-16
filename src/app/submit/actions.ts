"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { serviceClient } from "@/lib/supabase/service"

const MATERIALS_BUCKET = "materials"

function mimeTypeFromFile(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  switch (ext) {
    case "pdf": return "application/pdf"
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    case "doc": return "application/msword"
    case "txt": return "text/plain"
    case "md": return "text/markdown"
    default: return file.type || "application/octet-stream"
  }
}

async function uploadFileToStorage(
  file: File,
  caseId: string,
  type: string
): Promise<{
  filePath: string
  fileName: string
  mimeType: string
  fileSize: number
} | null> {
  try {
    const bytes = await file.arrayBuffer()
    const timestamp = Date.now()
    const ext = file.name.split(".").pop() ?? "bin"
    const storagePath = `${caseId}/${type}_${timestamp}.${ext}`

    const mime = mimeTypeFromFile(file)
    const { error: uploadError } = await serviceClient.storage
      .from(MATERIALS_BUCKET)
      .upload(storagePath, bytes, {
        contentType: mime,
        cacheControl: "3600",
      })

    if (uploadError) {
      console.error(`[uploadFileToStorage] upload failed: ${uploadError.message}`)
      return null
    }

    return {
      filePath: storagePath,
      fileName: file.name,
      mimeType: mime,
      fileSize: file.size,
    }
  } catch (e) {
    console.error(`[uploadFileToStorage] exception: ${e instanceof Error ? e.message : String(e)}`)
    return null
  }
}

export async function submitCaseAction(formData: FormData) {
  const candidate_name = (formData.get("candidate_name") as string)?.trim()
  const email = (formData.get("email") as string)?.trim()
  const wechat = (formData.get("wechat") as string)?.trim()
  const current_title = (formData.get("current_title") as string)?.trim()
  const target_direction = (formData.get("target_direction") as string)?.trim()
  const target_role = (formData.get("target_role") as string)?.trim()
  const privacy_notes = (formData.get("privacy_notes") as string)?.trim()

  const resumeFile = formData.get("resume_file") as File | null
  const jdFile = formData.get("jd_file") as File | null
  const materialFile = formData.get("material_file") as File | null

  if (!candidate_name) return { success: false, error: "请填写姓名" }
  if (!resumeFile || !(resumeFile instanceof File) || resumeFile.size === 0) {
    return { success: false, error: "请上传简历文件" }
  }

  let caseId = ""

  try {
    const insertPayload = {
      candidate_name,
      email: email || null,
      wechat: wechat || null,
      current_title: current_title || null,
      target_direction: target_direction || null,
      target_role: target_role || null,
      status: "new_submitted" as const,
      privacy_notes: privacy_notes || null,
    }

    const { data: caseData, error: caseError } = await serviceClient
      .from("cases")
      .insert(insertPayload)
      .select("id")
      .single()

    if (caseError || !caseData) {
      let errDetail: string
      if (caseError) {
        try {
          errDetail = JSON.stringify(caseError)
        } catch {
          errDetail = String(caseError)
        }
      } else {
        errDetail = "insert 返回空数据"
      }
      return { success: false, error: `创建案例失败：${errDetail}` }
    }

    caseId = caseData.id

    const docsToInsert: {
      case_id: string
      type: string
      file_path: string | null
      file_name: string | null
      mime_type: string | null
      file_size: number | null
      parse_status: string
      raw_text: null
    }[] = []

    const resumeMeta = await uploadFileToStorage(resumeFile, caseId, "resume")
    if (!resumeMeta) {
      await serviceClient.from("cases").delete().eq("id", caseId)
      return { success: false, error: "简历文件上传失败，请重试" }
    }
    docsToInsert.push({
      case_id: caseId,
      type: "resume",
      file_path: resumeMeta.filePath,
      file_name: resumeMeta.fileName,
      mime_type: resumeMeta.mimeType,
      file_size: resumeMeta.fileSize,
      parse_status: "pending",
      raw_text: null,
    })

    if (jdFile && jdFile instanceof File && jdFile.size > 0) {
      const jdMeta = await uploadFileToStorage(jdFile, caseId, "jd")
      if (jdMeta) {
        docsToInsert.push({
          case_id: caseId,
          type: "jd",
          file_path: jdMeta.filePath,
          file_name: jdMeta.fileName,
          mime_type: jdMeta.mimeType,
          file_size: jdMeta.fileSize,
          parse_status: "pending",
          raw_text: null,
        })
      }
    }

    if (materialFile && materialFile instanceof File && materialFile.size > 0) {
      const matMeta = await uploadFileToStorage(materialFile, caseId, "material")
      if (matMeta) {
        docsToInsert.push({
          case_id: caseId,
          type: "project_material",
          file_path: matMeta.filePath,
          file_name: matMeta.fileName,
          mime_type: matMeta.mimeType,
          file_size: matMeta.fileSize,
          parse_status: "pending",
          raw_text: null,
        })
      }
    }

    const { error: docError } = await serviceClient
      .from("documents")
      .insert(docsToInsert)

    if (docError) {
      await serviceClient.from("cases").delete().eq("id", caseId)
      return { success: false, error: `保存文档失败，已回滚案例：${caseId}，错误：${docError.message}` }
    }
  } catch (e) {
    return { success: false, error: `提交异常：${e instanceof Error ? e.message : String(e)}` }
  }

  revalidatePath("/admin/cases")
  redirect(`/submit/success?caseId=${caseId}`)
}
