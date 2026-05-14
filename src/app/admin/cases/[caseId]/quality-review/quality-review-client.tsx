"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, Loader2, ThumbsUp, ThumbsDown, AlertTriangle, ArrowUp, ArrowDown, CheckCircle2, SendHorizontal, FileText, FileSearch, Pencil, Target } from "lucide-react"
import { generateQualityReviewAction, submitUserDecisionAction } from "../actions"
import type { ResumeQualityAssessment } from "@/lib/supabase/types"

const recommendationConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline"; icon: typeof ThumbsUp }> = {
  recommended: { label: "推荐使用新版", variant: "default", icon: ThumbsUp },
  use_with_caution: { label: "谨慎使用", variant: "secondary", icon: AlertTriangle },
  not_recommended: { label: "不推荐使用", variant: "destructive", icon: ThumbsDown },
  high_risk_trial: { label: "高风险尝试", variant: "destructive", icon: AlertTriangle },
}

const decisionLabels: Record<string, string> = {
  use_new: "采用新版作为主版本",
  use_old: "采用旧版作为主版本",
  generate_alternative_role: "生成替代岗位版本",
  force_target_version: "继续生成目标 JD 尝试版",
  request_revision: "要求人工修改",
}

interface Props {
  caseId: string
  candidateName: string | null
  targetRole: string | null
  caseStatus: string
  qualityAssessment: ResumeQualityAssessment | null
  oldResumeDoc: { id: string; type: string; raw_text: string | null; file_name: string | null } | null
  newResumeOutputs: Array<{ id: string; markdown: string | null; title: string | null; delivery_variant_key: string | null }>
  hasOutputs: boolean
}

export function QualityReviewClient({ caseId, candidateName, targetRole, caseStatus: _caseStatus, qualityAssessment, oldResumeDoc, newResumeOutputs, hasOutputs }: Props) {
  const [generating, setGenerating] = useState(false)
  const [submittingDecision, setSubmittingDecision] = useState<string | null>(null)

  const assessment = qualityAssessment
  const recommendation = assessment?.recommendation_level ?? null
  const recConfig = recommendation ? recommendationConfig[recommendation] : null
  const decision = assessment?.user_decision ?? "pending"

  const oldScore = assessment?.old_resume_score as Record<string, unknown> | null
  const newScore = assessment?.new_resume_score as Record<string, unknown> | null
  const delta = assessment?.score_delta as Record<string, unknown> | null
  const improvedPoints = assessment?.improved_points as unknown as Array<{ point?: string; impact?: string }> | null
  const regressedPoints = assessment?.regressed_points as unknown as Array<{ point?: string; impact?: string }> | null
  const newRisks = assessment?.new_risks as unknown as Array<{ risk?: string; severity?: string; suggestion?: string }> | null
  const usageSuggestions = assessment?.usage_suggestions as unknown as string[] | null

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await generateQualityReviewAction(caseId)
      if (result.success) {
        toast.success(result.message || "质量评审完成")
        window.location.reload()
      } else {
        toast.error(result.error || "质量评审失败")
      }
    } catch (e) {
      toast.error(`评审异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setGenerating(false)
    }
  }

  async function handleDecision(decisionVal: string) {
    setSubmittingDecision(decisionVal)
    try {
      const result = await submitUserDecisionAction(caseId, decisionVal)
      if (result.success) {
        toast.success(result.message || "决策已保存")
        window.location.reload()
      } else {
        toast.error(result.error || "保存失败")
      }
    } catch (e) {
      toast.error(`操作异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSubmittingDecision(null)
    }
  }

  if (!assessment && !hasOutputs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>新旧简历质量对比</CardTitle>
          <CardDescription>请先生成新版简历（交付物），然后再运行质量对比评审。</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!assessment && hasOutputs) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              新旧简历质量对比
            </CardTitle>
            <CardDescription>
              对比旧版简历与 AI 生成的新版简历，评估各维度变化，辅助决策。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-8">
              <FileSearch className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground text-center max-w-md">
                尚未生成质量对比评审。运行评审将对比旧版和新版简历在 JD 匹配度、可信度、证据支撑等方面的变化。
              </p>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSearch className="mr-2 h-4 w-4" />}
                {generating ? "评审中..." : "生成质量对比评审"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const oldScores = oldScore?.dimensions as Array<Record<string, unknown>> | undefined
  const newScores = newScore?.dimensions as Array<Record<string, unknown>> | undefined
  const dimensionDiffs = delta?.dimension_diffs as Array<Record<string, unknown>> | undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">新旧简历质量对比</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {candidateName} {targetRole ? `→ ${targetRole}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {decision !== "pending" && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              已选择：{decisionLabels[decision]}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-2 h-3 w-3" />}
            重新评审
          </Button>
        </div>
      </div>

      {/* Overall Conclusion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            总体结论
            {recConfig && (
              <Badge variant={recConfig.variant}>
                <recConfig.icon className="mr-1 h-3 w-3" />
                {recConfig.label}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{assessment!.overall_conclusion}</p>
        </CardContent>
      </Card>

      {/* Score Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">旧简历 vs 新简历评分表</CardTitle>
          <CardDescription>
            {oldScore?.overall != null && (
              <span>旧版综合：{String(oldScore.overall)} 分</span>
            )}
            {newScore?.overall != null && (
              <span className="ml-4">新版综合：{String(newScore.overall)} 分</span>
            )}
            {delta?.overall_diff != null && (
              <span className={`ml-4 font-medium ${Number(delta.overall_diff) >= 0 ? "text-green-600" : "text-red-600"}`}>
                ({Number(delta.overall_diff) >= 0 ? "+" : ""}{String(delta.overall_diff)})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">评审维度</th>
                  <th className="text-center py-2 font-medium">旧版</th>
                  <th className="text-center py-2 font-medium">新版</th>
                  <th className="text-center py-2 font-medium">变化</th>
                  <th className="text-left py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                {newScores?.map((dim, idx) => {
                  const oldDim = oldScores?.[idx]
                  const diff = dimensionDiffs?.find(
                    (d) => d.dimension === dim.dimension
                  )
                  const diffVal = diff?.diff != null ? Number(diff.diff) : null
                  return (
                    <tr key={String(dim.dimension ?? idx)} className="border-b last:border-0">
                      <td className="py-3 font-medium">{String(dim.dimension ?? "")}</td>
                      <td className="py-3 text-center">{oldDim?.score != null ? String(oldDim.score) : "-"}</td>
                      <td className="py-3 text-center">{dim.score != null ? String(dim.score) : "-"}</td>
                      <td className="py-3 text-center">
                        {diffVal != null ? (
                          <span className={`inline-flex items-center gap-1 ${diffVal >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {diffVal >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {diffVal >= 0 ? "+" : ""}{diffVal}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs max-w-[200px]">
                        {diff?.comment ? String(diff.comment) : dim.comment ? String(dim.comment) : ""}
                      </td>
                    </tr>
                  )
                })}
                {(!newScores || newScores.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">暂无维度评分数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Two-column: Improvements and Regressions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Improved Points */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowUp className="h-4 w-4 text-green-600" />
              新版提升点
            </CardTitle>
          </CardHeader>
          <CardContent>
            {improvedPoints && improvedPoints.length > 0 ? (
              <ul className="space-y-3">
                {improvedPoints.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <ArrowUp className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p>{item.point}</p>
                      {item.impact && (
                        <p className="text-xs text-muted-foreground mt-0.5">影响：{item.impact}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">暂无提升点数据</p>
            )}
          </CardContent>
        </Card>

        {/* Regressed Points */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDown className="h-4 w-4 text-red-600" />
              新版退步点
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regressedPoints && regressedPoints.length > 0 ? (
              <ul className="space-y-3">
                {regressedPoints.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm">
                    <ArrowDown className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p>{item.point}</p>
                      {item.impact && (
                        <p className="text-xs text-muted-foreground mt-0.5">影响：{item.impact}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">暂无退步点数据</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            新增风险
          </CardTitle>
        </CardHeader>
        <CardContent>
          {newRisks && newRisks.length > 0 ? (
            <ul className="space-y-3">
              {newRisks.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-sm border rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.risk}</p>
                      {item.severity && (
                        <Badge variant={item.severity === "high" ? "destructive" : item.severity === "medium" ? "default" : "secondary"} className="text-xs">
                          {item.severity === "high" ? "高" : item.severity === "medium" ? "中" : "低"}
                        </Badge>
                      )}
                    </div>
                    {item.suggestion && (
                      <p className="text-xs text-muted-foreground mt-1">建议：{item.suggestion}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">暂未发现新增风险</p>
          )}
        </CardContent>
      </Card>

      {/* Usage Suggestions */}
      {usageSuggestions && usageSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              使用建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {usageSuggestions.map((suggestion, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">{idx + 1}.</span>
                  <p>{suggestion}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Old vs New Resume Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">旧版简历</CardTitle>
          </CardHeader>
          <CardContent>
            {oldResumeDoc?.raw_text ? (
              <pre className="text-xs whitespace-pre-wrap max-h-96 overflow-y-auto bg-muted p-3 rounded-md">
                {oldResumeDoc.raw_text.slice(0, 3000)}
                {oldResumeDoc.raw_text.length > 3000 && "\n\n... (内容已截断)"}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">暂无旧版简历文本</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">新版简历</CardTitle>
          </CardHeader>
          <CardContent>
            {newResumeOutputs.length > 0 && newResumeOutputs[0]?.markdown ? (
              <>
                {newResumeOutputs[0]?.title && (
                  <p className="text-sm font-medium mb-2">{newResumeOutputs[0].title}</p>
                )}
                <pre className="text-xs whitespace-pre-wrap max-h-96 overflow-y-auto bg-muted p-3 rounded-md">
                  {newResumeOutputs[0].markdown.slice(0, 3000)}
                  {newResumeOutputs[0].markdown.length > 3000 && "\n\n... (内容已截断)"}
                </pre>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">暂无新版简历</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* User Decision Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SendHorizontal className="h-4 w-4" />
            选择使用决策
          </CardTitle>
          <CardDescription>
            请选择最终使用的简历版本。标记交付前必须完成此步骤。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {[
              { key: "use_new", label: "采用新版作为主版本", icon: CheckCircle2 },
              { key: "use_old", label: "采用旧版作为主版本", icon: FileText },
              { key: "generate_alternative_role", label: "生成替代岗位版本", icon: Target },
              { key: "force_target_version", label: "继续生成目标 JD 尝试版", icon: SendHorizontal },
              { key: "request_revision", label: "要求人工修改", icon: Pencil },
            ].map((item) => {
              const isSelected = decision === item.key
              const isSubmitting = submittingDecision === item.key
              return (
                <Button
                  key={item.key}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDecision(item.key)}
                  disabled={isSubmitting || generating}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <item.icon className="h-4 w-4" />
                  )}
                  {item.label}
                  {isSelected && <CheckCircle2 className="h-3 w-3 ml-1" />}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
