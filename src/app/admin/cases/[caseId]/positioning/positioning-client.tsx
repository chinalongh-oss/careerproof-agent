"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import {
  Target,
  Fingerprint,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Star,
  AlertTriangle,
} from "lucide-react"
import { generateFingerprintAction, generatePositioningsAction, selectPositioningAction } from "../actions"

type FingerprintRow = {
  id: string
  case_id: string
  career_axis: string | null
  secondary_axis: string | null
  decision_style: string | null
  expression_style: string | null
  differentiation_summary: string | null
  signature_projects: unknown
  not_recommended_positioning: unknown
  created_at: string
}

type PositioningRow = {
  id: string
  case_id: string
  selected: boolean
  version_name: string | null
  target_reader: string | null
  career_axis: string | null
  secondary_axis: string | null
  one_line_summary: string | null
  value_summary: string | null
  tone_tags: unknown
  recommended_projects: unknown
  weak_projects: unknown
  risks: unknown
  created_at: string
}

interface Props {
  caseId: string
  candidateName: string | null
  targetRole: string | null
  hasJD: boolean
  hasCards: boolean
  fingerprint: FingerprintRow | null
  positionings: PositioningRow[]
  projectMap: Record<string, string>
}

function mapIdsToNames(ids: unknown, projectMap: Record<string, string>): string[] {
  if (!Array.isArray(ids)) return []
  return ids.map((id: string) => projectMap[id] || id)
}

function renderArrayField(val: unknown) {
  if (!Array.isArray(val) || val.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>
  }
  return (
    <ul className="list-disc list-inside space-y-0.5">
      {val.map((item, i) => (
        <li key={i} className="text-sm">{String(item)}</li>
      ))}
    </ul>
  )
}

function renderBadges(val: unknown) {
  if (!Array.isArray(val) || val.length === 0) {
    return <span className="text-muted-foreground text-sm">—</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {val.map((item, i) => (
        <Badge key={i} variant="secondary" className="text-xs">{String(item)}</Badge>
      ))}
    </div>
  )
}

function renderProjectBadges(ids: unknown, projectMap: Record<string, string>) {
  const names = mapIdsToNames(ids, projectMap)
  if (names.length === 0) return <span className="text-muted-foreground text-sm">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((name, i) => (
        <Badge key={i} variant="outline" className="text-xs">{name}</Badge>
      ))}
    </div>
  )
}

export function PositioningClient({
  caseId,
  candidateName,
  targetRole,
  hasJD,
  hasCards,
  fingerprint,
  positionings,
  projectMap,
}: Props) {
  const [fpPending, setFpPending] = useState(false)
  const [posPending, setPosPending] = useState(false)
  const [selectingId, setSelectingId] = useState<string | null>(null)

  async function handleGenerateFingerprint() {
    setFpPending(true)
    try {
      const result = await generateFingerprintAction(caseId)
      if (result.success) {
        toast.success(result.message || "职业指纹生成完成")
        window.location.reload()
      } else {
        toast.error(result.error || "职业指纹生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setFpPending(false)
    }
  }

  async function handleGeneratePositionings() {
    setPosPending(true)
    try {
      const result = await generatePositioningsAction(caseId)
      if (result.success) {
        toast.success(result.message || "职业定位生成完成")
        window.location.reload()
      } else {
        toast.error(result.error || "职业定位生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setPosPending(false)
    }
  }

  async function handleSelect(positioningId: string) {
    setSelectingId(positioningId)
    try {
      const result = await selectPositioningAction(caseId, positioningId)
      if (result.success) {
        toast.success(result.message || "已选择定位")
        window.location.reload()
      } else {
        toast.error(result.error || "选择失败")
      }
    } catch (e) {
      toast.error(`选择异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSelectingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">职业定位</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <Link href={`/admin/cases/${caseId}`}>
          <Button variant="ghost" size="sm">返回概览</Button>
        </Link>
      </div>

      {!hasJD && (
        <Card className="border-dashed border-yellow-400">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
              <div>
                <p className="font-medium">请先解析 JD</p>
                <p className="text-sm text-muted-foreground">
                  生成职业指纹和定位需要 JD 作为目标上下文。
                  <Link href={`/admin/cases/${caseId}/jd`} className="underline ml-1">前往 JD 解析</Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasCards && (
        <Card className="border-dashed border-yellow-400">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
              <div>
                <p className="font-medium">请先生成项目证据卡</p>
                <p className="text-sm text-muted-foreground">
                  职业指纹和定位需要项目证据卡作为分析基础。
                  <Link href={`/admin/cases/${caseId}/evidence`} className="underline ml-1">前往项目证据卡</Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">职业指纹</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateFingerprint}
              disabled={fpPending || !hasJD || !hasCards}
            >
              {fpPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : fingerprint ? (
                <RefreshCw className="h-4 w-4 mr-1.5" />
              ) : (
                <Fingerprint className="h-4 w-4 mr-1.5" />
              )}
              {fpPending ? "生成中..." : fingerprint ? "重新生成指纹" : "生成职业指纹"}
            </Button>
          </div>
          {!fingerprint && (
            <CardDescription>尚未生成职业指纹，请点击上方按钮生成</CardDescription>
          )}
        </CardHeader>
        {fingerprint && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">主职业轴</label>
                <p className="text-sm mt-1">{fingerprint.career_axis || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">辅助职业轴</label>
                <p className="text-sm mt-1">{fingerprint.secondary_axis || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">决策风格</label>
                <p className="text-sm mt-1">{fingerprint.decision_style || "—"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">表达风格</label>
                <p className="text-sm mt-1">{fingerprint.expression_style || "—"}</p>
              </div>
            </div>
            <Separator />
            <div>
              <label className="text-xs font-medium text-muted-foreground">差异化总结</label>
              <p className="text-sm mt-1">{fingerprint.differentiation_summary || "—"}</p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">标志性项目</label>
                <div className="mt-1">{renderProjectBadges(fingerprint.signature_projects, projectMap)}</div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">不推荐的定位方向</label>
                <div className="mt-1">{renderArrayField(fingerprint.not_recommended_positioning)}</div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">
                职业定位方案
                {positionings.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({positionings.length} 个方案)
                  </span>
                )}
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePositionings}
              disabled={posPending || !fingerprint}
            >
              {posPending ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : positionings.length > 0 ? (
                <RefreshCw className="h-4 w-4 mr-1.5" />
              ) : (
                <Target className="h-4 w-4 mr-1.5" />
              )}
              {posPending ? "生成中..." : positionings.length > 0 ? "重新生成定位" : "生成职业定位"}
            </Button>
          </div>
          {!fingerprint && (
            <CardDescription>请先生成职业指纹，然后才能生成职业定位方案</CardDescription>
          )}
          {fingerprint && positionings.length === 0 && (
            <CardDescription>尚未生成职业定位方案，请点击上方按钮生成</CardDescription>
          )}
        </CardHeader>
        {positionings.length > 0 && (
          <CardContent className="space-y-4">
            {positionings.map((pos) => (
              <Card
                key={pos.id}
                className={pos.selected ? "border-primary ring-1 ring-primary" : ""}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{pos.version_name || "未命名定位"}</CardTitle>
                        {pos.selected && (
                          <Badge>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            已选择
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">
                        {pos.one_line_summary || "暂无一句话总结"}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant={pos.selected ? "secondary" : "default"}
                      onClick={() => handleSelect(pos.id)}
                      disabled={pos.selected || selectingId !== null}
                    >
                      {selectingId === pos.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : pos.selected ? (
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                      ) : (
                        <Star className="h-4 w-4 mr-1" />
                      )}
                      {pos.selected ? "已选择" : "选择此定位"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">目标读者</label>
                      <p className="text-sm mt-0.5">{pos.target_reader || "—"}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">职业轴</label>
                      <p className="text-sm mt-0.5">
                        {[pos.career_axis, pos.secondary_axis].filter(Boolean).join(" / ") || "—"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">价值主张</label>
                    <p className="text-sm mt-0.5">{pos.value_summary || "—"}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">风格标签</label>
                    <div className="mt-1">{renderBadges(pos.tone_tags)}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">推荐突出的项目</label>
                      <div className="mt-1">{renderProjectBadges(pos.recommended_projects, projectMap)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">建议弱化的项目</label>
                      <div className="mt-1">{renderProjectBadges(pos.weak_projects, projectMap)}</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">风险提示</label>
                    {Array.isArray(pos.risks) && (pos.risks as unknown[]).length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 mt-1">
                        {(pos.risks as unknown[]).map((r, i) => (
                          <li key={i} className="text-sm text-muted-foreground">{String(r)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-0.5">—</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
