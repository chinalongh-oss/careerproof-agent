import { CaseTabsNav } from "./case-tabs-nav"
import { Toaster } from "@/components/ui/toaster"

export default async function CaseDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params

  return (
    <div className="space-y-6">
      <CaseTabsNav caseId={caseId} />
      {children}
      <Toaster />
    </div>
  )
}
