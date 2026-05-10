"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabs = [
  { key: "overview", label: "概览" },
  { key: "evidence", label: "项目证据卡" },
  { key: "jd", label: "JD 解析" },
  { key: "positioning", label: "职业定位" },
  { key: "outputs", label: "交付物" },
  { key: "risk", label: "风险审查" },
  { key: "interview", label: "面试准备" },
]

export function CaseTabsNav({ caseId }: { caseId: string }) {
  const pathname = usePathname()
  const segments = pathname.split("/")
  const lastSegment = segments[segments.length - 1]
  const activeTab = lastSegment === caseId ? "overview" : lastSegment

  return (
    <Tabs value={activeTab}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.key} value={tab.key} asChild>
            <Link
              href={tab.key === "overview" ? `/admin/cases/${caseId}` : `/admin/cases/${caseId}/${tab.key}`}
            >
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
