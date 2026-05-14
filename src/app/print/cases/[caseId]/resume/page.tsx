import { ResumePrintView } from "@/components/resume/resume-print-view"
import { getResumePrintData } from "@/lib/resume/print-data"

export const dynamic = "force-dynamic"

export default async function PrintResumePage({
  params,
  searchParams,
}: {
  params: Promise<{ caseId: string }>
  searchParams: Promise<{ outputId?: string }>
}) {
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
