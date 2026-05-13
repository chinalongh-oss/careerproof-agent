"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  FileText,
  Save,
  Star,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react"
import { updateProjectCard, toggleFeaturedAction, regenerateCardsAction } from "../actions"
import { FIELD_LABELS, translateRiskFlag, translateRiskFlags } from "@/lib/i18n/project-card-labels"

type CardRow = {
  id: string
  case_id: string
  project_name: string | null
  business_context: string | null
  business_problem: string | null
  candidate_role: string | null
  personal_actions: unknown
  team_actions: unknown
  metrics: unknown
  result_summary: string | null
  evidence_level: string | null
  public_visibility: string | null
  risk_flags: unknown
  role_angle_tags: unknown
  reader_lens_tags: unknown
  recommended_expression: string | null
  not_recommended_expression: string | null
  interview_risks: unknown
  is_featured: boolean
  created_at: string
  updated_at: string
}

interface Props {
  caseId: string
  candidateName: string | null
  targetRole: string | null
  initialCards: CardRow[]
}

const JSON_FIELDS = [
  "personal_actions",
  "team_actions",
  "metrics",
  "risk_flags",
  "role_angle_tags",
  "reader_lens_tags",
  "interview_risks",
] as const

const TEXT_FIELDS = [
  { key: "project_name", label: "项目名称" },
  { key: "business_context", label: "业务背景" },
  { key: "business_problem", label: "业务问题" },
  { key: "candidate_role", label: "候选人角色" },
  { key: "result_summary", label: "结果摘要" },
  { key: "evidence_level", label: "证据等级" },
  { key: "public_visibility", label: "公开程度" },
  { key: "recommended_expression", label: "推荐表达" },
  { key: "not_recommended_expression", label: "不推荐表达" },
] as const

function toJsonString(val: unknown): string {
  if (val === null || val === undefined) return ""
  try {
    return JSON.stringify(val, null, 2)
  } catch {
    return String(val)
  }
}

function parseJsonField(val: string): { data: unknown; error: string | null } {
  const trimmed = val.trim()
  if (!trimmed) return { data: null, error: null }
  try {
    return { data: JSON.parse(trimmed), error: null }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "JSON 格式错误" }
  }
}

export function EvidenceClient({ caseId, candidateName, targetRole, initialCards }: Props) {
  const [cards, setCards] = useState(initialCards)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [editData, setEditData] = useState<Record<string, string>>({})
  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>({})

  if (cards.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">项目证据卡</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">暂无项目证据卡</p>
              <p className="text-sm text-muted-foreground">
                请先在案例详情页点击「生成项目证据卡」按钮，AI 将自动从简历中提取项目信息。
              </p>
              <Link href={`/admin/cases/${caseId}`}>
                <Button variant="outline">返回案例详情</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function startEditing(card: CardRow) {
    const data: Record<string, string> = {}
    for (const field of TEXT_FIELDS) {
      data[field.key] = (card[field.key] as string) ?? ""
    }
    for (const field of JSON_FIELDS) {
      data[field] = toJsonString(card[field])
    }
    setEditData(data)
    setJsonErrors({})
    setEditingId(card.id)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditData({})
    setJsonErrors({})
  }

  async function handleSave(cardId: string) {
    const newErrors: Record<string, string> = {}

    for (const field of JSON_FIELDS) {
      const val = editData[field] ?? ""
      if (val.trim()) {
        const { error } = parseJsonField(val)
        if (error) {
          newErrors[field] = error
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setJsonErrors(newErrors)
      toast.error("JSON 字段格式错误，请修正后保存")
      return
    }

    setSavingId(cardId)

    const updatePayload: Record<string, unknown> = {}

    for (const field of TEXT_FIELDS) {
      const val = editData[field.key] ?? ""
      updatePayload[field.key] = val || null
    }

    for (const field of JSON_FIELDS) {
      const val = editData[field] ?? ""
      if (val.trim()) {
        const { data: parsed } = parseJsonField(val)
        updatePayload[field] = parsed
      } else {
        updatePayload[field] = null
      }
    }

    const result = await updateProjectCard(cardId, caseId, updatePayload)
    if (result.success) {
      toast.success(result.message || "保存成功")
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
                ...c,
                ...(updatePayload as Partial<CardRow>),
                updated_at: new Date().toISOString(),
              }
            : c
        )
      )
      cancelEditing()
    } else {
      toast.error(result.error || "保存失败")
    }
    setSavingId(null)
  }

  async function handleToggleFeatured(cardId: string, currentFeatured: boolean) {
    const result = await toggleFeaturedAction(cardId, caseId, currentFeatured)
    if (result.success) {
      toast.success(result.message)
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, is_featured: !currentFeatured } : c
        )
      )
    } else {
      toast.error(result.error || "操作失败")
    }
  }

  async function handleRegenerate() {
    if (!confirm("重新生成将覆盖当前所有项目证据卡，包括人工编辑的内容。确定要继续吗？")) {
      return
    }

    setRegenerating(true)
    try {
      const result = await regenerateCardsAction(caseId)
      if (result.success) {
        toast.success(result.message || "重新生成完成")
        window.location.reload()
      } else {
        toast.error(result.error || "重新生成失败")
      }
    } catch (e) {
      toast.error(`重新生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setRegenerating(false)
    }
  }

  function toggleExpand(cardId: string) {
    setExpandedCards((prev) => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }

  function renderFieldValue(field: keyof CardRow, card: CardRow, isEditing: boolean) {
    if (isEditing && editingId === card.id) {
      if ((JSON_FIELDS as readonly string[]).includes(field)) {
        const errorMsg = jsonErrors[field]
        return (
          <div>
            <Textarea
              className="font-mono text-xs min-h-[80px]"
              value={editData[field] ?? ""}
              onChange={(e) => {
                setEditData((prev) => ({ ...prev, [field]: e.target.value }))
                if (errorMsg) {
                  setJsonErrors((prev) => {
                    const next = { ...prev }
                    delete next[field]
                    return next
                  })
                }
              }}
            />
            {errorMsg && (
              <p className="text-xs text-destructive mt-1">{errorMsg}</p>
            )}
          </div>
        )
      }
      return (
        <Input
          className="text-sm"
          value={editData[field] ?? ""}
          onChange={(e) =>
            setEditData((prev) => ({ ...prev, [field]: e.target.value }))
          }
        />
      )
    }

    const val = card[field]
    if (val === null || val === undefined) {
      return <span className="text-muted-foreground text-sm">—</span>
    }
    if (field === "is_featured") {
      return val ? (
        <Badge variant="default"><Star className="h-3 w-3 mr-1" />重点项目</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      )
    }
    if (typeof val === "object") {
      const displayVal = field === "risk_flags" ? translateRiskFlags(val) : val
      return (
        <pre className="text-xs bg-muted rounded p-2 overflow-auto max-h-40 whitespace-pre-wrap">
          {JSON.stringify(displayVal, null, 2)}
        </pre>
      )
    }
    return <span className="text-sm">{String(val)}</span>
  }

  function renderRiskFlags(raw: unknown) {
    let flags: unknown
    try {
      flags = typeof raw === "string" ? JSON.parse(raw) : raw
    } catch {
      return null
    }
    if (!Array.isArray(flags) || flags.length === 0) return null
    const list = flags as unknown[]
    return (
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
        <span className="text-xs text-muted-foreground">风险标签：</span>
        {list.map((f, i) => (
          <Badge key={i} variant="outline" className="text-xs border-yellow-400 text-yellow-600">
            {translateRiskFlag(String(f))}
          </Badge>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">项目证据卡</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            重新生成
          </Button>
          <Link href={`/admin/cases/${caseId}`}>
            <Button variant="ghost" size="sm">返回概览</Button>
          </Link>
        </div>
      </div>

      {cards.length === 0 ? null : (
        <p className="text-sm text-muted-foreground">
          共 {cards.length} 张项目证据卡
          {cards.filter((c) => c.is_featured).length > 0 &&
            ` · ${cards.filter((c) => c.is_featured).length} 张重点项目`}
        </p>
      )}

      <div className="space-y-4">
        {cards.map((card) => {
          const isEditing = editingId === card.id
          const isSaving = savingId === card.id
          const isExpanded = expandedCards.has(card.id)

          return (
            <Card key={card.id} className={card.is_featured ? "border-primary/50" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isEditing ? (
                        <div className="flex-1">
                          <Input
                            className="text-lg font-semibold"
                            value={editData["project_name"] ?? ""}
                            onChange={(e) =>
                              setEditData((prev) => ({ ...prev, project_name: e.target.value }))
                            }
                          />
                        </div>
                      ) : (
                        <CardTitle className="text-lg">
                          {card.project_name || "未命名项目"}
                        </CardTitle>
                      )}
                      {card.is_featured && (
                        <Badge><Star className="h-3 w-3 mr-1" />重点</Badge>
                      )}
                      {card.evidence_level && (
                        <Badge variant={
                          card.evidence_level === "strong" ? "default" :
                          card.evidence_level === "medium" ? "secondary" : "outline"
                        }>
                          证据:{card.evidence_level}
                        </Badge>
                      )}
                      {card.public_visibility && (
                        <Badge variant="outline">{card.public_visibility}</Badge>
                      )}
                    </div>
                    {!isEditing && (card.business_context || card.candidate_role) && (
                      <CardDescription className="mt-1">
                        {[card.candidate_role, card.business_context].filter(Boolean).join(" · ")}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(card.id, card.is_featured)}
                      title={card.is_featured ? "取消重点项目" : "标记为重点项目"}
                    >
                      <Star className={`h-4 w-4 ${card.is_featured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                    </Button>
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSave(card.id)}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-1" />
                          )}
                          保存
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          disabled={isSaving}
                        >
                          取消
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(card)}
                      >
                        编辑
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(card.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  {isEditing ? (
                    <>
                      {TEXT_FIELDS.filter((f) => f.key !== "project_name").map((field) => (
                        <div key={field.key}>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            {field.label}
                          </label>
                          {renderFieldValue(field.key as keyof CardRow, card, true)}
                        </div>
                      ))}
                      {JSON_FIELDS.map((field) => (
                        <div key={field}>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            {FIELD_LABELS[field] ?? field}
                          </label>
                          {renderFieldValue(field as keyof CardRow, card, true)}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {TEXT_FIELDS.filter((f) => f.key !== "project_name").map((field) => (
                        <div key={field.key}>
                          <label className="text-xs font-medium text-muted-foreground">{field.label}</label>
                          <div className="mt-1">{renderFieldValue(field.key as keyof CardRow, card, false)}</div>
                        </div>
                      ))}
                      {JSON_FIELDS.map((field) => (
                        <div key={field} className="md:col-span-2">
                          <label className="text-xs font-medium text-muted-foreground">
                            {FIELD_LABELS[field] ?? field}
                          </label>
                          <div className="mt-1">{renderFieldValue(field as keyof CardRow, card, false)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {card.risk_flags ? renderRiskFlags(card.risk_flags) : null}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
