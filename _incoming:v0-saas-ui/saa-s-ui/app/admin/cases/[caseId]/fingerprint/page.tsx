"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Fingerprint,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Brain,
  ChevronRight,
  Download,
  RefreshCw,
} from "lucide-react"

// 模拟职业指纹数据
const fingerprintData = {
  coreIdentity: {
    title: "增长型产品负责人",
    subtitle: "从0到1 + 规模化增长",
    confidence: 92,
  },
  dimensions: [
    {
      name: "产品策略",
      score: 88,
      keywords: ["商业模式设计", "市场定位", "竞品分析", "产品路线图"],
    },
    {
      name: "增长能力",
      score: 95,
      keywords: ["用户增长", "留存优化", "转化率提升", "病毒传播"],
    },
    {
      name: "数据驱动",
      score: 85,
      keywords: ["数据分析", "A/B测试", "指标体系", "归因分析"],
    },
    {
      name: "团队管理",
      score: 78,
      keywords: ["跨部门协作", "团队建设", "目标管理", "人才培养"],
    },
    {
      name: "技术理解",
      score: 72,
      keywords: ["技术选型", "架构设计", "API设计", "性能优化"],
    },
  ],
  uniqueStrengths: [
    {
      title: "从0到1产品构建",
      description: "3次成功从零开始构建产品并实现盈利",
      evidenceCount: 5,
    },
    {
      title: "用户增长专家",
      description: "累计负责产品用户增长超过2000万",
      evidenceCount: 8,
    },
    {
      title: "商业化能力",
      description: "主导多个产品的商业化，累计创造营收超1亿",
      evidenceCount: 4,
    },
  ],
  careerTrajectory: [
    { year: "2015-2017", role: "产品经理", company: "初创公司A", focus: "B端SaaS" },
    { year: "2017-2019", role: "高级产品经理", company: "互联网公司B", focus: "用户增长" },
    { year: "2019-2022", role: "产品总监", company: "独角兽C", focus: "商业化" },
    { year: "2022-至今", role: "产品VP", company: "上市公司D", focus: "平台战略" },
  ],
  industryExperience: [
    { industry: "电商", years: 4, depth: "深度" },
    { industry: "SaaS", years: 3, depth: "深度" },
    { industry: "社交", years: 2, depth: "中度" },
    { industry: "金融科技", years: 1, depth: "浅度" },
  ],
}

export default function FingerprintPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">职业指纹</h1>
          <p className="text-muted-foreground mt-1">
            基于证据卡自动提取的职业特征图谱
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
            重新生成
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出报告
          </Button>
        </div>
      </div>

      {/* Core Identity Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Fingerprint className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{fingerprintData.coreIdentity.title}</h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI 生成
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  {fingerprintData.coreIdentity.subtitle}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {fingerprintData.coreIdentity.confidence}%
              </div>
              <div className="text-sm text-muted-foreground">匹配置信度</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="dimensions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dimensions">能力维度</TabsTrigger>
          <TabsTrigger value="strengths">核心优势</TabsTrigger>
          <TabsTrigger value="trajectory">职业轨迹</TabsTrigger>
          <TabsTrigger value="industry">行业经验</TabsTrigger>
        </TabsList>

        {/* 能力维度 */}
        <TabsContent value="dimensions" className="space-y-4">
          <div className="grid gap-4">
            {fingerprintData.dimensions.map((dim) => (
              <Card key={dim.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{dim.name}</span>
                    </div>
                    <span className="text-2xl font-bold">{dim.score}</span>
                  </div>
                  <Progress value={dim.score} className="h-2 mb-3" />
                  <div className="flex flex-wrap gap-2">
                    {dim.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="font-normal">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 核心优势 */}
        <TabsContent value="strengths" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {fingerprintData.uniqueStrengths.map((strength, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className="absolute top-0 right-0 h-20 w-20 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5" />
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{strength.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{strength.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{strength.evidenceCount} 个证据支撑</Badge>
                    <Button variant="ghost" size="sm">
                      查看详情
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 职业轨迹 */}
        <TabsContent value="trajectory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                职业发展轨迹
              </CardTitle>
              <CardDescription>基于证据卡自动提取的职业历程</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {fingerprintData.careerTrajectory.map((item, index) => (
                    <div key={index} className="relative pl-10">
                      <div className="absolute left-2 top-1.5 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{item.role}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.company} · {item.focus}
                          </div>
                        </div>
                        <Badge variant="outline">{item.year}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 行业经验 */}
        <TabsContent value="industry">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                行业经验分布
              </CardTitle>
              <CardDescription>跨行业经验积累与深度</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fingerprintData.industryExperience.map((item) => (
                  <div key={item.industry} className="flex items-center gap-4">
                    <div className="w-24 font-medium">{item.industry}</div>
                    <div className="flex-1">
                      <Progress value={item.years * 25} className="h-3" />
                    </div>
                    <div className="w-20 text-right text-sm text-muted-foreground">
                      {item.years} 年
                    </div>
                    <Badge
                      variant={
                        item.depth === "深度"
                          ? "default"
                          : item.depth === "中度"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {item.depth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI 洞察 */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 职业洞察
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="font-medium">最佳匹配岗位</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 产品VP / 产品总监</li>
                <li>• 增长负责人</li>
                <li>• 业务线负责人</li>
              </ul>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">推荐发展方向</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 深化技术理解能力</li>
                <li>• 拓展海外市场经验</li>
                <li>• 强化团队管理体系</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
