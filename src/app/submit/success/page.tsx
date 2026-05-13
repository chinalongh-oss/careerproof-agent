"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const caseId = searchParams.get("caseId")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="text-xl font-bold">CareerProof</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-xl flex items-center justify-center">
        <Card className="w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>提交成功！</CardTitle>
            <CardDescription>
              你的资料已进入 CareerProof Agent 工作台。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">已接收</Badge>
              <Badge variant="secondary">待处理</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              AI 助手将尽快分析你的材料并生成职业凭证包。
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Link href="/">
                <Button variant="outline">返回首页</Button>
              </Link>
              {caseId ? (
                <Link href={`/admin/cases/${caseId}`}>
                  <Button>查看案例</Button>
                </Link>
              ) : (
                <Link href="/admin/cases">
                  <Button>查看案例列表</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function SubmitSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
