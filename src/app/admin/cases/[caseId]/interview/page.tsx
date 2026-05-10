import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { MessageSquare } from "lucide-react"

export default async function InterviewPage({
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
        <h1 className="text-2xl font-bold">面试准备</h1>
        <p className="text-muted-foreground mt-1">
          候选人：{c.candidate_name || caseId}
          {c.target_role && ` · 目标岗位：${c.target_role}`}
        </p>
      </div>
      <Card>
        <CardHeader>
          <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
          <CardTitle>面试准备模块</CardTitle>
          <CardDescription>
            基于职位描述和候选人证据卡，生成预测面试问题与话术要点。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <p className="mb-2">该模块将在后续开发步骤中实现</p>
            <p className="text-sm">AI 将生成行为面试和技术面试的预测问题及话术建议。</p>
          </div>
          <Link href={`/admin/cases/${caseId}`}>
            <Button variant="outline">返回概览</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
