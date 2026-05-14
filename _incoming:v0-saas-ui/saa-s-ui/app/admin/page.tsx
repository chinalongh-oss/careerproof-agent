import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  FolderOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react"

// Mock data for dashboard
const stats = [
  { label: "总案例数", value: "24", icon: FolderOpen, change: "+3 本周" },
  { label: "待处理", value: "8", icon: Clock, change: "需关注" },
  { label: "风险项", value: "12", icon: AlertTriangle, change: "-2 较上周" },
  { label: "已交付", value: "16", icon: CheckCircle2, change: "66.7%" },
]

const recentCases = [
  {
    id: "1",
    name: "张三",
    currentTitle: "高级产品经理",
    targetRole: "AI 产品负责人",
    status: "positioning_ready",
    statusLabel: "定位已生成",
    createdAt: "2026-05-14",
  },
  {
    id: "2",
    name: "李四",
    currentTitle: "技术总监",
    targetRole: "CTO",
    status: "evidence_ready",
    statusLabel: "证据卡就绪",
    createdAt: "2026-05-13",
  },
  {
    id: "3",
    name: "王五",
    currentTitle: "运营经理",
    targetRole: "运营总监",
    status: "risk_reviewed",
    statusLabel: "风险已审查",
    createdAt: "2026-05-12",
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground mt-1">
            欢迎回来，这是您的工作台概览
          </p>
        </div>
        <Link href="/submit">
          <Button className="rounded-full px-5">
            <Plus className="h-4 w-4 mr-2" />
            新建案例
          </Button>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent cases */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg">最近案例</CardTitle>
            <CardDescription>最近提交和更新的案例</CardDescription>
          </div>
          <Link href="/admin/cases">
            <Button variant="ghost" size="sm">
              查看全部 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/admin/cases/${c.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {c.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.currentTitle} → {c.targetRole}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full ${
                      c.status === "risk_reviewed"
                        ? "bg-success/10 text-success"
                        : c.status === "positioning_ready"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {c.statusLabel}
                  </span>
                  <span className="text-sm text-muted-foreground">{c.createdAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border hover:border-foreground/20 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">批量导出</h3>
              <p className="text-sm text-muted-foreground">导出已完成的案例 PDF</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border hover:border-foreground/20 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">数据报告</h3>
              <p className="text-sm text-muted-foreground">查看交付统计和质量分析</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border hover:border-foreground/20 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">风险概览</h3>
              <p className="text-sm text-muted-foreground">查看所有待处理的风险项</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
