import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { Layout } from "lucide-react"

export default async function OutputsPage({
  params,
}: {
  params: Promise<{ caseId: string }>
}) {
  const { caseId } = await params
  const { data } = await serviceClient
    .from("cases")
    .select("candidate_name,target_role")
    .eq("id", caseId)
    .single()

  if (!data) notFound()
  const c = data

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">交付物</h1>
        <p className="text-muted-foreground mt-1">
          候选人：{c.candidate_name || caseId}
          {c.target_role && ` · 目标岗位：${c.target_role}`}
        </p>
      </div>
      <Card>
        <CardHeader>
          <Layout className="h-8 w-8 text-muted-foreground mb-2" />
          <CardTitle>交付物模块</CardTitle>
          <CardDescription>
            生成定制 PDF 简历、求职信、面试准备指南等一岗一版交付物。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <p className="mb-2">该模块将在后续开发步骤中实现</p>
            <p className="text-sm">AI 将根据职业定位和证据卡自动生成各类文档和材料。</p>
          </div>
          <Link href={`/admin/cases/${caseId}`}>
            <Button variant="outline">返回概览</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
