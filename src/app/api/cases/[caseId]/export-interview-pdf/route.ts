import { NextRequest, NextResponse } from "next/server"
import { serviceClient } from "@/lib/supabase/service"
import { exportHtmlToPdf } from "@/lib/export-pdf"
import { verifyAdminCookie } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params

  const adminCookieValue = req.cookies.get("admin_token")?.value
  if (!adminCookieValue || !verifyAdminCookie(adminCookieValue)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const { data: outputsData } = await serviceClient
    .from("generated_outputs")
    .select("id,version,content")
    .eq("case_id", caseId)
    .eq("output_type", "interview_pack")
    .order("version", { ascending: false })
    .limit(1)

  const outputsArr = Array.isArray(outputsData) ? outputsData : outputsData ? [outputsData] : []
  const pack = outputsArr[0] ?? null

  if (!pack || !pack.content) {
    return NextResponse.json(
      { ok: false, error: "请先生成面试准备包（interview_pack）" },
      { status: 400 }
    )
  }

  const appUrl = req.nextUrl.origin
  const printUrl = `${appUrl}/admin/cases/${caseId}/interview-print`
  const adminCookie = req.cookies.get("admin_token")

  const result = await exportHtmlToPdf({
    caseId,
    printUrl,
    adminCookie: adminCookie?.value,
    artifactType: "interview_pack_pdf",
    sourceOutputId: pack.id,
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
