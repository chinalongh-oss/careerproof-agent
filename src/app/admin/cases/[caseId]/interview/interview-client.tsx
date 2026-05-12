"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Loader2, MessageSquare, AlertTriangle, CheckCircle2, ListChecks, FileText, ArrowLeft } from "lucide-react"
import { generateInterviewPackAction } from "../actions"

type OutputRow = {
  id: string
  case_id: string
  output_type: string
  content: unknown
  markdown: string | null
  version: number
  created_at: string
} | null

interface InterviewQuestion {
  question?: string
  context?: string
}

interface HighRiskQuestion {
  question?: string
  risk_source?: string
  why_risky?: string
}

interface ProjectQuestion {
  project_name?: string
  project_summary?: string
  likely_questions?: InterviewQuestion[]
  high_risk_questions?: HighRiskQuestion[]
  why_asked?: string
  answer_structure?: string
  data_to_prepare?: string[]
  do_not_overclaim?: string[]
  suggested_boundary_statement?: string
}

interface RiskItem {
  risk?: string
  source?: string
  interview_approach?: string
}

interface ChecklistItem {
  item?: string
  reason?: string
  detail?: string
}

interface InterviewPackContent {
  overall_interview_strategy?: string
  top_risks?: RiskItem[]
  preparation_checklist?: ChecklistItem[]
  project_questions?: ProjectQuestion[]
}

interface Props {
  caseId: string
  candidateName: string | null
  targetRole: string | null
  interviewPack: OutputRow
}

export function InterviewClient({ caseId, candidateName, targetRole, interviewPack }: Props) {
  const [generating, setGenerating] = useState(false)

  const packContent = interviewPack?.content as InterviewPackContent | null

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await generateInterviewPackAction(caseId)
      if (result.success) {
        toast.success(result.message || "生成完成")
        window.location.reload()
      } else {
        toast.error(result.error || "生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setGenerating(false)
    }
  }

  if (!interviewPack || !packContent) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">面试准备</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">暂无面试准备包</p>
              <p className="text-sm text-muted-foreground">
                基于简历、项目证据卡和风险审查结果，AI 将生成预测面试问题和话术策略。
              </p>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-1.5" />}
                {generating ? "生成中..." : "生成面试准备包"}
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
          <h1 className="text-2xl font-bold">面试准备</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-1.5" />}
            重新生成
          </Button>
          <Link href={`/admin/cases/${caseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              返回概览
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="text-xs">v{interviewPack.version}</Badge>
        <span>生成时间：{new Date(interviewPack.created_at).toLocaleString("zh-CN")}</span>
      </div>

      {packContent.overall_interview_strategy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              整体面试策略
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {packContent.overall_interview_strategy}
            </p>
          </CardContent>
        </Card>
      )}

      {packContent.top_risks && packContent.top_risks.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              主要风险及应对
            </CardTitle>
            <CardDescription>面试中可能被追问的风险点</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {packContent.top_risks.map((risk, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Badge variant="destructive" className="text-xs shrink-0 mt-0.5">风险</Badge>
                  <p className="text-sm font-medium">{risk.risk}</p>
                </div>
                {risk.source && (
                  <p className="text-xs text-muted-foreground">来源：{risk.source}</p>
                )}
                {risk.interview_approach && (
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">应对策略</p>
                    <p className="text-sm">{risk.interview_approach}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {packContent.preparation_checklist && packContent.preparation_checklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              准备清单
            </CardTitle>
            <CardDescription>面试前需要准备的数据和材料</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {packContent.preparation_checklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-medium">{item.item}</p>
                  {item.detail && (
                    <p className="text-sm text-muted-foreground mt-0.5">{item.detail}</p>
                  )}
                  {item.reason && (
                    <p className="text-xs text-muted-foreground mt-0.5">原因：{item.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {packContent.project_questions && packContent.project_questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            重点项目追问
          </h2>
          {packContent.project_questions.map((pq, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-base">{pq.project_name || `项目 ${i + 1}`}</CardTitle>
                {pq.project_summary && (
                  <CardDescription>{pq.project_summary}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {pq.why_asked && (
                  <div className="bg-muted/30 rounded p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">面试官关注点</p>
                    <p className="text-sm">{pq.why_asked}</p>
                  </div>
                )}

                {pq.answer_structure && (
                  <div className="bg-muted/30 rounded p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">推荐回答框架</p>
                    <p className="text-sm">{pq.answer_structure}</p>
                  </div>
                )}

                {pq.likely_questions && pq.likely_questions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">可能被问到的问题</p>
                    <div className="space-y-2">
                      {pq.likely_questions.map((q, qi) => (
                        <div key={qi} className="border rounded-lg p-3">
                          <p className="text-sm font-medium">Q: {q.question}</p>
                          {q.context && (
                            <p className="text-xs text-muted-foreground mt-1">背景：{q.context}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pq.high_risk_questions && pq.high_risk_questions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">高风险追问</span>
                    </p>
                    <div className="space-y-2">
                      {pq.high_risk_questions.map((q, qi) => (
                        <div key={qi} className="border border-destructive/30 bg-destructive/5 rounded-lg p-3">
                          <p className="text-sm font-medium text-destructive">⚠️ Q: {q.question}</p>
                          {q.risk_source && (
                            <p className="text-xs text-muted-foreground mt-1">风险来源：{q.risk_source}</p>
                          )}
                          {q.why_risky && (
                            <p className="text-xs text-muted-foreground">风险原因：{q.why_risky}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pq.data_to_prepare && pq.data_to_prepare.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                      <ListChecks className="h-4 w-4" />
                      需要准备的数据
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {pq.data_to_prepare.map((d, di) => (
                        <li key={di} className="text-sm text-muted-foreground">{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {pq.do_not_overclaim && pq.do_not_overclaim.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      不要过度声称
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {pq.do_not_overclaim.map((d, di) => (
                        <li key={di} className="text-sm text-amber-700">{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {pq.suggested_boundary_statement && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-700 mb-1">当被追问到无法回答的问题时，建议这样说</p>
                    <p className="text-sm text-blue-800">{pq.suggested_boundary_statement}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
