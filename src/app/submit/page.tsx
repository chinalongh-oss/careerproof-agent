"use client"

import { useState, useTransition, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitCaseAction } from "./actions"
import { Loader2, FileText, Upload, X } from "lucide-react"

const ALLOWED_TYPES = ".pdf,.docx,.txt,.md"
const ALLOWED_EXTENSIONS = new Set(["pdf", "docx", "txt", "md"])

function isAllowedFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  return ALLOWED_EXTENSIONS.has(ext)
}

function FileInputCard({
  id,
  label,
  description,
  required,
  disabled,
  accept,
  selectedName,
  onSelect,
  onClear,
}: {
  id: string
  label: string
  description: string
  required?: boolean
  disabled: boolean
  accept: string
  selectedName: string | null
  onSelect: (file: File | null) => void
  onClear: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && " *"}
      </Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      {selectedName ? (
        <div className="flex items-center gap-2 border rounded-md p-2 bg-muted/30">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm truncate flex-1">{selectedName}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            disabled={disabled}
            onClick={() => {
              onClear()
              if (inputRef.current) inputRef.current.value = ""
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <div
          className="flex items-center justify-center border-2 border-dashed rounded-md p-6 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <div className="text-center">
            <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">点击上传文件</p>
            <p className="text-xs text-muted-foreground mt-0.5">支持 PDF / DOCX / TXT / MD</p>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        name={id}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          if (file && !isAllowedFile(file)) {
            onSelect(null)
            if (inputRef.current) inputRef.current.value = ""
            return
          }
          onSelect(file)
        }}
      />
    </div>
  )
}

export default function SubmitPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jdFile, setJdFile] = useState<File | null>(null)
  const [materialFile, setMaterialFile] = useState<File | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)

    if (!resumeFile) {
      setError("请上传简历文件")
      return
    }

    formData.set("resume_file", resumeFile)
    if (jdFile) formData.set("jd_file", jdFile)
    if (materialFile) formData.set("material_file", materialFile)

    startTransition(async () => {
      const result = await submitCaseAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="text-xl font-bold">CareerProof</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">提交案例</h1>
          <p className="text-muted-foreground mt-2">
            填写候选人信息和材料，AI 助手将分析并生成职业凭证包。
          </p>
        </div>

        <form action={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>候选人的联系方式和职业背景。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate_name">姓名 *</Label>
                  <Input
                    id="candidate_name"
                    name="candidate_name"
                    placeholder="张三"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="zhangsan@example.com"
                    disabled={isPending}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wechat">微信</Label>
                  <Input
                    id="wechat"
                    name="wechat"
                    placeholder="微信号"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_title">当前岗位</Label>
                  <Input
                    id="current_title"
                    name="current_title"
                    placeholder="高级前端工程师"
                    disabled={isPending}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_direction">目标方向</Label>
                  <Input
                    id="target_direction"
                    name="target_direction"
                    placeholder="技术管理 / 架构师"
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_role">目标岗位</Label>
                  <Input
                    id="target_role"
                    name="target_role"
                    placeholder="前端技术负责人"
                    disabled={isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>材料信息</CardTitle>
              <CardDescription>上传旧简历、目标 JD 和补充材料文件。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileInputCard
                id="resume_file"
                label="旧简历"
                description="上传旧版简历文件"
                required
                disabled={isPending}
                accept={ALLOWED_TYPES}
                selectedName={resumeFile?.name ?? null}
                onSelect={setResumeFile}
                onClear={() => setResumeFile(null)}
              />
              <FileInputCard
                id="jd_file"
                label="目标 JD"
                description="上传目标职位的 JD 文件"
                disabled={isPending}
                accept={ALLOWED_TYPES}
                selectedName={jdFile?.name ?? null}
                onSelect={setJdFile}
                onClear={() => setJdFile(null)}
              />
              <FileInputCard
                id="material_file"
                label="项目补充材料"
                description="可上传项目文档、业绩数据、获奖信息等"
                disabled={isPending}
                accept={ALLOWED_TYPES}
                selectedName={materialFile?.name ?? null}
                onSelect={setMaterialFile}
                onClear={() => setMaterialFile(null)}
              />
              <div className="space-y-2">
                <Label htmlFor="privacy_notes">隐私与敏感信息说明</Label>
                <Textarea
                  id="privacy_notes"
                  name="privacy_notes"
                  placeholder="如有需要脱敏或标记的信息，请在此说明..."
                  className="min-h-[80px]"
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="mt-4 p-4 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <Button type="submit" disabled={isPending} size="lg">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "正在提交..." : "提交案例"}
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg" type="button" disabled={isPending}>
                取消
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
