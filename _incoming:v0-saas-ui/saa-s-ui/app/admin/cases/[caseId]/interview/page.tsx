import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  RefreshCw,
  Download,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from "lucide-react"

// Mock interview pack data
const interviewPack = {
  overallStrategy:
    "本次面试重点突出 AI 产品经验和数据驱动决策能力。准备好用 STAR 方法讲述 AI 对话产品从 0-1 的故事，同时要准备好解释 DAU 数据的统计口径和用户满意度调研的方法论。",
  topRisks: [
    {
      risk: "DAU 数据可能被追问统计口径",
      source: "AI 对话产品 0-1 设计与落地",
      interviewApproach: "主动说明口径：当日有至少 1 次有效对话的独立用户",
    },
    {
      risk: "满意度数据可能被追问调研方法",
      source: "AI 对话产品 0-1 设计与落地",
      interviewApproach: "准备好调研样本量（N=500）和问卷设计思路",
    },
    {
      risk: "跨部门协调经验可能被深挖细节",
      source: "AI 对话产品 0-1 设计与落地",
      interviewApproach: "准备 1-2 个具体的协调冲突和解决案例",
    },
  ],
  preparationChecklist: [
    {
      item: "准备 DAU 计算口径说明",
      reason: "高风险数据点",
      detail: "当日有效对话用户数，排除空会话",
    },
    {
      item: "准备满意度调研方法论",
      reason: "中风险数据点",
      detail: "NPS 调研，样本量 500，2026Q1 进行",
    },
    {
      item: "准备跨部门协调案例",
      reason: "可能被追问",
      detail: "与算法团队就模型选型的讨论过程",
    },
    {
      item: "准备竞品分析材料",
      reason: "展示专业度",
      detail: "3-5 个主要竞品的功能对比",
    },
  ],
  projectQuestions: [
    {
      projectName: "AI 对话产品 0-1 设计与落地",
      projectSummary: "从 0 开始设计和落地 AI 对话产品，3 个月达到 5 万 DAU",
      likelyQuestions: [
        {
          question: "能详细讲讲这个产品从 0-1 的过程吗？",
          context: "考察产品规划和执行能力",
        },
        {
          question: "5 万 DAU 是怎么计算的？",
          context: "验证数据真实性",
        },
        {
          question: "遇到了哪些技术难题？如何解决的？",
          context: "考察技术理解和问题解决能力",
        },
      ],
      highRiskQuestions: [
        {
          question: "这个项目中哪些是你做的，哪些是团队做的？",
          riskSource: "归因不清风险",
          whyRisky: "可能被认为夸大个人贡献",
        },
        {
          question: "92% 满意度是怎么测量的？",
          riskSource: "数据缺失风险",
          whyRisky: "缺少调研方法论说明",
        },
      ],
      answerStructure:
        "使用 STAR 方法：1) 公司战略转型背景 2) 我负责产品定义和跨部门协调 3) 设计核心流程、协调开发、推动上线 4) 3 个月 5 万 DAU、92% 满意度",
      dataToPrePrepare: ["DAU 统计口径", "满意度调研方法", "团队分工明细"],
      doNotOverclaim: [
        "不要说独自完成，要强调作为产品负责人的角色",
        "不要对算法性能做过度承诺",
      ],
      suggestedBoundaryStatement:
        "这个项目我的角色是产品负责人，主要负责产品定义、优先级决策和跨部门协调。算法优化由算法团队完成，我的贡献是从产品角度定义优化方向。",
    },
  ],
}

export default function InterviewPage() {
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
            <h1 className="text-2xl font-bold">面试准备包</h1>
          </div>
          <p className="text-muted-foreground">张三 · AI 产品负责人岗位面试准备</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新生成
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出 PDF
          </Button>
        </div>
      </div>

      {/* Overall strategy */}
      <Card className="border-border bg-foreground text-background">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-background">
            <BookOpen className="h-5 w-5" />
            整体策略
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-background/90">
            {interviewPack.overallStrategy}
          </p>
        </CardContent>
      </Card>

      {/* Top risks */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            重点风险提示
          </CardTitle>
          <CardDescription>面试中可能被追问的高风险点</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interviewPack.topRisks.map((risk, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-warning/20 bg-warning/5"
              >
                <div className="flex items-start gap-3">
                  <span className="h-6 w-6 rounded-full bg-warning text-warning-foreground flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium mb-1">{risk.risk}</p>
                    <p className="text-sm text-muted-foreground mb-2">
                      来源：{risk.source}
                    </p>
                    <div className="p-2 rounded bg-background border border-border">
                      <p className="text-sm">
                        <span className="font-medium">应对策略：</span>
                        {risk.interviewApproach}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preparation checklist */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            准备清单
          </CardTitle>
          <CardDescription>面试前需要准备的材料和数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {interviewPack.preparationChecklist.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
              >
                <div className="h-5 w-5 rounded border-2 border-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.item}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.reason} · {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project questions */}
      {interviewPack.projectQuestions.map((project, i) => (
        <Card key={i} className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              项目追问：{project.projectName}
            </CardTitle>
            <CardDescription>{project.projectSummary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Likely questions */}
            <div>
              <h4 className="text-sm font-medium mb-3">可能被问到的问题</h4>
              <div className="space-y-2">
                {project.likelyQuestions.map((q, j) => (
                  <div key={j} className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="font-medium text-sm mb-1">{q.question}</p>
                    <p className="text-xs text-muted-foreground">{q.context}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* High risk questions */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                高风险追问
              </h4>
              <div className="space-y-2">
                {project.highRiskQuestions.map((q, j) => (
                  <div
                    key={j}
                    className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                  >
                    <p className="font-medium text-sm mb-1 text-destructive">{q.question}</p>
                    <p className="text-xs text-muted-foreground mb-1">
                      风险来源：{q.riskSource}
                    </p>
                    <p className="text-xs text-destructive">{q.whyRisky}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Answer structure */}
            <div>
              <h4 className="text-sm font-medium mb-2">推荐回答结构</h4>
              <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm text-success">{project.answerStructure}</p>
              </div>
            </div>

            {/* Data to prepare */}
            <div>
              <h4 className="text-sm font-medium mb-2">需准备的数据</h4>
              <div className="flex flex-wrap gap-2">
                {project.dataToPrePrepare.map((data, j) => (
                  <Badge key={j} variant="outline">
                    {data}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Do not overclaim */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                避免夸大
              </h4>
              <ul className="space-y-1">
                {project.doNotOverclaim.map((item, j) => (
                  <li key={j} className="text-sm text-warning flex items-start gap-2">
                    <span>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Boundary statement */}
            <div>
              <h4 className="text-sm font-medium mb-2">边界说明话术</h4>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm italic">&ldquo;{project.suggestedBoundaryStatement}&rdquo;</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
