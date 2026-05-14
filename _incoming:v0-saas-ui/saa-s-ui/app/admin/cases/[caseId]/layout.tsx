"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  FileText,
  Target,
  Compass,
  FileCheck,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Globe,
} from "lucide-react"

const tabs = [
  { href: "", label: "概览", icon: FileText, exact: true },
  { href: "/evidence", label: "证据卡", icon: Target },
  { href: "/jd", label: "JD 解析", icon: Compass },
  { href: "/positioning", label: "职业定位", icon: FileCheck },
  { href: "/outputs", label: "交付物", icon: FileText },
  { href: "/risk", label: "风险审查", icon: AlertTriangle },
  { href: "/interview", label: "面试准备", icon: MessageSquare },
  { href: "/quality-review", label: "质量评审", icon: BarChart3 },
  { href: "/public-page", label: "公开主页", icon: Globe },
]

export default function CaseDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ caseId: string }>
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Tabs navigation */}
      <div className="border-b border-border -mx-8 px-8">
        <nav className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            // We need to handle exact matching for the overview tab
            const tabHref = `/admin/cases/case-001${tab.href}`
            const isActive = tab.exact
              ? pathname.endsWith("/case-001") || pathname.endsWith("/case-001/")
              : pathname.includes(tab.href) && tab.href !== ""

            return (
              <Link
                key={tab.href}
                href={tabHref}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Page content */}
      {children}
    </div>
  )
}
