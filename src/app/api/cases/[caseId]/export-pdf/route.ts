import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { chromium } from "playwright"
import { serviceClient } from "@/lib/supabase/service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

const BUCKET_NAME = "exports"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params

  const { data: outputsData } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,version,template_id,prompt_version")
    .eq("case_id", caseId)
    .eq("output_type", "resume_markdown")
    .order("version", { ascending: false })
    .limit(1)

  const outputsArr = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []
  const resume = outputsArr[0] ?? null

  if (!resume || !resume.markdown) {
    return NextResponse.json(
      { ok: false, error: "请先生成简历内容（resume_markdown）" },
      { status: 400 }
    )
  }

  const { data: caseData } = await serviceClient
    .from("cases")
    .select("candidate_name")
    .eq("id", caseId)
    .single()

  const candidateName = caseData?.candidate_name || ""
  const nameInMarkdown =
    resume.markdown.includes(candidateName) ||
    /^#\s+\S/.test(resume.markdown)

  if (!candidateName && !nameInMarkdown) {
    console.warn(
      `[export-pdf] case ${caseId}: cases.candidate_name 为空且 markdown 中无姓名，仍继续导出但 PDF 可能缺姓名`
    )
  }

  const appUrl = req.nextUrl.origin
  const printUrl = `${appUrl}/print/cases/${caseId}/resume`

  const adminCookie = req.cookies.get("admin_token")

  let browser: Awaited<ReturnType<typeof chromium.launch>>
  let pdfBuffer: Buffer

  try {
    browser = await chromium.launch({ headless: true })
    const context = await browser.newContext()

    if (adminCookie) {
      await context.addCookies([
        {
          name: "admin_token",
          value: adminCookie.value,
          domain: new URL(appUrl).hostname,
          path: "/",
          httpOnly: true,
          sameSite: "Lax",
        },
      ])
    }

    const page = await context.newPage()

    try {
      await page.goto(printUrl, { waitUntil: "domcontentloaded", timeout: 30000 })

      await page.waitForSelector('[data-render-ready="true"]', { timeout: 15000 })

      await page.evaluate(() => document.fonts.ready)

      pdfBuffer = Buffer.from(
        await page.pdf({
          format: "A4",
          printBackground: true,
          preferCSSPageSize: true,
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
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)

    if (message.includes("net::ERR_") || message.includes("NS_ERROR_")) {
      return NextResponse.json(
        {
          ok: false,
          error: `无法连接打印页面：${printUrl}。请确保 next dev 正在运行且打印页面可访问。`,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ok: false, error: `Playwright 启动失败：${message}` },
      { status: 500 }
    )
  }

  const sha256 = createHash("sha256").update(pdfBuffer).digest("hex")
  const timestamp = Date.now()
  const storagePath = `resume/${caseId}/${timestamp}.pdf`

  const { error: uploadError } = await serviceClient.storage
    .from(BUCKET_NAME)
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      cacheControl: "3600",
    })

  if (uploadError) {
    const msg = uploadError.message || ""
    if (msg.includes("not found") || msg.includes("exist")) {
      return NextResponse.json(
        {
          ok: false,
          error: `Storage bucket "${BUCKET_NAME}" 不存在，请先在 Supabase Dashboard 创建 private bucket: ${BUCKET_NAME}`,
        },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { ok: false, error: `上传 PDF 失败：${uploadError.message}` },
      { status: 500 }
    )
  }

  const { data: signedUrlData, error: signedUrlError } = await serviceClient.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, 3600)

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return NextResponse.json(
      { ok: false, error: `生成签名链接失败：${signedUrlError?.message || "未知错误"}` },
      { status: 500 }
    )
  }

  const { data: artifact, error: artifactError } = await serviceClient
    .from("export_artifacts")
    .insert({
      case_id: caseId,
      artifact_type: "resume_pdf",
      storage_path: storagePath,
      sha256,
      template_version: resume.template_id || null,
      schema_version: resume.prompt_version || null,
      source_output_id: resume.id,
    })
    .select("id,created_at")
    .single()

  if (artifactError) {
    return NextResponse.json(
      { ok: false, error: `写入导出记录失败：${artifactError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    artifactId: (artifact as { id: string }).id,
    signedUrl: signedUrlData.signedUrl,
    sha256,
    storagePath,
  })
}
