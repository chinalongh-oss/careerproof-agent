"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ShieldAlert, RefreshCw, Loader2, CheckCircle2, EyeOff, FileWarning, AlertTriangle, Info } from "lucide-react"
import { auditRisksAction, updateRiskIssueAction } from "../actions"
import type { RiskIssue } from "@/lib/supabase/types"

const riskLevelConfig = {
  high: { label: "高风险", variant: "destructive" as const, icon: FileWarning },
  medium: { label: "中风险", variant: "default" as const, icon: AlertTriangle },
  low: { label: "低风险", variant: "secondary" as const, icon: Info },
}

const riskTypeLabels: Record<string, string> = {
  overclaim: "夸大表达",
  data_missing: "数据缺失",
  attribution_unclear: "归因不清",
  sensitive_info: "敏感信息",
  generic_expression: "同质化表达",
  timeline_conflict: "时间线冲突",
  jd_mismatch: "岗位不匹配",
  evidence_missing: "证据缺失",
}

const statusLabels: Record<string, string> = {
  open: "待处理",
  accepted: "已接受",
  fixed: "已处理",
  ignored: "已忽略",
}

const sourceTypeLabels: Record<string, string> = {
  resume_markdown: "简历",
  profile_page: "个人主页",
  project_card: "项目证据卡",
}

interface Props {
  caseId: string
  candidateName: string | null
  targetRole: string | null
  risks: RiskIssue[]
  hasOutputs: boolean
}

export function RiskClient({ caseId, candidateName, targetRole, risks, hasOutputs }: Props) {
  const [running, setRunning] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const highCount = risks.filter((r) => r.risk_level === "high").length
  const mediumCount = risks.filter((r) => r.risk_level === "medium").length
  const lowCount = risks.filter((r) => r.risk_level === "low").length
  const openCount = risks.filter((r) => r.status === "open").length
  const fixedCount = risks.filter((r) => r.status === "fixed").length
  const ignoredCount = risks.filter((r) => r.status === "ignored").length
  const acceptedCount = risks.filter((r) => r.status === "accepted").length

  async function handleRunAudit() {
    setRunning(true)
    try {
      const result = await auditRisksAction(caseId)
      if (result.success) {
        toast.success(result.message || "风险审查完成")
        window.location.reload()
      } else {
        toast.error(result.error || "风险审查失败")
      }
    } catch (e) {
      toast.error(`审查异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setRunning(false)
    }
  }

  async function handleUpdateStatus(issueId: string, status: string) {
    setUpdatingId(issueId)
    try {
      const result = await updateRiskIssueAction(issueId, caseId, status)
      if (result.success) {
        toast.success(result.message || "状态已更新")
        window.location.reload()
      } else {
        toast.error(result.error || "更新失败")
      }
    } catch (e) {
      toast.error(`更新异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setUpdatingId(null)
    }
  }

  if (!hasOutputs && risks.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">风险审查</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">请先生成交付物（简历和个人主页）</p>
              <p className="text-sm text-muted-foreground">
                前往交付物页面生成简历和个人主页后，再运行风险审查。
              </p>
              <Link href={`/admin/cases/${caseId}/outputs`}>
                <Button>前往交付物</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">风险审查</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRunAudit} disabled={running}>
            {running ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            {risks.length > 0 ? "重新审查" : "运行风险审查"}
          </Button>
          <Link href={`/admin/cases/${caseId}`}>
            <Button variant="ghost" size="sm">返回概览</Button>
          </Link>
        </div>
      </div>

      {/* Risk Summary */}
      {risks.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-destructive">高风险</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-2xl font-bold text-destructive">{highCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium">中风险</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-2xl font-bold">{mediumCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">低风险</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-2xl font-bold text-muted-foreground">{lowCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-destructive">待处理</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-2xl font-bold text-destructive">{openCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-green-600">已处理</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-2xl font-bold text-green-600">{fixedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium">已忽略</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-2xl font-bold">{ignoredCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs font-medium text-blue-600">已接受</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-2xl font-bold text-blue-600">{acceptedCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk List */}
      {risks.length > 0 ? (
        <div className="space-y-4">
          {risks.map((risk) => {
            const lc = riskLevelConfig[risk.risk_level as keyof typeof riskLevelConfig] ?? riskLevelConfig.low
            const LevelIcon = lc.icon
            const sourceLabel = sourceTypeLabels[risk.source_type ?? ""] ?? risk.source_type ?? "未知来源"

            return (
              <Card key={risk.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={lc.variant}>
                      <LevelIcon className="h-3 w-3 mr-1" />
                      {lc.label}
                    </Badge>
                    <Badge variant="outline">
                      {riskTypeLabels[risk.risk_type ?? ""] ?? risk.risk_type ?? "未知类型"}
                    </Badge>
                    <Badge variant="outline">{sourceLabel}</Badge>
                    <Badge
                      variant={
                        risk.status === "open" ? "destructive" :
                        risk.status === "fixed" ? "default" :
                        "secondary"
                      }
                    >
                      {statusLabels[risk.status ?? ""] ?? risk.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {risk.source_text && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">原文</p>
                      <blockquote className="border-l-2 border-muted pl-3 text-sm italic text-muted-foreground">
                        {risk.source_text}
                      </blockquote>
                    </div>
                  )}
                  {risk.reason && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">原因</p>
                      <p className="text-sm">{risk.reason}</p>
                    </div>
                  )}
                  {risk.suggestion && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">修改建议</p>
                      <p className="text-sm">{risk.suggestion}</p>
                    </div>
                  )}
                  {risk.safer_rewrite && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">安全改写</p>
                      <blockquote className="border-l-2 border-green-500 pl-3 text-sm text-green-700 dark:text-green-400">
                        {risk.safer_rewrite}
                      </blockquote>
                    </div>
                  )}

                  {risk.status === "open" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(risk.id, "accepted")}
                        disabled={updatingId === risk.id}
                      >
                        {updatingId === risk.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        接受改写
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(risk.id, "fixed")}
                        disabled={updatingId === risk.id}
                      >
                        {updatingId === risk.id ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                        标记已处理
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdateStatus(risk.id, "ignored")}
                        disabled={updatingId === risk.id}
                      >
                        <EyeOff className="h-3.5 w-3.5 mr-1" />
                        忽略
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">暂无风险审查结果</p>
              <p className="text-sm text-muted-foreground">
                点击「运行风险审查」AI 将自动检查简历和主页的风险点。
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
