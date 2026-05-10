import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PublicCasePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="text-xl font-bold">CareerProof</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>职业凭证主页</CardTitle>
            <CardDescription>
              你正在查看一份已分享的候选人职业凭证。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              凭证数据将通过分享链接在此加载。此页面展示职业凭证包的只读视图，
              包含项目证据卡、职业指纹和核心交付物。
            </p>
            <div className="mt-4">
              <Link href="/">
                <Button variant="outline">返回首页</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
