import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { formatLocalTime } from "@/lib/utils"
import type { CaseStatus } from "@/lib/supabase/types"
import { WorkflowPanel } from "./workflow-panel"
import { CaseStatusBar } from "./case-status-bar"
import { DocEditTabs } from "./doc-edit-tabs"
import { DevStatusPanel } from "./dev-status-panel"

const statusMap = {
  new_submitted: { label: "新提交", variant: "default" },
  parsed: { label: "已解析", variant: "secondary" },
  evidence_ready: { label: "证据卡就绪", variant: "secondary" },
  jd_ready: { label: "JD 已解析", variant: "secondary" },
  fingerprint_ready: { label: "指纹已生成", variant: "secondary" },
  positioning_ready: { label: "定位已生成", variant: "secondary" },
  outputs_ready: { label: "交付物已生成", variant: "secondary" },
  risk_reviewed: { label: "风险已审查", variant: "secondary" },
  interview_ready: { label: "面试包就绪", variant: "secondary" },
  delivered: { label: "已交付", variant: "secondary" },
  failed: { label: "失败", variant: "outline" },
} as const satisfies Record<CaseStatus, { label: string; variant: "default" | "secondary" | "outline" }>

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params

  const { data: caseData, error: caseError } = await serviceClient
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single()

  if (caseError || !caseData) notFound()

  const c = caseData

  const { data: documents } = await serviceClient
    .from("documents")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  const docsArr = Array.isArray(documents) ? documents : documents ? [documents] : []
  const resumeDoc = docsArr.find((d) => d.type === "resume") ?? null
  const jdDoc = docsArr.find((d) => d.type === "jd") ?? null
  const materialDoc = docsArr.find((d) => d.type === "project_material") ?? null
  const st = statusMap[c.status as CaseStatus] ?? { label: c.status, variant: "outline" as const }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Title */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/admin/cases" className="text-sm text-muted-foreground hover:text-foreground">
            案例列表
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-bold">{c.candidate_name || caseId}</h1>
          <Badge variant={st.variant}>{st.label}</Badge>
        </div>
        <p className="text-muted-foreground">
          {[c.current_title, c.target_direction, c.target_role].filter(Boolean).join(" → ") || "未填写职业信息"}
        </p>
      </div>

      {/* Candidate Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">当前岗位</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{c.current_title || "未填写"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">目标方向</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{c.target_direction || "未填写"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">目标岗位</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{c.target_role || "未填写"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">联系方式</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{c.email || "-"} {c.wechat ? `/ ${c.wechat}` : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">创建时间</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{formatLocalTime(c.created_at)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">更新时间</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{formatLocalTime(c.updated_at)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Progress Bar */}
      <CaseStatusBar currentStatus={c.status} />

      {/* Main 2-col layout: docs + workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Documents Tabs with edit */}
        <div className="lg:col-span-2">
          <DocEditTabs
            caseId={caseId}
            resumeDoc={resumeDoc}
            jdDoc={jdDoc}
            materialDoc={materialDoc}
            privacyNotes={c.privacy_notes}
          />
        </div>

        {/* Right: Workflow Panel */}
        <div className="space-y-6">
          <WorkflowPanel caseId={caseId} currentStatus={c.status} />
        </div>
      </div>

      <Separator />

      {/* Dev Debug Panel */}
      <DevStatusPanel caseId={caseId} currentStatus={c.status} />
    </div>
  )
}
