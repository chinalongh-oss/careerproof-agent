"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Download,
  Eye,
  Settings2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Printer,
  Share2,
  RefreshCw,
  LayoutTemplate,
  Palette,
} from "lucide-react"

// 模拟简历版本数据
const resumeVersions = [
  {
    id: "v1",
    name: "字节跳动-产品总监",
    jdMatch: 92,
    status: "已生成",
    generatedAt: "2024-01-15 14:30",
    pages: 2,
  },
  {
    id: "v2",
    name: "腾讯-高级产品经理",
    jdMatch: 88,
    status: "已生成",
    generatedAt: "2024-01-14 10:15",
    pages: 2,
  },
  {
    id: "v3",
    name: "阿里-业务负责人",
    jdMatch: 85,
    status: "生成中",
    generatedAt: "-",
    pages: 0,
  },
]

const templates = [
  { id: "professional", name: "专业简约", description: "适合大厂和外企" },
  { id: "creative", name: "创意设计", description: "适合创意和设计岗位" },
  { id: "academic", name: "学术风格", description: "适合研究和教育岗位" },
  { id: "executive", name: "高管风格", description: "适合高层管理岗位" },
]

export default function ResumePage() {
  const [selectedVersion, setSelectedVersion] = useState(resumeVersions[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [settings, setSettings] = useState({
    template: "professional",
    includePhoto: false,
    detailLevel: 70,
    emphasisGrowth: true,
    emphasisLeadership: true,
    emphasisTechnical: false,
  })

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">简历生成</h1>
          <p className="text-muted-foreground mt-1">
            基于 JD 和证据卡自动生成一岗一版定制简历
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              生成新版本
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左侧：版本列表和设置 */}
        <div className="space-y-6">
          {/* 简历版本 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">简历版本</CardTitle>
              <CardDescription>选择或生成新的简历版本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resumeVersions.map((version) => (
                <div
                  key={version.id}
                  className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                    selectedVersion.id === version.id
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{version.name}</span>
                    <Badge
                      variant={version.status === "已生成" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {version.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>JD 匹配度 {version.jdMatch}%</span>
                    {version.pages > 0 && <span>{version.pages} 页</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 生成设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                生成设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 模板选择 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4" />
                  简历模板
                </Label>
                <Select
                  value={settings.template}
                  onValueChange={(v) => setSettings({ ...settings, template: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div>
                          <div>{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 详细程度 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>详细程度</Label>
                  <span className="text-sm text-muted-foreground">{settings.detailLevel}%</span>
                </div>
                <Slider
                  value={[settings.detailLevel]}
                  onValueChange={([v]) => setSettings({ ...settings, detailLevel: v })}
                  max={100}
                  step={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>精简</span>
                  <span>详细</span>
                </div>
              </div>

              {/* 开关选项 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="photo">包含照片</Label>
                  <Switch
                    id="photo"
                    checked={settings.includePhoto}
                    onCheckedChange={(v) => setSettings({ ...settings, includePhoto: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="growth">强调增长能力</Label>
                  <Switch
                    id="growth"
                    checked={settings.emphasisGrowth}
                    onCheckedChange={(v) => setSettings({ ...settings, emphasisGrowth: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="leadership">强调管理经验</Label>
                  <Switch
                    id="leadership"
                    checked={settings.emphasisLeadership}
                    onCheckedChange={(v) => setSettings({ ...settings, emphasisLeadership: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="technical">强调技术能力</Label>
                  <Switch
                    id="technical"
                    checked={settings.emphasisTechnical}
                    onCheckedChange={(v) => setSettings({ ...settings, emphasisTechnical: v })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：简历预览 */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {selectedVersion.name}
                  </CardTitle>
                  <CardDescription>生成时间：{selectedVersion.generatedAt}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    预览
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    打印
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="mr-2 h-4 w-4" />
                    分享
                  </Button>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    下载 PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 简历预览区域 */}
              <div className="rounded-lg border bg-white p-8 min-h-[600px] shadow-sm">
                {/* 简历头部 */}
                <div className="border-b pb-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">张明</h2>
                  <p className="text-gray-600 mt-1">产品总监 | 10年互联网产品经验</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>北京</span>
                    <span>•</span>
                    <span>zhangming@email.com</span>
                    <span>•</span>
                    <span>138-0000-0000</span>
                  </div>
                </div>

                {/* 个人简介 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">个人简介</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    10年互联网产品经验，专注于用户增长和商业化领域。曾主导多款千万级用户产品的从0到1构建，
                    累计用户增长超过2000万，营收贡献超1亿元。擅长数据驱动的产品决策和跨部门协作。
                  </p>
                </div>

                {/* 工作经历 */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">工作经历</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">产品VP</span>
                          <span className="text-gray-500 ml-2">某上市公司</span>
                        </div>
                        <span className="text-sm text-gray-500">2022 - 至今</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• 负责公司核心产品线战略规划，年GMV增长150%</li>
                        <li>• 搭建产品数据体系，建立从采集到决策的闭环</li>
                        <li>• 管理30人产品团队，建立人才梯队培养机制</li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">产品总监</span>
                          <span className="text-gray-500 ml-2">某独角兽公司</span>
                        </div>
                        <span className="text-sm text-gray-500">2019 - 2022</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                        <li>• 主导商业化产品体系搭建，实现营收从0到5000万</li>
                        <li>• 设计会员增值服务体系，付费转化率提升200%</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* JD 匹配度指示 */}
                <div className="mt-8 pt-4 border-t border-dashed">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-gray-600">
                      JD 关键词匹配度：<span className="font-medium text-gray-900">{selectedVersion.jdMatch}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 匹配分析 */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">已匹配的 JD 要求</span>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 10年以上产品经验</li>
                    <li>• 大型团队管理经验</li>
                    <li>• 用户增长背景</li>
                    <li>• 商业化能力</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-sm">建议补充的内容</span>
                  </div>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 海外市场经验</li>
                    <li>• AI/ML 产品背景</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
