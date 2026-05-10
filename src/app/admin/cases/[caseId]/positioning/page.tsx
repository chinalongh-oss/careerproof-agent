import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { notFound } from "next/navigation"
import { serviceClient } from "@/lib/supabase/service"
import { Target } from "lucide-react"

export default async function PositioningPage({
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
        <h1 className="text-2xl font-bold">职业定位</h1>
        <p className="text-muted-foreground mt-1">
          候选人：{c.candidate_name || caseId}
          {c.target_role && ` · 目标岗位：${c.target_role}`}
        </p>
      </div>
      <Card>
        <CardHeader>
          <Target className="h-8 w-8 text-muted-foreground mb-2" />
          <CardTitle>职业定位模块</CardTitle>
          <CardDescription>
            AI 分析候选人职业轨迹，生成职业指纹并推荐最佳定位策略与叙事角度。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <p className="mb-2">该模块将在后续开发步骤中实现</p>
            <p className="text-sm">AI 将评估候选人经历与职位描述的匹配度，推荐最佳定位方案。</p>
          </div>
          <Link href={`/admin/cases/${caseId}`}>
            <Button variant="outline">返回概览</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
