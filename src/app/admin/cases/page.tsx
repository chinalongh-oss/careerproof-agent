import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { serviceClient } from "@/lib/supabase/service"
import type { CaseStatus } from "@/lib/supabase/types"

const statusMap = {
  new_submitted: { label: "新提交", variant: "default" },
  parsed: { label: "已解析", variant: "secondary" },
  evidence_ready: { label: "证据卡就绪", variant: "secondary" },
  jd_ready: { label: "JD 已解析", variant: "secondary" },
  fingerprint_ready: { label: "指纹已生成", variant: "secondary" },
  positioning_ready: { label: "定位已生成", variant: "secondary" },
  outputs_ready: { label: "交付物已生成", variant: "secondary" },
  risk_reviewed: { label: "风险已审查", variant: "secondary" },
  interview_ready: { label: "面试包就绪", variant: "secondary" },
  delivered: { label: "已交付", variant: "secondary" },
  failed: { label: "失败", variant: "outline" },
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
          <h1 className="text-3xl font-bold">案例列表</h1>
          <p className="text-muted-foreground mt-1">
            管理和查看候选人职业凭证案例。
          </p>
        </div>
        <Link href="/submit">
          <Button>新建案例</Button>
        </Link>
      </div>

      <div className="rounded-lg border p-3 bg-muted/30 text-xs text-muted-foreground space-y-1">
        <p>
          查询结果：{error ? "失败" : `共 ${Array.isArray(cases) ? cases.length : 0} 条案例`}
        </p>
        {error && <p className="text-destructive">{error.message}</p>}
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-7 gap-4 p-4 text-sm font-medium text-muted-foreground border-b">
          <div>候选人</div>
          <div>当前岗位</div>
          <div>目标岗位</div>
          <div>目标方向</div>
          <div>状态</div>
          <div>创建时间</div>
          <div className="text-right">操作</div>
        </div>

        {error ? (
          <div className="p-12 text-center">
            <p className="text-destructive font-semibold mb-2">案例列表查询失败</p>
            <p className="text-sm text-muted-foreground mb-1">{error.message}</p>
            {error.code && <p className="text-xs text-muted-foreground">code: {error.code}</p>}
            {error.details && <p className="text-xs text-muted-foreground">details: {error.details}</p>}
            {error.hint && <p className="text-xs text-muted-foreground">hint: {error.hint}</p>}
          </div>
        ) : !cases || (Array.isArray(cases) && cases.length === 0) ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="mb-2">暂无案例</p>
            <p className="text-sm">
              <Link href="/submit" className="text-primary hover:underline">
                创建第一个案例
              </Link>
              开始使用。
            </p>
          </div>
        ) : (
          (Array.isArray(cases) ? cases : []).map((c) => {
            const st = statusMap[c.status as CaseStatus] ?? { label: c.status, variant: "outline" as const }
            return (
              <div
                key={c.id}
                className="grid grid-cols-7 gap-4 p-4 items-center border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <Link href={`/admin/cases/${c.id}`} className="font-medium hover:text-primary">
                    {c.candidate_name || "未填写"}
                  </Link>
                  {c.email && <p className="text-xs text-muted-foreground">{c.email}</p>}
                </div>
                <div className="text-sm truncate">{c.current_title || "-"}</div>
                <div className="text-sm truncate">{c.target_role || "-"}</div>
                <div className="text-sm truncate">{c.target_direction || "-"}</div>
                <div>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("zh-CN")}
                </div>
                <div className="text-right">
                  <Link href={`/admin/cases/${c.id}`}>
                    <Button variant="ghost" size="sm">
                      查看详情
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
