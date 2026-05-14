import { ResumePrintView } from "@/components/resume/resume-print-view"
import { getResumePrintData } from "@/lib/resume/print-data"
import { cookies } from "next/headers"
import { verifyAdminCookie } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function PrintResumePage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>
  searchParams: Promise<{ outputId?: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_token")?.value
  if (!token || !verifyAdminCookie(token)) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#666", margin: "0 0 8px" }}>
            需要管理员权限访问此页面
          </p>
          <p style={{ fontSize: "14px", color: "#999", margin: 0 }}>
            请从管理后台导出 PDF。
          </p>
        </div>
      </div>
    )
  }

  const { caseId } = await params
  const { outputId } = await searchParams

  const data = await getResumePrintData(caseId, outputId)

  if (!data) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "system-ui, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#666", margin: "0 0 8px" }}>
            请先生成简历内容
          </p>
          <p style={{ fontSize: "14px", color: "#999", margin: 0 }}>
            在交付物页面先生成简历 Markdown，然后刷新此页面。
          </p>
        </div>
      </div>
    )
  }

  return (
    <ResumePrintView
      markdown={data.markdown}
      personalInfo={data.personalInfo}
      version={data.version}
      createdAt={data.createdAt}
    />
  )
}
