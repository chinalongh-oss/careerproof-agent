import Link from "next/link"
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
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
} from "lucide-react"

// Mock cases data
const cases = [
  {
    id: "case-001",
    name: "张三",
    email: "zhangsan@example.com",
    currentTitle: "高级产品经理",
    targetRole: "AI 产品负责人",
    targetDirection: "AI 产品",
    status: "positioning_ready",
    statusLabel: "定位已生成",
    createdAt: "2026-05-14 10:30",
  },
  {
    id: "case-002",
    name: "李四",
    email: "lisi@example.com",
    currentTitle: "技术总监",
    targetRole: "CTO",
    targetDirection: "技术管理",
    status: "evidence_ready",
    statusLabel: "证据卡就绪",
    createdAt: "2026-05-13 14:20",
  },
  {
    id: "case-003",
    name: "王五",
    email: "wangwu@example.com",
    currentTitle: "运营经理",
    targetRole: "运营总监",
    targetDirection: "运营管理",
    status: "risk_reviewed",
    statusLabel: "风险已审查",
    createdAt: "2026-05-12 09:15",
  },
  {
    id: "case-004",
    name: "赵六",
    email: "zhaoliu@example.com",
    currentTitle: "数据分析师",
    targetRole: "数据产品经理",
    targetDirection: "数据产品",
    status: "delivered",
    statusLabel: "已交付",
    createdAt: "2026-05-11 16:45",
  },
  {
    id: "case-005",
    name: "钱七",
    email: "qianqi@example.com",
    currentTitle: "前端工程师",
    targetRole: "全栈工程师",
    targetDirection: "全栈开发",
    status: "new_submitted",
    statusLabel: "新提交",
    createdAt: "2026-05-10 11:00",
  },
]

const statusStyles: Record<string, string> = {
  new_submitted: "bg-muted text-muted-foreground",
  parsed: "bg-muted text-muted-foreground",
  evidence_ready: "bg-warning/10 text-warning",
  jd_ready: "bg-warning/10 text-warning",
  fingerprint_ready: "bg-warning/10 text-warning",
  positioning_ready: "bg-warning/10 text-warning",
  outputs_ready: "bg-success/10 text-success",
  risk_reviewed: "bg-success/10 text-success",
  interview_ready: "bg-success/10 text-success",
  delivered: "bg-foreground text-background",
  failed: "bg-destructive/10 text-destructive",
}

export default function AdminCasesPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Filters */}
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

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="text-left text-sm text-muted-foreground">
                <th className="px-6 py-4 font-medium">
                  <button className="flex items-center gap-1 hover:text-foreground">
                    候选人 <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium">当前岗位</th>
                <th className="px-6 py-4 font-medium">目标岗位</th>
                <th className="px-6 py-4 font-medium">目标方向</th>
                <th className="px-6 py-4 font-medium">状态</th>
                <th className="px-6 py-4 font-medium">
                  <button className="flex items-center gap-1 hover:text-foreground">
                    创建时间 <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cases.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/cases/${c.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {c.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.email}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm">{c.currentTitle}</td>
                  <td className="px-6 py-4 text-sm">{c.targetRole}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {c.targetDirection}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${
                        statusStyles[c.status] || statusStyles.new_submitted
                      }`}
                    >
                      {c.statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {c.createdAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/cases/${c.id}`}>
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            共 {cases.length} 条案例
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              上一页
            </Button>
            <Button variant="outline" size="sm" disabled>
              下一页
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
