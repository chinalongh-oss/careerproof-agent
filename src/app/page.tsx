import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Shield, FileText, Target, Briefcase } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CareerProof</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/submit">
              <Button>开始使用</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <Badge className="mb-4" variant="secondary">MVP 内测</Badge>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            让每一段经历，都有据可查
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            面向中高阶候选人的 AI 职业证据工作台。提交简历与目标 JD，
            自动拆解项目证据卡、生成职业指纹、定制一岗一版 PDF 简历，
            并提供风险审查与面试准备包。
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/submit">
              <Button size="lg">
                立即开始 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" size="lg">
                后台管理
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle>项目证据卡</CardTitle>
                <CardDescription>
                  提交简历与 JD，AI 自动拆解你的项目经历为结构化证据卡，
                  提炼个人动作、团队动作与量化成果。
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>职业指纹与定位</CardTitle>
                <CardDescription>
                  AI 分析你的职业轨迹，生成职业指纹，并针对目标岗位
                  推荐最佳定位策略与叙事角度。
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Briefcase className="h-8 w-8 text-primary mb-2" />
                <CardTitle>一岗一版交付包</CardTitle>
                <CardDescription>
                  自动生成定制 PDF 简历、可信个人主页、风险审查报告
                  和面试准备包，一站交付。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          &copy; {new Date().getFullYear()} CareerProof Agent 版权所有
        </div>
      </footer>
    </div>
  )
}
