import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  Calendar,
  Building2,
  GraduationCap,
  Award,
  Briefcase,
  TrendingUp,
  Users,
  Target,
  CheckCircle2,
  Download,
  Share2,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

// 模拟公开简历数据
const profileData = {
  basic: {
    name: "张明",
    title: "产品总监",
    tagline: "10年互联网产品经验 | 增长与商业化专家",
    location: "北京",
    email: "zhangming@email.com",
    phone: "138****0000",
    linkedin: "linkedin.com/in/zhangming",
    website: "zhangming.dev",
  },
  summary: `拥有10年互联网产品管理经验，专注于用户增长和商业化领域。曾主导多款千万级用户产品的从0到1构建，累计用户增长超过2000万，营收贡献超1亿元。

擅长数据驱动的产品决策、跨部门协作和团队管理。在电商、SaaS、社交等多个领域有深度实践经验。`,
  highlights: [
    { icon: Users, label: "用户增长", value: "2000万+" },
    { icon: TrendingUp, label: "营收贡献", value: "1亿+" },
    { icon: Briefcase, label: "从业经验", value: "10年" },
    { icon: Target, label: "成功项目", value: "8个" },
  ],
  experience: [
    {
      id: 1,
      title: "产品VP",
      company: "某上市公司",
      period: "2022 - 至今",
      location: "北京",
      description: "负责公司核心产品线战略规划和团队管理",
      achievements: [
        "主导产品矩阵升级，年GMV增长150%",
        "搭建产品数据体系，建立从采集到决策的完整闭环",
        "管理30人产品团队，建立人才梯队培养机制",
        "推动AI能力集成，提升运营效率40%",
      ],
    },
    {
      id: 2,
      title: "产品总监",
      company: "某独角兽公司",
      period: "2019 - 2022",
      location: "北京",
      description: "负责商业化产品体系搭建和用户增长",
      achievements: [
        "主导商业化产品体系搭建，实现营收从0到5000万",
        "设计会员增值服务体系，付费转化率提升200%",
        "负责用户增长策略，DAU从100万增长到500万",
      ],
    },
    {
      id: 3,
      title: "高级产品经理",
      company: "某互联网大厂",
      period: "2017 - 2019",
      location: "北京",
      description: "负责核心功能模块的产品设计和迭代",
      achievements: [
        "主导核心功能重构，用户满意度提升25%",
        "设计增长实验体系，单月新增用户100万+",
      ],
    },
  ],
  education: [
    {
      school: "清华大学",
      degree: "硕士",
      major: "软件工程",
      period: "2013 - 2015",
    },
    {
      school: "北京理工大学",
      degree: "学士",
      major: "计算机科学",
      period: "2009 - 2013",
    },
  ],
  skills: [
    { category: "产品能力", items: ["产品策略", "用户研究", "数据分析", "竞品分析", "需求管理"] },
    { category: "管理能力", items: ["团队建设", "目标管理", "跨部门协作", "人才培养"] },
    { category: "技术理解", items: ["技术选型", "架构设计", "API设计", "性能优化"] },
    { category: "工具技能", items: ["Figma", "SQL", "Python", "Tableau", "Notion"] },
  ],
  certifications: [
    { name: "PMP 项目管理认证", issuer: "PMI", year: "2020" },
    { name: "产品经理认证", issuer: "起点学院", year: "2018" },
  ],
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">CP</span>
            </div>
            <span className="font-semibold">CareerProof</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              分享
            </Button>
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              下载简历
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* 左侧：基本信息 */}
          <div className="space-y-6">
            {/* 头像和基本信息 */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                    {profileData.basic.name.charAt(0)}
                  </div>
                  <h1 className="text-2xl font-bold">{profileData.basic.name}</h1>
                  <p className="text-muted-foreground">{profileData.basic.title}</p>
                  <Badge variant="secondary" className="mt-2">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    已验证
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.basic.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.basic.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profileData.basic.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                    <a href="#" className="text-primary hover:underline">
                      {profileData.basic.linkedin}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href="#" className="text-primary hover:underline">
                      {profileData.basic.website}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 亮点数据 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">职业亮点</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {profileData.highlights.map((item, index) => (
                    <div key={index} className="text-center p-3 rounded-lg bg-muted/50">
                      <item.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
                      <div className="text-lg font-bold">{item.value}</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 技能 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">专业技能</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileData.skills.map((group) => (
                  <div key={group.category}>
                    <div className="text-sm font-medium mb-2">{group.category}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((skill) => (
                        <Badge key={skill} variant="secondary" className="font-normal">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 认证 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  认证证书
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{cert.name}</div>
                      <div className="text-xs text-muted-foreground">{cert.issuer}</div>
                    </div>
                    <Badge variant="outline">{cert.year}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：详细内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 个人简介 */}
            <Card>
              <CardHeader>
                <CardTitle>个人简介</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {profileData.summary}
                </p>
              </CardContent>
            </Card>

            {/* 工作经历 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  工作经历
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-8">
                    {profileData.experience.map((exp) => (
                      <div key={exp.id} className="relative pl-8">
                        <div className="absolute left-1 top-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{exp.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="h-3.5 w-3.5" />
                              <span>{exp.company}</span>
                              <span>·</span>
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{exp.location}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            <Calendar className="mr-1 h-3 w-3" />
                            {exp.period}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>
                        <ul className="space-y-1.5">
                          {exp.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 教育背景 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  教育背景
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.education.map((edu, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{edu.school}</div>
                        <div className="text-sm text-muted-foreground">
                          {edu.degree} · {edu.major}
                        </div>
                      </div>
                      <Badge variant="outline">{edu.period}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1">对这位候选人感兴趣？</h3>
                    <p className="text-sm text-muted-foreground">
                      下载完整简历或直接联系候选人
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      发送消息
                    </Button>
                    <Button>
                      <Download className="mr-2 h-4 w-4" />
                      下载简历
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>由</span>
              <Link href="/" className="text-primary hover:underline">
                CareerProof Agent
              </Link>
              <span>生成</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:underline">
                隐私政策
              </Link>
              <Link href="/terms" className="hover:underline">
                使用条款
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
