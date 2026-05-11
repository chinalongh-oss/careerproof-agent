"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ScanText, RefreshCw, Loader2 } from "lucide-react"
import { parseJDAction } from "../actions"

type JDRow = {
  id: string
  case_id: string
  raw_jd: string | null
  role_name: string | null
  company_type: string | null
  seniority_level: string | null
  core_responsibilities: unknown
  required_skills: unknown
  hidden_requirements: unknown
  keywords: unknown
  interview_focus: unknown
  resume_strategy: unknown
  recommended_project_types: unknown
  not_recommended_project_types: unknown
  created_at: string
}

interface Props {
  caseId: string
  candidateName: string | null
  targetRole: string | null
  jdData: JDRow | null
}

function renderJsonField(val: unknown) {
  if (val === null || val === undefined) {
    return <span className="text-muted-foreground text-sm">—</span>
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return <span className="text-muted-foreground text-sm">—</span>
    return (
      <ul className="list-disc list-inside space-y-1">
        {val.map((item, i) => (
          <li key={i} className="text-sm">{String(item)}</li>
        ))}
      </ul>
    )
  }
  if (typeof val === "object") {
    return (
      <pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap">
        {JSON.stringify(val, null, 2)}
      </pre>
    )
  }
  return <span className="text-sm">{String(val)}</span>
}

function renderArrayBadges(val: unknown) {
  if (!Array.isArray(val) || val.length === 0) return <span className="text-muted-foreground text-sm">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {val.map((item, i) => (
        <Badge key={i} variant="secondary" className="text-xs">{String(item)}</Badge>
      ))}
    </div>
  )
}

export function JDClient({ caseId, candidateName, targetRole, jdData }: Props) {
  const [parsing, setParsing] = useState(false)

  async function handleParse() {
    setParsing(true)
    try {
      const result = await parseJDAction(caseId)
      if (result.success) {
        toast.success(result.message || "JD 解析完成")
        window.location.reload()
      } else {
        toast.error(result.error || "JD 解析失败")
      }
    } catch (e) {
      toast.error(`解析异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setParsing(false)
    }
  }

  if (!jdData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">JD 解析</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <ScanText className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">暂无 JD 解析结果</p>
              <p className="text-sm text-muted-foreground">
                请确保已在案例详情页提交 JD 文档，然后点击下方按钮进行 AI 解析。
              </p>
              <Button onClick={handleParse} disabled={parsing}>
                {parsing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ScanText className="h-4 w-4 mr-1.5" />}
                {parsing ? "解析中..." : "解析 JD"}
              </Button>
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
          <h1 className="text-2xl font-bold">JD 解析</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleParse}
            disabled={parsing}
          >
            {parsing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            重新解析 JD
          </Button>
          <Link href={`/admin/cases/${caseId}`}>
            <Button variant="ghost" size="sm">返回概览</Button>
          </Link>
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本信息</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">目标职位</label>
            <p className="text-sm mt-1">{jdData.role_name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">公司类型</label>
            <p className="text-sm mt-1">{jdData.company_type || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">资历要求</label>
            <p className="text-sm mt-1">{jdData.seniority_level || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Core Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">核心职责</CardTitle>
        </CardHeader>
        <CardContent>
          {renderJsonField(jdData.core_responsibilities)}
        </CardContent>
      </Card>

      {/* Required Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">必备技能</CardTitle>
        </CardHeader>
        <CardContent>
          {renderJsonField(jdData.required_skills)}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">关键词</CardTitle>
          </CardHeader>
          <CardContent>
            {renderArrayBadges(jdData.keywords)}
          </CardContent>
        </Card>

        {/* Hidden Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">隐性要求</CardTitle>
            <CardDescription>JD 未明确写出但岗位通常需要的</CardDescription>
          </CardHeader>
          <CardContent>
            {renderJsonField(jdData.hidden_requirements)}
          </CardContent>
        </Card>
      </div>

      {/* Interview Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">面试重点</CardTitle>
        </CardHeader>
        <CardContent>
          {renderJsonField(jdData.interview_focus)}
        </CardContent>
      </Card>

      {/* Resume Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">简历定制策略</CardTitle>
        </CardHeader>
        <CardContent>
          {renderJsonField(jdData.resume_strategy)}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommended Project Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">推荐突出的项目类型</CardTitle>
          </CardHeader>
          <CardContent>
            {renderArrayBadges(jdData.recommended_project_types)}
          </CardContent>
        </Card>

        {/* Not Recommended Project Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">不建议突出的项目类型</CardTitle>
          </CardHeader>
          <CardContent>
            {renderArrayBadges(jdData.not_recommended_project_types)}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Raw JD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">原始 JD 文本</CardTitle>
        </CardHeader>
        <CardContent>
          {jdData.raw_jd ? (
            <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-64 whitespace-pre-wrap">
              {jdData.raw_jd}
            </pre>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
