import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { serviceClient } from "@/lib/supabase/service"
import { formatLocalDate } from "@/lib/utils"
import type { CaseStatus } from "@/lib/supabase/types"
import { Plus, Search, Filter } from "lucide-react"

const statusMap = {
  new_submitted: { label: "新提交", variant: "default" as const },
  parsed: { label: "已解析", variant: "secondary" as const },
  evidence_ready: { label: "证据卡就绪", variant: "secondary" as const },
  jd_ready: { label: "JD 已解析", variant: "secondary" as const },
  fingerprint_ready: { label: "指纹已生成", variant: "secondary" as const },
  positioning_ready: { label: "定位已生成", variant: "secondary" as const },
  outputs_ready: { label: "交付物已生成", variant: "secondary" as const },
  risk_reviewed: { label: "风险已审查", variant: "secondary" as const },
  interview_ready: { label: "面试包就绪", variant: "secondary" as const },
  delivered: { label: "已交付", variant: "secondary" as const },
  failed: { label: "失败", variant: "outline" as const },
} as const satisfies Record<CaseStatus, { label: string; variant: "default" | "secondary" | "outline" }>

export const dynamic = "force-dynamic"

export default async function AdminCasesPage() {
  const { data: cases, error } = await serviceClient
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">案例列表</h1>
          <p className="text-muted-foreground mt-1">
            管理和查看所有候选人职业凭证案例
          </p>
        </div>
        <Link href="/submit">
          <Button className="rounded-full px-5">
            <Plus className="h-4 w-4 mr-2" />
            新建案例
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索候选人姓名或邮箱..."
            className="pl-10 bg-background"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px] bg-background">
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="new_submitted">新提交</SelectItem>
            <SelectItem value="evidence_ready">证据卡就绪</SelectItem>
            <SelectItem value="positioning_ready">定位已生成</SelectItem>
            <SelectItem value="risk_reviewed">风险已审查</SelectItem>
            <SelectItem value="delivered">已交付</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" className="shrink-0">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/50 p-6 text-center">
          <p className="text-destructive font-semibold mb-1">案例列表查询失败</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      ) : !cases || cases.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-muted-foreground">
          <p className="mb-2">暂无案例</p>
          <p className="text-sm">
            <Link href="/submit" className="text-primary hover:underline">
              创建第一个案例
            </Link>
            开始使用。
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="px-6 py-4 font-medium">候选人</th>
                  <th className="px-6 py-4 font-medium">当前岗位</th>
                  <th className="px-6 py-4 font-medium">目标岗位</th>
                  <th className="px-6 py-4 font-medium">目标方向</th>
                  <th className="px-6 py-4 font-medium">状态</th>
                  <th className="px-6 py-4 font-medium">创建时间</th>
                  <th className="px-6 py-4 font-medium text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cases.map((c) => {
                  const st = statusMap[c.status as CaseStatus] ?? { label: c.status, variant: "outline" as const }
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/cases/${c.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {c.candidate_name || "未填写"}
                        </Link>
                        {c.email && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {c.email}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">{c.current_title || "-"}</td>
                      <td className="px-6 py-4 text-sm">{c.target_role || "-"}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {c.target_direction || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatLocalDate(c.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/admin/cases/${c.id}`}>
                          <Button variant="ghost" size="sm">
                            查看
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
