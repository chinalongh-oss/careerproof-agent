import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Shield,
  FileCheck,
  Target,
  AlertTriangle,
  MessageSquare,
  Download,
  CheckCircle2,
  Users,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-foreground" />
            <span className="text-lg font-semibold tracking-tight">CareerProof</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              功能特点
            </a>
            <a href="#process" className="text-muted-foreground hover:text-foreground transition-colors">
              工作流程
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              定价方案
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                后台登录
              </Button>
            </Link>
            <Link href="/submit">
              <Button size="sm" className="rounded-full px-5">
                开始使用 <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            MVP 内测中
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-balance mb-6">
            让每一段经历
            <br />
            <span className="text-muted-foreground">都有据可查</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
            面向中高阶候选人的 AI 职业证据工作台。自动拆解项目证据卡、生成职业指纹、
            定制一岗一版 PDF 简历，并提供风险审查与面试准备包。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/submit">
              <Button size="lg" className="rounded-full px-8 h-12 text-base">
                立即开始 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#process">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base">
                了解流程
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-border bg-card">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">95%</div>
              <div className="text-sm text-muted-foreground">PDF 导出成功率</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">80%</div>
              <div className="text-sm text-muted-foreground">高风险项识别率</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">3</div>
              <div className="text-sm text-muted-foreground">差异化定位方案</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">2-4h</div>
              <div className="text-sm text-muted-foreground">单案例交付时间</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">核心功能</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              不是单点润色简历，而是建立一套职业材料生成与审查流程
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FileCheck className="h-5 w-5" />}
              title="项目证据卡"
              description="AI 自动从简历拆解项目经历，提炼个人动作、团队动作与量化成果，建立可复用证据资产。"
            />
            <FeatureCard
              icon={<Target className="h-5 w-5" />}
              title="职业指纹与定位"
              description="分析职业轨迹，识别真实差异化优势，生成 3 个针对不同读者的定位方案。"
            />
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              title="一岗一版简历"
              description="根据目标 JD 和选定定位，生成适配度高的 PDF 简历，而非通用模板。"
            />
            <FeatureCard
              icon={<AlertTriangle className="h-5 w-5" />}
              title="风险审查"
              description="识别夸大表述、数据缺失、归因不清等 12 类风险，提供更安全的改写建议。"
            />
            <FeatureCard
              icon={<MessageSquare className="h-5 w-5" />}
              title="面试准备包"
              description="针对每个项目生成可能被追问的问题、回答结构、数据口径和边界说明。"
            />
            <FeatureCard
              icon={<Download className="h-5 w-5" />}
              title="可信交付包"
              description="PDF 简历 + 公开个人主页 + 风险审查报告 + 面试准备包，一站式交付。"
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 px-6 bg-card border-y border-border">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">工作流程</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              从材料提交到完整交付，每一步都有据可查
            </p>
          </div>
          <div className="space-y-0">
            <ProcessStep
              number="01"
              title="提交材料"
              description="上传旧简历、目标 JD 和项目补充材料，AI 自动解析并提取关键信息。"
              isFirst
            />
            <ProcessStep
              number="02"
              title="生成证据卡"
              description="将每个项目经历结构化为证据卡，明确个人贡献、团队协作和量化结果。"
            />
            <ProcessStep
              number="03"
              title="分析与定位"
              description="解析目标 JD，生成职业指纹，提供 3 个差异化定位方案供选择。"
            />
            <ProcessStep
              number="04"
              title="生成交付物"
              description="根据选定定位生成简历和个人主页，自动进行风险审查并提供面试准备包。"
            />
            <ProcessStep
              number="05"
              title="质量评审"
              description="对比新旧简历，客观评估改进效果，标记交付并导出最终 PDF。"
              isLast
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">定价方案</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              可售卖的不是 AI 改写，而是完整职业材料交付包
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              title="简历风险诊断"
              price="99-299"
              description="低门槛获客"
              features={["简历解析", "风险识别", "改进建议"]}
            />
            <PricingCard
              title="专业交付包"
              price="699-1,499"
              description="主推组合"
              features={[
                "一岗一版 PDF 简历",
                "可信个人主页",
                "风险审查报告",
                "面试准备包",
              ]}
              highlighted
            />
            <PricingCard
              title="人工辅导"
              price="699-1,499"
              description="高客单加购"
              features={["60 分钟一对一", "定位策略指导", "面试模拟演练"]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            开始构建你的职业证据
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            让散乱的经历变成清晰、可验证、可面试追问的职业证据资产
          </p>
          <Link href="/submit">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8 h-12 text-base"
            >
              立即开始 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">CareerProof Agent</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                隐私政策
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                服务条款
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                联系我们
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} CareerProof Agent
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="group p-6 rounded-lg border border-border bg-card hover:border-foreground/20 transition-colors">
      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

function ProcessStep({
  number,
  title,
  description,
  isFirst,
  isLast,
}: {
  number: string
  title: string
  description: string
  isFirst?: boolean
  isLast?: boolean
}) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div
          className={`w-px flex-1 ${isFirst ? "bg-transparent" : "bg-border"}`}
        />
        <div className="h-12 w-12 rounded-full border-2 border-foreground bg-background flex items-center justify-center text-sm font-bold shrink-0">
          {number}
        </div>
        <div
          className={`w-px flex-1 ${isLast ? "bg-transparent" : "bg-border"}`}
        />
      </div>
      <div className={`pb-12 ${isLast ? "pb-0" : ""} pt-2`}>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed max-w-md">
          {description}
        </p>
      </div>
    </div>
  )
}

function PricingCard({
  title,
  price,
  description,
  features,
  highlighted,
}: {
  title: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`p-6 rounded-lg border ${
        highlighted
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card"
      }`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p
          className={`text-sm ${
            highlighted ? "text-background/70" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </div>
      <div className="mb-6">
        <span className="text-3xl font-bold">¥{price}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle2
              className={`h-4 w-4 mt-0.5 shrink-0 ${
                highlighted ? "text-background/70" : "text-muted-foreground"
              }`}
            />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        className="w-full rounded-full"
        variant={highlighted ? "secondary" : "outline"}
      >
        选择方案
      </Button>
    </div>
  )
}
