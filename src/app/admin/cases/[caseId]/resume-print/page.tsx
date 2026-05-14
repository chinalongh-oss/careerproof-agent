import { ResumePrintView } from "@/components/resume/resume-print-view"
import { getResumePrintData } from "@/lib/resume/print-data"

export const dynamic = "force-dynamic"

export default async function ResumePrintPage({
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <p className="text-lg font-medium text-muted-foreground">
            请先生成简历内容
          </p>
          <p className="text-sm text-muted-foreground">
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
