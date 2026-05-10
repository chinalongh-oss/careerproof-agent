import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, FolderOpen } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">工作台</h1>
        <p className="text-muted-foreground mt-1">
          CareerProof 助手活动概览。
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              全部案例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              处理中
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              已完成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>常用任务快速入口。</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Link href="/admin/cases">
            <Button variant="outline">
              <FolderOpen className="mr-2 h-4 w-4" />
              查看全部案例
            </Button>
          </Link>
          <Link href="/submit">
            <Button>
              <ArrowRight className="mr-2 h-4 w-4" />
              新建案例
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
