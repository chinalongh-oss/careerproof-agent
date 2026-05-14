"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Edit3,
  Copy,
} from "lucide-react"

// Mock risk issues
const mockRiskIssues = [
  {
    id: "risk-1",
    sourceType: "resume",
    sourceText: "主导 AI 对话产品从 0-1 设计与落地，3 个月内 DAU 达到 5 万",
    riskType: "data_missing",
    riskLevel: "high",
    reason: "缺少起始基准和计算口径，5 万 DAU 的来源和定义不明确",
    suggestion: "补充 DAU 的统计口径和基准线",
    saferRewrite:
      "主导 AI 对话产品从 0-1 设计与落地，上线 3 个月后日活用户达到 5 万（统计口径：当日有至少 1 次有效对话的独立用户）",
    status: "open",
  },
  {
    id: "risk-2",
    sourceType: "resume",
    sourceText: "用户满意度 92%",
    riskType: "data_missing",
    riskLevel: "medium",
    reason: "满意度调研的样本量、时间范围、问题设计未说明",
    suggestion: "补充满意度调研的具体方法论",
    saferRewrite: "产品 NPS 调研显示用户满意度 92%（N=500，2026Q1 调研）",
    status: "open",
  },
  {
    id: "risk-3",
    sourceType: "resume",
    sourceText: "协调算法、前端、后端团队完成 MVP 开发",
    riskType: "attribution_unclear",
    riskLevel: "medium",
    reason: "协调的具体方式和个人贡献边界不清晰，可能被追问具体如何协调",
    suggestion: "明确协调的方式和产出",
    saferRewrite:
      "作为产品负责人，主导需求评审会议、制定迭代计划，协调算法（3人）、前端（2人）、后端（2人）团队完成 MVP 开发",
    status: "accepted",
  },
  {
    id: "risk-4",
    sourceType: "positioning",
    sourceText: "深耕 AI 产品设计的资深产品专家",
    riskType: "overclaim",
    riskLevel: "low",
    reason: "资深专家的定位可能需要更长的 AI 领域从业年限支撑",
    suggestion: "使用更精准的表达",
    saferRewrite: "具备 AI 产品完整落地经验的产品负责人",
    status: "fixed",
  },
]

const riskTypeMap: Record<string, { label: string; color: string }> = {
  overclaim: { label: "夸大表达", color: "bg-destructive/10 text-destructive" },
  data_missing: { label: "数据缺失", color: "bg-warning/10 text-warning" },
  attribution_unclear: { label: "归因不清", color: "bg-warning/10 text-warning" },
  sensitive_info: { label: "敏感信息", color: "bg-destructive/10 text-destructive" },
  generic_expression: { label: "同质化表达", color: "bg-muted text-muted-foreground" },
  jd_mismatch: { label: "岗位不匹配", color: "bg-destructive/10 text-destructive" },
}

const riskLevelMap: Record<string, { label: string; color: string }> = {
  high: { label: "高风险", color: "bg-destructive text-destructive-foreground" },
  medium: { label: "中风险", color: "bg-warning text-warning-foreground" },
  low: { label: "低风险", color: "bg-muted text-muted-foreground" },
}

const statusMap: Record<string, { label: string; icon: typeof CheckCircle2 }> = {
  open: { label: "待处理", icon: AlertTriangle },
  accepted: { label: "已采纳", icon: CheckCircle2 },
  fixed: { label: "已修复", icon: CheckCircle2 },
  ignored: { label: "已忽略", icon: XCircle },
}

export default function RiskPage() {
  const [issues, setIssues] = useState(mockRiskIssues)

  const handleStatusChange = (id: string, newStatus: string) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue))
    )
  }

  const openCount = issues.filter((i) => i.status === "open").length
  const highRiskCount = issues.filter((i) => i.riskLevel === "high" && i.status === "open").length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin/cases/case-001"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">风险审查</h1>
          </div>
          <p className="text-muted-foreground">
            张三 · 共 {issues.length} 个风险项，{openCount} 个待处理
            {highRiskCount > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground">
                {highRiskCount} 个高风险
              </Badge>
            )}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          重新审查
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="待处理"
          value={openCount}
          className="border-warning/30 bg-warning/5"
        />
        <SummaryCard
          label="已采纳"
          value={issues.filter((i) => i.status === "accepted").length}
          className="border-success/30 bg-success/5"
        />
        <SummaryCard
          label="已修复"
          value={issues.filter((i) => i.status === "fixed").length}
          className="border-success/30 bg-success/5"
        />
        <SummaryCard
          label="已忽略"
          value={issues.filter((i) => i.status === "ignored").length}
          className="border-muted"
        />
      </div>

      {/* Filter tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="all">全部 ({issues.length})</TabsTrigger>
          <TabsTrigger value="open">待处理 ({openCount})</TabsTrigger>
          <TabsTrigger value="resolved">已处理</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-4">
          {issues.map((issue) => (
            <RiskCard
              key={issue.id}
              issue={issue}
              onStatusChange={handleStatusChange}
            />
          ))}
        </TabsContent>

        <TabsContent value="open" className="mt-6 space-y-4">
          {issues
            .filter((i) => i.status === "open")
            .map((issue) => (
              <RiskCard
                key={issue.id}
                issue={issue}
                onStatusChange={handleStatusChange}
              />
            ))}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6 space-y-4">
          {issues
            .filter((i) => i.status !== "open")
            .map((issue) => (
              <RiskCard
                key={issue.id}
                issue={issue}
                onStatusChange={handleStatusChange}
              />
            ))}
        </TabsContent>
      </Tabs>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {openCount === 0 ? "所有风险项已处理" : `还有 ${openCount} 个风险项待处理`}
        </p>
        <Button disabled={openCount > 0}>
          完成审查并继续
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string
  value: number
  className?: string
}) {
  return (
    <Card className={`border ${className}`}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function RiskCard({
  issue,
  onStatusChange,
}: {
  issue: (typeof mockRiskIssues)[0]
  onStatusChange: (id: string, status: string) => void
}) {
  const typeInfo = riskTypeMap[issue.riskType] || { label: issue.riskType, color: "bg-muted" }
  const levelInfo = riskLevelMap[issue.riskLevel] || riskLevelMap.low
  const StatusIcon = statusMap[issue.status]?.icon || AlertTriangle

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Status icon */}
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
              issue.status === "open"
                ? "bg-warning/10 text-warning"
                : issue.status === "ignored"
                ? "bg-muted text-muted-foreground"
                : "bg-success/10 text-success"
            }`}
          >
            <StatusIcon className="h-4 w-4" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${typeInfo.color} border-0`}>{typeInfo.label}</Badge>
              <Badge className={`${levelInfo.color} border-0`}>{levelInfo.label}</Badge>
              <Badge variant="outline" className="text-xs">
                {issue.sourceType === "resume" ? "简历" : "定位"}
              </Badge>
            </div>

            {/* Source text */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm font-medium">{issue.sourceText}</p>
            </div>

            {/* Reason */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">问题说明</p>
              <p className="text-sm">{issue.reason}</p>
            </div>

            {/* Safer rewrite */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">建议改写</p>
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm text-success">{issue.saferRewrite}</p>
              </div>
            </div>

            {/* Actions */}
            {issue.status === "open" && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onStatusChange(issue.id, "accepted")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  采纳建议
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStatusChange(issue.id, "fixed")}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  手动修复
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onStatusChange(issue.id, "ignored")}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  忽略
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
