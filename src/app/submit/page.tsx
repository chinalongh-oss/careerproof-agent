"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitCaseAction } from "./actions"
import { Loader2 } from "lucide-react"

export default function SubmitPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await submitCaseAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="text-xl font-bold">CareerProof</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">提交案例</h1>
          <p className="text-muted-foreground mt-2">
            填写候选人信息和材料，AI 助手将分析并生成职业凭证包。
          </p>
        </div>

        <form action={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>候选人的联系方式和职业背景。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate_name">姓名 *</Label>
                  <Input
                    id="candidate_name"
                    name="candidate_name"
                    placeholder="张三"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="zhangsan@example.com"
                    disabled={isPending}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wechat">微信</Label>
                  <Input
                    id="wechat"
                    name="wechat"
                    placeholder="微信号"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_title">当前岗位</Label>
                  <Input
                    id="current_title"
                    name="current_title"
                    placeholder="高级前端工程师"
                    disabled={isPending}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_direction">目标方向</Label>
                  <Input
                    id="target_direction"
                    name="target_direction"
                    placeholder="技术管理 / 架构师"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_role">目标岗位</Label>
                  <Input
                    id="target_role"
                    name="target_role"
                    placeholder="前端技术负责人"
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>材料信息</CardTitle>
              <CardDescription>提交旧简历和目标职位的详细描述。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resume_text">旧简历文本 *</Label>
                <Textarea
                  id="resume_text"
                  name="resume_text"
                  placeholder="请在此粘贴你的完整简历内容..."
                  className="min-h-[200px]"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="raw_jd">目标 JD</Label>
                <Textarea
                  id="raw_jd"
                  name="raw_jd"
                  placeholder="请在此粘贴目标职位的完整 JD..."
                  className="min-h-[160px]"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_material">项目补充材料</Label>
                <Textarea
                  id="project_material"
                  name="project_material"
                  placeholder="可以补充项目文档、业绩数据、获奖信息等..."
                  className="min-h-[120px]"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio_links">作品链接</Label>
                <Input
                  id="portfolio_links"
                  name="portfolio_links"
                  placeholder="GitHub / 个人主页 / 作品集链接"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="privacy_notes">隐私与敏感信息说明</Label>
                <Textarea
                  id="privacy_notes"
                  name="privacy_notes"
                  placeholder="如有需要脱敏或标记的信息，请在此说明..."
                  className="min-h-[80px]"
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="mt-4 p-4 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <Button type="submit" disabled={isPending} size="lg">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "正在提交..." : "提交案例"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg" type="button" disabled={isPending}>
                取消
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
