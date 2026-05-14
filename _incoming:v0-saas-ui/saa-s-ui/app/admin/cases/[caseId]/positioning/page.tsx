"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  RefreshCw,
  Check,
  ChevronRight,
  Users,
  Target,
  Sparkles,
  AlertTriangle,
} from "lucide-react"

// Mock career fingerprint
const careerFingerprint = {
  careerAxis: "产品设计与战略规划",
  secondaryAxis: "跨部门协调与团队管理",
  decisionStyle: "数据驱动型决策者，善于用 AB 测试验证假设",
  expressionStyle: "结果导向，习惯用量化指标说话",
  differentiationSummary:
    "具备 AI 产品从 0-1 完整经验，同时拥有数据分析和业务增长背景，能够在技术理解与商业洞察之间建立桥梁。",
  signatureProjects: ["AI 对话产品 0-1 设计与落地", "用户增长策略优化"],
  notRecommendedPositioning: ["纯技术管理方向", "偏运营执行的岗位"],
}

// Mock positionings
const mockPositionings = [
  {
    id: "pos-1",
    versionName: "业务结果导向版",
    targetReader: "业务部门负责人 / CEO",
    careerAxis: "业务增长与商业价值创造",
    secondaryAxis: "数据驱动决策",
    oneLineSummary: "用 AI 产品驱动业务增长的产品负责人",
    valueSummary:
      "8 年产品经验，主导过 AI 对话产品从 0-1 落地，3 个月内 DAU 达到 5 万。擅长用数据驱动产品决策，曾将用户获客成本降低 30%。",
    toneTags: ["结果导向", "数据驱动", "商业敏锐"],
    recommendedProjects: ["AI 对话产品 0-1 设计与落地", "用户增长策略优化"],
    weakProjects: [],
    risks: ["可能被认为偏业务而非产品专业"],
    selected: false,
  },
  {
    id: "pos-2",
    versionName: "产品专业版",
    targetReader: "产品总监 / CPO",
    careerAxis: "AI 产品设计与用户体验",
    secondaryAxis: "产品方法论与流程优化",
    oneLineSummary: "深耕 AI 产品设计的资深产品专家",
    valueSummary:
      "专注 AI 产品领域，对 LLM 应用有深入理解。善于将技术能力转化为用户价值，打造过用户满意度 92% 的 AI 对话产品。",
    toneTags: ["专业深度", "用户导向", "技术理解"],
    recommendedProjects: ["AI 对话产品 0-1 设计与落地"],
    weakProjects: ["用户增长策略优化"],
    risks: ["弱化了增长和商业相关经验"],
    selected: true,
  },
  {
    id: "pos-3",
    versionName: "跨部门协作版",
    targetReader: "HR / 招聘经理",
    careerAxis: "跨部门协调与资源整合",
    secondaryAxis: "团队管理与人才培养",
    oneLineSummary: "善于推动跨部门协作的产品负责人",
    valueSummary:
      "在复杂组织环境中推动产品落地的经验丰富。曾协调算法、前端、后端、运营团队完成 AI 产品 MVP，具备管理 5 人产品团队经验。",
    toneTags: ["协作能力", "领导力", "组织协调"],
    recommendedProjects: ["AI 对话产品 0-1 设计与落地"],
    weakProjects: [],
    risks: ["定位较为通用，差异化不够突出"],
    selected: false,
  },
]

export default function PositioningPage() {
  const [selectedId, setSelectedId] = useState<string | null>("pos-2")

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
            <h1 className="text-2xl font-bold">职业定位</h1>
          </div>
          <p className="text-muted-foreground">张三 · 职业指纹与定位方案</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          重新生成
        </Button>
      </div>

      {/* Career fingerprint */}
      <Card className="border-border bg-foreground text-background">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-background">
            <Sparkles className="h-5 w-5" />
            职业指纹
          </CardTitle>
          <CardDescription className="text-background/70">
            基于证据卡分析的差异化定位基础
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-background/60 mb-1">主轴</p>
              <p className="font-semibold">{careerFingerprint.careerAxis}</p>
            </div>
            <div>
              <p className="text-xs text-background/60 mb-1">辅轴</p>
              <p className="font-semibold">{careerFingerprint.secondaryAxis}</p>
            </div>
            <div>
              <p className="text-xs text-background/60 mb-1">决策风格</p>
              <p className="text-sm text-background/90">{careerFingerprint.decisionStyle}</p>
            </div>
            <div>
              <p className="text-xs text-background/60 mb-1">表达风格</p>
              <p className="text-sm text-background/90">{careerFingerprint.expressionStyle}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-background/60 mb-2">差异化总结</p>
            <p className="text-sm leading-relaxed text-background/90">
              {careerFingerprint.differentiationSummary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {careerFingerprint.signatureProjects.map((project, i) => (
              <Badge key={i} variant="secondary" className="bg-background/20 text-background border-0">
                {project}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Positioning options */}
      <div>
        <h2 className="text-lg font-semibold mb-4">定位方案</h2>
        <p className="text-sm text-muted-foreground mb-6">
          请选择一个定位方案，系统将基于此生成简历和个人主页
        </p>
        <div className="grid grid-cols-1 gap-4">
          {mockPositionings.map((pos) => {
            const isSelected = selectedId === pos.id

            return (
              <Card
                key={pos.id}
                className={`border-border cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-foreground" : "hover:border-foreground/30"
                }`}
                onClick={() => setSelectedId(pos.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Selection indicator */}
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        isSelected
                          ? "bg-foreground border-foreground"
                          : "border-border"
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 text-background" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{pos.versionName}</h3>
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {pos.targetReader}
                        </Badge>
                        {isSelected && (
                          <Badge className="bg-success text-success-foreground border-0">
                            已选择
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{pos.oneLineSummary}</p>
                      <p className="text-sm leading-relaxed mb-4">{pos.valueSummary}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {pos.toneTags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Risks */}
                      {pos.risks.length > 0 && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20">
                          <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                          <div className="text-sm text-warning">
                            {pos.risks.map((risk, i) => (
                              <p key={i}>{risk}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          {selectedId ? "已选择定位方案，可继续生成交付物" : "请选择一个定位方案"}
        </p>
        <Button disabled={!selectedId}>
          确认定位并继续
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
