import "server-only"

import { serviceClient } from "@/lib/supabase/service"

const MATERIALS_BUCKET = "materials"

async function downloadFromStorage(storagePath: string): Promise<ArrayBuffer | null> {
  try {
    const { data, error } = await serviceClient.storage
      .from(MATERIALS_BUCKET)
      .download(storagePath)

    if (error || !data) {
      console.error(`[file-parser] download failed: ${error?.message || "no data"}`)
      return null
    }

    return await data.arrayBuffer()
  } catch (e) {
    console.error(`[file-parser] download exception: ${e instanceof Error ? e.message : String(e)}`)
    return null
  }
}

async function extractPdfText(data: ArrayBuffer): Promise<string | null> {
  try {
    const pdfParse = (await import("pdf-parse")).default
    const result = await pdfParse(Buffer.from(data))
    return result.text || null
  } catch (e) {
    console.error(`[file-parser] pdf extraction failed: ${e instanceof Error ? e.message : String(e)}`)
    return null
  }
}

async function extractDocxText(data: ArrayBuffer): Promise<string | null> {
  try {
    const mammoth = (await import("mammoth")).default
    const result = await mammoth.extractRawText({ buffer: Buffer.from(data) })
    return result.value || null
  } catch (e) {
    console.error(`[file-parser] docx extraction failed: ${e instanceof Error ? e.message : String(e)}`)
    return null
  }
}

export interface ExtractResult {
  rawText: string
  parseStatus: "completed" | "failed"
  parseError: string | null
}

export async function extractTextFromDocument(
  filePath: string,
  mimeType: string | null
): Promise<ExtractResult> {
  const arrayBuffer = await downloadFromStorage(filePath)
  if (!arrayBuffer) {
    return {
      rawText: "",
      parseStatus: "failed",
      parseError: "无法从存储下载文件",
    }
  }

  const mime = mimeType ?? ""

  if (mime === "application/pdf") {
    const text = await extractPdfText(arrayBuffer)
    if (!text || text.trim().length === 0) {
      return {
        rawText: "",
        parseStatus: "failed",
        parseError: "PDF 文件无法提取文本（可能是扫描件或加密文件）",
      }
    }
    return { rawText: text, parseStatus: "completed", parseError: null }
  }

  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword"
  ) {
    const text = await extractDocxText(arrayBuffer)
    if (!text || text.trim().length === 0) {
      return {
        rawText: "",
        parseStatus: "failed",
        parseError: "DOCX 文件无法提取文本",
      }
    }
    return { rawText: text, parseStatus: "completed", parseError: null }
  }

  if (mime === "text/plain" || mime === "text/markdown" || mime === "text/x-markdown") {
    const text = new TextDecoder().decode(arrayBuffer)
    if (!text.trim()) {
      return {
        rawText: "",
        parseStatus: "failed",
        parseError: "文件内容为空",
      }
    }
    return { rawText: text, parseStatus: "completed", parseError: null }
  }

  return {
    rawText: "",
    parseStatus: "failed",
    parseError: `不支持的文件类型：${mime || "未知"}`,
  }
}

export async function ensureDocumentText(
  doc: {
    id: string
    case_id: string
    type: string
    raw_text: string | null
    file_path: string | null
    mime_type: string | null
    parse_status: string | null
  }
): Promise<string | null> {
  if (doc.raw_text) return doc.raw_text

  if (!doc.file_path) return null

  const result = await extractTextFromDocument(doc.file_path, doc.mime_type)

  if (result.parseStatus === "completed" && result.rawText) {
    await serviceClient
      .from("documents")
      .update({
        raw_text: result.rawText,
        parse_status: "completed",
        parse_error: null,
      })
      .eq("id", doc.id)
      .eq("case_id", doc.case_id)

    return result.rawText
  }

  await serviceClient
    .from("documents")
    .update({
      parse_status: "failed",
      parse_error: result.parseError,
    })
    .eq("id", doc.id)
    .eq("case_id", doc.case_id)

  return null
}
