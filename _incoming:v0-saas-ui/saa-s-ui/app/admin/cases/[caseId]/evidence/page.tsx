"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Star,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Save,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react"

// Mock evidence cards
const mockCards = [
  {
    id: "card-1",
    projectName: "AI 对话产品 0-1 设计与落地",
    businessContext: "公司战略转型 AI 方向，需要快速验证 AI 对话产品的可行性",
    businessProblem: "市场上缺乏垂直领域的 AI 对话解决方案，用户反馈现有方案理解准确率低",
    candidateRole: "产品负责人",
    personalActions: [
      "主导产品定义和竞品分析，确定差异化定位",
      "设计核心对话流程和知识库架构",
      "协调算法、前端、后端团队完成 MVP 开发",
    ],
    teamActions: ["算法团队完成模型微调", "前端团队开发对话界面", "后端搭建知识库系统"],
    resultSummary: "产品上线 3 个月 DAU 达到 5 万，用户满意度 92%",
    evidenceLevel: "strong",
    publicVisibility: "public",
    isFeatured: true,
    riskFlags: ["data_missing", "attribution_unclear"],
    metrics: {
      DAU: "5万",
      用户满意度: "92%",
      上线周期: "3个月",
    },
  },
  {
    id: "card-2",
    projectName: "用户增长策略优化",
    businessContext: "公司主营产品用户增长停滞，需要寻找新的增长点",
    businessProblem: "现有增长渠道 ROI 持续下降，获客成本攀升",
    candidateRole: "产品经理",
    personalActions: [
      "分析用户留存漏斗，定位流失关键节点",
      "设计社交裂变功能，提升自然增长",
      "优化新用户引导流程，提升次日留存",
    ],
    teamActions: ["运营团队执行推广活动", "数据团队搭建增长看板"],
    resultSummary: "次日留存提升 15%，获客成本降低 30%",
    evidenceLevel: "medium",
    publicVisibility: "internal",
    isFeatured: false,
    riskFlags: [],
    metrics: {
      次日留存提升: "15%",
      获客成本降低: "30%",
    },
  },
]

const evidenceLevelMap: Record<string, { label: string; className: string }> = {
  strong: { label: "强证据", className: "bg-success/10 text-success" },
  medium: { label: "中等证据", className: "bg-warning/10 text-warning" },
  weak: { label: "弱证据", className: "bg-muted text-muted-foreground" },
}

const riskFlagMap: Record<string, string> = {
  overclaim: "夸大表达",
  data_missing: "数据缺失",
  attribution_unclear: "归因不清",
  sensitive_info: "敏感信息",
}

export default function EvidencePage() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set(["card-1"]))
  const [editingCard, setEditingCard] = useState<string | null>(null)

  const toggleExpand = (cardId: string) => {
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
            <h1 className="text-2xl font-bold">项目证据卡</h1>
          </div>
          <p className="text-muted-foreground">
            张三 · 共 {mockCards.length} 张证据卡，{mockCards.filter((c) => c.isFeatured).length} 张重点项目
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新生成
          </Button>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-4">
        {mockCards.map((card) => {
          const isExpanded = expandedCards.has(card.id)
          const isEditing = editingCard === card.id
          const levelInfo = evidenceLevelMap[card.evidenceLevel] || evidenceLevelMap.weak

          return (
            <Card
              key={card.id}
              className={`border-border ${card.isFeatured ? "ring-2 ring-warning/30" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <CardTitle className="text-lg">{card.projectName}</CardTitle>
                      {card.isFeatured && (
                        <Badge className="bg-warning/10 text-warning border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          重点
                        </Badge>
                      )}
                      <Badge className={`${levelInfo.className} border-0`}>
                        {levelInfo.label}
                      </Badge>
                      <Badge variant="outline">{card.publicVisibility === "public" ? "可公开" : "内部"}</Badge>
                    </div>
                    <CardDescription>
                      {card.candidateRole} · {card.businessContext.slice(0, 50)}...
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {}}
                    >
                      <Star
                        className={`h-4 w-4 ${card.isFeatured ? "fill-warning text-warning" : ""}`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCard(isEditing ? null : card.id)}
                    >
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          取消
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-4 w-4 mr-1" />
                          编辑
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
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
                <CardContent className="space-y-6 pt-0">
                  {/* Risk flags */}
                  {card.riskFlags.length > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                      <span className="text-sm text-destructive font-medium mr-2">风险标签：</span>
                      <div className="flex gap-2 flex-wrap">
                        {card.riskFlags.map((flag) => (
                          <Badge
                            key={flag}
                            variant="outline"
                            className="border-destructive/30 text-destructive"
                          >
                            {riskFlagMap[flag] || flag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldBlock label="业务背景" value={card.businessContext} isEditing={isEditing} />
                    <FieldBlock label="业务问题" value={card.businessProblem} isEditing={isEditing} />
                    <FieldBlock label="候选人角色" value={card.candidateRole} isEditing={isEditing} />
                    <FieldBlock label="结果摘要" value={card.resultSummary} isEditing={isEditing} />
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        个人动作
                      </label>
                      {isEditing ? (
                        <Textarea
                          className="min-h-[120px] bg-background"
                          defaultValue={card.personalActions.join("\n")}
                        />
                      ) : (
                        <ul className="space-y-2">
                          {card.personalActions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 mt-0.5 text-success shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        团队动作
                      </label>
                      {isEditing ? (
                        <Textarea
                          className="min-h-[120px] bg-background"
                          defaultValue={card.teamActions.join("\n")}
                        />
                      ) : (
                        <ul className="space-y-2">
                          {card.teamActions.map((action, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="h-4 w-4 flex items-center justify-center shrink-0">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">
                      量化指标
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(card.metrics).map(([key, value]) => (
                        <div
                          key={key}
                          className="px-3 py-2 rounded-lg bg-muted/50 border border-border"
                        >
                          <span className="text-xs text-muted-foreground">{key}：</span>
                          <span className="text-sm font-semibold ml-1">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save button */}
                  {isEditing && (
                    <div className="flex justify-end pt-4 border-t border-border">
                      <Button onClick={() => setEditingCard(null)}>
                        <Save className="h-4 w-4 mr-2" />
                        保存更改
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function FieldBlock({
  label,
  value,
  isEditing,
}: {
  label: string
  value: string
  isEditing: boolean
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-2 block">{label}</label>
      {isEditing ? (
        <Textarea className="min-h-[80px] bg-background" defaultValue={value} />
      ) : (
        <p className="text-sm leading-relaxed">{value}</p>
      )}
    </div>
  )
}
