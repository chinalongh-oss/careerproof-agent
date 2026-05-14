import { NextRequest, NextResponse } from "next/server"
import { serviceClient } from "@/lib/supabase/service"
import { exportHtmlToPdf } from "@/lib/export-pdf"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params

  const outputId = req.nextUrl.searchParams.get("outputId")

  if (!outputId) {
    return NextResponse.json(
      { ok: false, error: "请在前端选择一个简历版本（resume_markdown），并通过 outputId 参数指定 generated_outputs.id" },
      { status: 400 }
    )
  }

  const { data: outputData } = await serviceClient
    .from("generated_outputs")
    .select("id,markdown,version,template_id,prompt_version,output_type")
    .eq("id", outputId)
    .eq("case_id", caseId)
    .single()

  const resume = outputData as Record<string, unknown> | null

  if (!resume || !resume.markdown) {
    return NextResponse.json(
      { ok: false, error: "未找到指定的简历内容，请确认 outputId 是否正确" },
      { status: 400 }
    )
  }

  if (resume.output_type !== "resume_markdown") {
    return NextResponse.json(
      { ok: false, error: "指定的 outputId 不是 resume_markdown 类型，请选择简历版本" },
      { status: 400 }
    )
  }

  const { data: caseData } = await serviceClient
    .from("cases")
    .select("candidate_name")
    .eq("id", caseId)
    .single()

  const candidateName = caseData?.candidate_name || ""
  const markdown = resume.markdown as string
  const nameInMarkdown =
    markdown.includes(candidateName) ||
    /^#\s+\S/.test(markdown)

  if (!candidateName && !nameInMarkdown) {
    console.warn(
      `[export-pdf] case ${caseId}: cases.candidate_name 为空且 markdown 中无姓名，仍继续导出但 PDF 可能缺姓名`
    )
  }

  const appUrl = req.nextUrl.origin
  const printUrl = `${appUrl}/print/cases/${caseId}/resume`
  const adminCookie = req.cookies.get("admin_token")

  const result = await exportHtmlToPdf({
    caseId,
    printUrl,
    adminCookie: adminCookie?.value,
    artifactType: "resume_pdf",
    sourceOutputId: resume.id as string,
    templateVersion: (resume.template_id as string) || null,
    schemaVersion: (resume.prompt_version as string) || null,
    appUrl,
  })

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    artifactId: result.result.artifactId,
    signedUrl: result.result.signedUrl,
    sha256: result.result.sha256,
    storagePath: result.result.storagePath,
  })
}
