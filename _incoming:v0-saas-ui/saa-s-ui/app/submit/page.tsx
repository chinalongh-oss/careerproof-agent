"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  Mail,
  User,
  MessageSquare,
} from "lucide-react"

const ALLOWED_TYPES = ".pdf,.docx,.txt,.md"
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt", "md"])

function isAllowedFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  return ALLOWED_EXTENSIONS.has(ext)
}

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jdFile, setJdFile] = useState<File | null>(null)
  const [materialFile, setMaterialFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!resumeFile) {
      setError("请上传简历文件")
      return
    }

    setIsSubmitting(true)

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 py-20 max-w-xl">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold mb-2">提交成功</h1>
            <p className="text-muted-foreground mb-8">
              我们已收到您的材料，运营团队将在 24 小时内开始处理您的案例。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/">
                <Button variant="outline" className="rounded-full px-6">
                  返回首页
                </Button>
              </Link>
              <Button
                className="rounded-full px-6"
                onClick={() => {
                  setSubmitted(false)
                  setResumeFile(null)
                  setJdFile(null)
                  setMaterialFile(null)
                }}
              >
                提交新案例
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </Link>

        {/* Page title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">提交案例</h1>
          <p className="text-muted-foreground">
            填写候选人信息并上传相关材料，AI 将分析并生成职业证据包。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Card */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-4 w-4" />
                基本信息
              </CardTitle>
              <CardDescription>候选人的联系方式和职业背景</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate_name">
                    姓名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="candidate_name"
                    name="candidate_name"
                    placeholder="张三"
                    required
                    disabled={isSubmitting}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="zhangsan@example.com"
                      disabled={isSubmitting}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wechat">微信</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="wechat"
                      name="wechat"
                      placeholder="微信号"
                      disabled={isSubmitting}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_title">当前岗位</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="current_title"
                      name="current_title"
                      placeholder="高级产品经理"
                      disabled={isSubmitting}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_direction">目标方向</Label>
                  <Input
                    id="target_direction"
                    name="target_direction"
                    placeholder="AI 产品 / 数据产品"
                    disabled={isSubmitting}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_role">目标岗位</Label>
                  <Input
                    id="target_role"
                    name="target_role"
                    placeholder="AI 产品负责人"
                    disabled={isSubmitting}
                    className="bg-background"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Materials Card */}
          <Card className="border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                材料上传
              </CardTitle>
              <CardDescription>
                上传旧简历、目标 JD 和补充材料，支持 PDF / DOCX / TXT / MD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadField
                id="resume_file"
                label="旧简历"
                description="必填，上传您当前使用的简历"
                required
                disabled={isSubmitting}
                selectedFile={resumeFile}
                onSelect={setResumeFile}
                onClear={() => setResumeFile(null)}
              />
              <FileUploadField
                id="jd_file"
                label="目标 JD"
                description="建议填写，上传目标职位的招聘描述"
                disabled={isSubmitting}
                selectedFile={jdFile}
                onSelect={setJdFile}
                onClear={() => setJdFile(null)}
              />
              <FileUploadField
                id="material_file"
                label="项目补充材料"
                description="可选，如项目文档、业绩数据、获奖信息等"
                disabled={isSubmitting}
                selectedFile={materialFile}
                onSelect={setMaterialFile}
                onClear={() => setMaterialFile(null)}
              />
              <div className="space-y-2">
                <Label htmlFor="privacy_notes">隐私与敏感信息说明</Label>
                <Textarea
                  id="privacy_notes"
                  name="privacy_notes"
                  placeholder="如有需要脱敏或特殊处理的信息，请在此说明..."
                  className="min-h-[100px] bg-background resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <X className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex items-center gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="rounded-full px-8"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "正在提交..." : "提交案例"}
            </Button>
            <Link href="/">
              <Button
                variant="ghost"
                size="lg"
                type="button"
                disabled={isSubmitting}
              >
                取消
              </Button>
            </Link>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-12 p-6 rounded-lg bg-muted/50 border border-border">
          <h3 className="font-semibold mb-3">提交建议</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" />
              简历建议使用可复制文本的 PDF 或 DOCX 格式，扫描件可能无法正确解析
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" />
              目标 JD 越详细，生成的简历适配度越高
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" />
              补充材料可包含项目复盘、数据报告等，有助于提炼更精准的证据
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <span className="text-lg font-semibold">CareerProof</span>
        </Link>
      </div>
    </header>
  )
}

function FileUploadField({
  id,
  label,
  description,
  required,
  disabled,
  selectedFile,
  onSelect,
  onClear,
}: {
  id: string
  label: string
  description: string
  required?: boolean
  disabled: boolean
  selectedFile: File | null
  onSelect: (file: File | null) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file && !isAllowedFile(file)) {
      onSelect(null)
      if (inputRef.current) inputRef.current.value = ""
      return
    }
    onSelect(file)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      {selectedFile ? (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            disabled={disabled}
            onClick={() => {
              onClear()
              if (inputRef.current) inputRef.current.value = ""
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-border bg-muted/20 cursor-pointer hover:bg-muted/40 hover:border-muted-foreground/30 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">点击上传文件</p>
          <p className="text-xs text-muted-foreground">
            支持 PDF / DOCX / TXT / MD
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        accept={ALLOWED_TYPES}
        className="hidden"
        disabled={disabled}
        onChange={handleFileChange}
      />
    </div>
  )
}
