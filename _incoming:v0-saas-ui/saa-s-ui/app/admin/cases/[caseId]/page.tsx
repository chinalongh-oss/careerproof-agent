import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  RefreshCw,
  ExternalLink,
} from "lucide-react"

// Mock case data
const caseData = {
  id: "case-001",
  candidateName: "张三",
  email: "zhangsan@example.com",
  wechat: "zhangsan_wx",
  currentTitle: "高级产品经理",
  targetDirection: "AI 产品",
  targetRole: "AI 产品负责人",
  status: "positioning_ready",
  statusLabel: "定位已生成",
  createdAt: "2026-05-14 10:30",
  updatedAt: "2026-05-14 15:45",
  privacyNotes: "公司名称需脱敏处理",
}

// Workflow steps
const workflowSteps = [
  { id: "parse_resume", label: "解析简历", status: "succeeded" },
  { id: "build_project_cards", label: "生成证据卡", status: "succeeded" },
  { id: "parse_jd", label: "解析 JD", status: "succeeded" },
  { id: "generate_fingerprint", label: "生成职业指纹", status: "succeeded" },
  { id: "generate_positionings", label: "生成定位", status: "succeeded" },
  { id: "evaluate_job_fit", label: "岗位适配", status: "pending" },
  { id: "generate_outputs", label: "生成交付物", status: "pending" },
  { id: "audit_risks", label: "风险审查", status: "pending" },
  { id: "generate_interview_pack", label: "面试准备包", status: "pending" },
]

// Mock documents
const documents = {
  resume: {
    fileName: "张三_简历_2026.pdf",
    rawText: `张三
高级产品经理 | 8年产品经验

联系方式
邮箱：zhangsan@example.com
微信：zhangsan_wx

工作经历
某科技公司 | 高级产品经理 | 2022-至今
- 主导 AI 对话产品从 0-1 设计与落地
- 负责产品策略规划和跨部门协调
- 带领 5 人产品团队

某互联网公司 | 产品经理 | 2018-2022
- 负责核心业务线产品迭代
- 推动用户增长相关功能上线
- 数据驱动产品决策

教育背景
某重点大学 | 计算机科学与技术 | 本科 | 2014-2018`,
  },
  jd: {
    fileName: "AI产品负责人_JD.txt",
    rawText: `AI 产品负责人
职位描述
我们正在寻找一位经验丰富的 AI 产品负责人，负责公司 AI 产品线的整体规划和落地。

岗位职责
1. 负责 AI 产品的整体规划和路线图制定
2. 深入理解业务需求，定义产品方向和优先级
3. 与技术团队紧密合作，推动产品迭代
4. 建立产品度量体系，持续优化产品体验

任职要求
1. 5年以上产品经验，3年以上 AI 产品经验
2. 熟悉 LLM、NLP 等 AI 技术应用
3. 优秀的数据分析能力
4. 出色的跨部门沟通协调能力`,
  },
}

export default function CaseDetailPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin/cases"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">{caseData.candidateName}</h1>
            <Badge
              variant="secondary"
              className="bg-warning/10 text-warning border-0"
            >
              {caseData.statusLabel}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {caseData.currentTitle} → {caseData.targetDirection} → {caseData.targetRole}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出 PDF
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            继续处理
          </Button>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <InfoCard label="当前岗位" value={caseData.currentTitle} />
        <InfoCard label="目标方向" value={caseData.targetDirection} />
        <InfoCard label="目标岗位" value={caseData.targetRole} />
        <InfoCard
          label="联系方式"
          value={caseData.email}
          subValue={caseData.wechat}
        />
        <InfoCard label="创建时间" value={caseData.createdAt} />
        <InfoCard label="更新时间" value={caseData.updatedAt} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Documents */}
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">原始材料</CardTitle>
              <CardDescription>候选人提交的简历和目标 JD</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resume" className="w-full">
                <TabsList className="w-full justify-start mb-4 bg-muted/50">
                  <TabsTrigger value="resume">简历</TabsTrigger>
                  <TabsTrigger value="jd">目标 JD</TabsTrigger>
                  <TabsTrigger value="material">补充材料</TabsTrigger>
                  <TabsTrigger value="privacy">隐私说明</TabsTrigger>
                </TabsList>
                <TabsContent value="resume" className="mt-0">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1">
                      {documents.resume.fileName}
                    </span>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-4 max-h-[400px] overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                      {documents.resume.rawText}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="jd" className="mt-0">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 mb-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1">
                      {documents.jd.fileName}
                    </span>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-4 max-h-[400px] overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-muted-foreground">
                      {documents.jd.rawText}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="material" className="mt-0">
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>暂无补充材料</p>
                  </div>
                </TabsContent>
                <TabsContent value="privacy" className="mt-0">
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-sm text-muted-foreground">
                      {caseData.privacyNotes || "无特殊隐私说明"}
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Workflow */}
        <div>
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">工作流程</CardTitle>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>案例处理进度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {workflowSteps.map((step, index) => (
                  <div key={step.id}>
                    <div className="flex items-center gap-3 py-3">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                          step.status === "succeeded"
                            ? "bg-success text-success-foreground"
                            : step.status === "running"
                            ? "bg-warning text-warning-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.status === "succeeded" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : step.status === "running" ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Clock className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          step.status === "succeeded"
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </span>
                      {step.status === "pending" &&
                        index === workflowSteps.findIndex((s) => s.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-auto h-7 px-2 text-xs"
                          >
                            <Play className="h-3 w-3 mr-1" />
                            运行
                          </Button>
                        )}
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <div className="ml-3 h-2 w-px bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  label,
  value,
  subValue,
}: {
  label: string
  value: string
  subValue?: string
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
        {subValue && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {subValue}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
