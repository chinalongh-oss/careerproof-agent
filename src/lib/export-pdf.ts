import "server-only"

import { serviceClient } from "@/lib/supabase/service"

const BUCKET_NAME = "exports"

type ExportPdfResult = {
  pdfBuffer: Uint8Array
  sha256: string
  storagePath: string
  signedUrl: string
  artifactId: string
}

async function sha256hex(input: Uint8Array): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", input as BufferSource)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function exportHtmlToPdf(options: {
  caseId: string
  printUrl: string
  adminCookie?: string
  artifactType: string
  sourceOutputId?: string
  templateVersion?: string | null
  schemaVersion?: string | null
  appUrl: string
}): Promise<{ ok: true; result: ExportPdfResult } | { ok: false; error: string }> {
  const { caseId, printUrl, adminCookie, artifactType, sourceOutputId, templateVersion, schemaVersion, appUrl } = options

  let pdfBytes: Uint8Array

  try {
    const playwright = await import("playwright")
    const browser = await playwright.chromium.launch({ headless: true })

    try {
      const context = await browser.newContext()

      if (adminCookie) {
        await context.addCookies([
          {
            name: "admin_token",
            value: adminCookie,
            domain: new URL(appUrl).hostname,
            path: "/",
            httpOnly: true,
            sameSite: "Lax" as const,
          },
        ])
      }

      const page = await context.newPage()

      try {
        await page.goto(printUrl, { waitUntil: "domcontentloaded", timeout: 30000 })
        await page.waitForSelector('[data-render-ready="true"]', { timeout: 15000 })
        await page.evaluate(() => document.fonts.ready)

        pdfBytes = new Uint8Array(
          await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            margin: {
              top: "10mm",
              right: "12mm",
              bottom: "10mm",
              left: "12mm",
            },
          })
        )
      } finally {
        await page.close()
        await context.close()
        await browser.close()
      }
    } catch {
      await browser.close()
      throw new Error("浏览器启动失败")
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (message.includes("net::ERR_") || message.includes("NS_ERROR_")) {
      return {
        ok: false,
        error: `无法连接打印页面：${printUrl}。请确保 next dev 正在运行且打印页面可访问。`,
      }
    }
    return { ok: false, error: `Playwright 启动失败：${message}` }
  }

  const sha256 = await sha256hex(pdfBytes)
  const timestamp = Date.now()
  const prefix = artifactType === "resume_pdf" ? "resume" : "interview"
  const storagePath = `${prefix}/${caseId}/${timestamp}.pdf`

  const { error: uploadError } = await serviceClient.storage
    .from(BUCKET_NAME)
    .upload(storagePath, pdfBytes, {
      contentType: "application/pdf",
      cacheControl: "3600",
    })

  if (uploadError) {
    const msg = uploadError.message || ""
    if (msg.includes("not found") || msg.includes("exist")) {
      return {
        ok: false,
        error: `Storage bucket "${BUCKET_NAME}" 不存在，请先在 Supabase Dashboard 创建 private bucket: ${BUCKET_NAME}`,
      }
    }
    return { ok: false, error: `上传 PDF 失败：${uploadError.message}` }
  }

  const { data: signedUrlData, error: signedUrlError } = await serviceClient.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 3600)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return { ok: false, error: `生成签名链接失败：${signedUrlError?.message || "未知错误"}` }
  }

  const { data: artifact, error: artifactError } = await serviceClient
    .from("export_artifacts")
    .insert({
      case_id: caseId,
      artifact_type: artifactType,
      storage_path: storagePath,
      sha256,
      template_version: templateVersion || null,
      schema_version: schemaVersion || null,
      source_output_id: sourceOutputId || null,
    })
    .select("id,created_at")
    .single()

  if (artifactError) {
    return { ok: false, error: `写入导出记录失败：${artifactError.message}` }
  }

  return {
    ok: true,
    result: {
      pdfBuffer: pdfBytes,
      sha256,
      storagePath,
      signedUrl: signedUrlData.signedUrl,
      artifactId: (artifact as { id: string }).id,
    },
  }
}
