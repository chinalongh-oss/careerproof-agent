import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Target,
  Briefcase,
  GraduationCap,
} from "lucide-react"

// Mock JD analysis data
const jdAnalysis = {
  roleName: "AI 产品负责人",
  companyType: "B2B SaaS / AI 创业公司",
  seniorityLevel: "高级管理层",
  coreResponsibilities: [
    "负责 AI 产品的整体规划和路线图制定",
    "深入理解业务需求，定义产品方向和优先级",
    "与技术团队紧密合作，推动产品迭代",
    "建立产品度量体系，持续优化产品体验",
  ],
  requiredSkills: {
    硬技能: ["AI/ML 产品设计经验", "数据分析能力", "技术方案评估"],
    软技能: ["跨部门协调", "战略思维", "团队管理"],
  },
  hiddenRequirements: [
    "可能需要频繁与算法团队沟通，对 LLM 有基本理解",
    "暗示需要有 0-1 产品经验",
    "重视数据驱动决策能力",
  ],
  keywords: ["AI 产品", "LLM", "产品规划", "路线图", "数据分析", "跨部门"],
  interviewFocus: {
    技术理解: "考察对 AI/LLM 技术的理解深度",
    产品方法论: "STAR 方法询问具体项目经验",
    战略思维: "可能有 Case Study 环节",
  },
  resumeStrategy: {
    突出: ["AI 相关项目经验", "数据驱动成果", "跨部门协作案例"],
    弱化: ["非 AI 相关的运营类工作", "纯执行类项目"],
  },
  recommendedProjectTypes: ["AI/ML 产品从 0-1", "数据驱动增长", "跨部门协作项目"],
  notRecommendedProjectTypes: ["纯运营活动", "UI 改版类项目", "流程优化类项目"],
}

export default function JDPage() {
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
            <h1 className="text-2xl font-bold">JD 解析</h1>
          </div>
          <p className="text-muted-foreground">张三 · 目标岗位分析结果</p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          重新解析
        </Button>
      </div>

      {/* Role overview */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            岗位概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">岗位名称</p>
              <p className="font-semibold text-lg">{jdAnalysis.roleName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">公司类型</p>
              <p className="font-medium">{jdAnalysis.companyType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">资历要求</p>
              <Badge variant="secondary" className="font-medium">
                {jdAnalysis.seniorityLevel}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core responsibilities */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              核心职责
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {jdAnalysis.coreResponsibilities.map((resp, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="h-5 w-5 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  {resp}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Required skills */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              技能要求
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(jdAnalysis.requiredSkills).map(([category, skills]) => (
              <div key={category}>
                <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <Badge key={i} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hidden requirements */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            隐性要求
          </CardTitle>
          <CardDescription>JD 中未明确写出但可能存在的要求</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {jdAnalysis.hiddenRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2 shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">关键词提取</CardTitle>
          <CardDescription>简历中应体现的核心关键词</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {jdAnalysis.keywords.map((keyword, i) => (
              <Badge key={i} className="bg-foreground text-background px-3 py-1">
                {keyword}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resume strategy */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">简历策略建议</CardTitle>
          <CardDescription>针对此 JD 的简历优化建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                建议突出
              </p>
              <ul className="space-y-2">
                {jdAnalysis.resumeStrategy.突出.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-success">+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                建议弱化
              </p>
              <ul className="space-y-2">
                {jdAnalysis.resumeStrategy.弱化.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2 text-muted-foreground">
                    <span>-</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview focus */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">面试关注点</CardTitle>
          <CardDescription>基于 JD 分析的面试重点预测</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(jdAnalysis.interviewFocus).map(([focus, detail]) => (
              <div key={focus} className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-medium mb-1">{focus}</p>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
