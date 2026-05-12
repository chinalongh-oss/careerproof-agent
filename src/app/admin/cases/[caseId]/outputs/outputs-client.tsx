"use client"

import { useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Layout, RefreshCw, Save, Loader2, FileText, Globe, ShieldAlert, ExternalLink, Palette, Send, Download, Printer, Package, CheckCircle2, MessageSquare } from "lucide-react"
import { generateOutputsAction, saveOutputAction, auditRisksAction, upsertPublicPageAction, savePublicPageThemeAction, updateCaseStatus } from "../actions"

type OutputRow = {
  id: string
  case_id: string
  output_type: string
  title: string | null
  content: unknown
  markdown: string | null
  version: number
  created_at: string
}

type PublicPageRow = {
  id: string
  case_id: string
  slug: string
  selected_theme: string
  is_published: boolean
  page_content: Record<string, unknown> | null
  created_at: string
  updated_at: string
} | null

type ArtifactRow = {
  id: string
  case_id: string
  artifact_type: string
  file_url: string | null
  storage_path: string | null
  sha256: string | null
  template_version: string | null
  schema_version: string | null
  source_output_id: string | null
  created_at: string
} | null

type JDRow = {
  id: string
  case_id: string
  role_name: string | null
  keywords: Record<string, unknown> | null
  core_responsibilities: Record<string, unknown> | null
  required_skills: Record<string, unknown> | null
  hidden_requirements: Record<string, unknown> | null
  resume_strategy: Record<string, unknown> | null
  interview_focus: Record<string, unknown> | null
} | null

interface Props {
  caseId: string
  candidateName: string | null
  targetRole: string | null
  caseStatus: string
  resumeOutput: OutputRow | null
  profileOutput: OutputRow | null
  publicPage: PublicPageRow
  recentArtifact: ArtifactRow
  interviewPack: OutputRow | null
  jdData: JDRow
}

const THEME_OPTIONS = [
  { value: "minimal", label: "Minimal - 极简" },
  { value: "professional", label: "Professional - 专业" },
  { value: "headhunter_quickview", label: "Headhunter Quick View - 猎头速览" },
]

export function OutputsClient({ caseId, candidateName, targetRole, caseStatus, resumeOutput, profileOutput, publicPage, recentArtifact, interviewPack, jdData }: Props) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "resume")

  const [generating, setGenerating] = useState(false)
  const [resumeMarkdown, setResumeMarkdown] = useState(resumeOutput?.markdown ?? "")
  const [resumeTitle, setResumeTitle] = useState(resumeOutput?.title ?? "")
  const [profileMarkdown, setProfileMarkdown] = useState(profileOutput?.markdown ?? "")
  const [resumeSaving, setResumeSaving] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [auditing, setAuditing] = useState(false)

  const [selectedTheme, setSelectedTheme] = useState(publicPage?.selected_theme ?? "minimal")
  const [slugValue, setSlugValue] = useState(publicPage?.slug ?? "")
  const [savingTheme, setSavingTheme] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [pdfSignedUrl, setPdfSignedUrl] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [markingDelivered, setMarkingDelivered] = useState(false)

  const hasAny = !!(resumeOutput || profileOutput)
  const currentSlug = publicPage?.slug
  const isPublished = publicPage?.is_published ?? false

  const reloadPreservingTab = useCallback((tab?: string) => {
    const t = tab ?? activeTab
    const url = new URL(window.location.href)
    url.searchParams.set("tab", t)
    window.location.href = url.toString()
  }, [activeTab])

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await generateOutputsAction(caseId)
      if (result.success) {
        toast.success(result.message || "生成完成")
        reloadPreservingTab()
      } else {
        toast.error(result.error || "生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSaveResume() {
    setResumeSaving(true)
    try {
      const result = await saveOutputAction(caseId, "resume_markdown", resumeMarkdown, resumeTitle || undefined)
      if (result.success) {
        toast.success(result.message || "保存成功")
        reloadPreservingTab("resume")
      } else {
        toast.error(result.error || "保存失败")
      }
    } catch (e) {
      toast.error(`保存异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setResumeSaving(false)
    }
  }

  async function handleSaveProfile() {
    setProfileSaving(true)
    try {
      const result = await saveOutputAction(caseId, "profile_page", profileMarkdown)
      if (result.success) {
        toast.success(result.message || "保存成功")
        reloadPreservingTab("profile")
      } else {
        toast.error(result.error || "保存失败")
      }
    } catch (e) {
      toast.error(`保存异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleRunAudit() {
    setAuditing(true)
    try {
      const result = await auditRisksAction(caseId)
      if (result.success) {
        toast.success(result.message || "风险审查完成")
      } else {
        toast.error(result.error || "风险审查失败")
      }
    } catch (e) {
      toast.error(`审查异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setAuditing(false)
    }
  }

  async function handleExportPdf() {
    setExporting(true)
    setPdfSignedUrl(null)
    setExportError(null)
    try {
      const res = await fetch(`/api/cases/${caseId}/export-pdf`)
      const data = await res.json()
      if (!res.ok || !data.ok) {
        setExportError(data.error || "导出失败")
        toast.error(data.error || "导出 PDF 失败")
        return
      }
      setPdfSignedUrl(data.signedUrl)
      toast.success("PDF 导出成功")
    } catch (e) {
      const msg = `请求异常：${e instanceof Error ? e.message : String(e)}`
      setExportError(msg)
      toast.error(msg)
    } finally {
      setExporting(false)
    }
  }

  async function handleSaveTheme() {
    setSavingTheme(true)
    try {
      const result = await savePublicPageThemeAction(caseId, selectedTheme)
      if (result.success) {
        toast.success(result.message || "主题已保存")
        reloadPreservingTab("profile")
      } else {
        toast.error(result.error || "保存失败")
      }
    } catch (e) {
      toast.error(`保存异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSavingTheme(false)
    }
  }

  async function handlePublish() {
    setPublishing(true)
    try {
      const result = await upsertPublicPageAction(caseId, slugValue || undefined, selectedTheme)
      if (result.success) {
        toast.success(result.message || "发布成功")
        reloadPreservingTab("profile")
      } else {
        toast.error(result.error || "发布失败")
      }
    } catch (e) {
      toast.error(`发布异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setPublishing(false)
    }
  }

  async function handleMarkDelivered() {
    setMarkingDelivered(true)
    try {
      const result = await updateCaseStatus(caseId, "delivered")
      if (result.success) {
        toast.success("已标记为已交付")
        window.location.reload()
      } else {
        toast.error(result.error || "标记失败")
      }
    } catch (e) {
      toast.error(`标记异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setMarkingDelivered(false)
    }
  }

  if (!hasAny) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">交付物</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <Layout className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">暂无交付物</p>
              <p className="text-sm text-muted-foreground">
                请先完成前置步骤（解析简历、解析 JD、生成证据卡、生成职业指纹、选择职业定位），然后生成简历和主页。
              </p>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Layout className="h-4 w-4 mr-1.5" />}
                {generating ? "生成中..." : "生成简历和主页"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">交付物</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1.5" />
            )}
            重新生成
          </Button>
          <Link href={`/admin/cases/${caseId}`}>
            <Button variant="ghost" size="sm">返回概览</Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAudit}
            disabled={auditing}
          >
            {auditing ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <ShieldAlert className="h-4 w-4 mr-1.5" />
            )}
            运行风险审查
          </Button>
          <Link href={`/admin/cases/${caseId}/risk`}>
            <Button variant="outline" size="sm">
              <ShieldAlert className="h-4 w-4 mr-1.5" />
              查看风险报告
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resume">
            <FileText className="h-4 w-4 mr-1.5" />
            简历
            {resumeOutput && (
              <Badge variant="secondary" className="ml-2 text-xs">v{resumeOutput.version}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="profile">
            <Globe className="h-4 w-4 mr-1.5" />
            个人主页
            {profileOutput && (
              <Badge variant="secondary" className="ml-2 text-xs">v{profileOutput.version}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Package className="h-4 w-4 mr-1.5" />
            交付包
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="space-y-4 mt-4">
          {resumeOutput ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    className="text-sm font-medium"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    placeholder="简历标题"
                  />
                </div>
                <Button size="sm" onClick={handleSaveResume} disabled={resumeSaving}>
                  {resumeSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  保存修改
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/print/cases/${caseId}/resume`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-1.5" />
                    预览打印页
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPdf}
                  disabled={exporting}
                >
                  {exporting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
                  {exporting ? "导出中..." : "导出 PDF"}
                </Button>
              </div>

              {exportError && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="py-3">
                    <p className="text-sm text-destructive">{exportError}</p>
                  </CardContent>
                </Card>
              )}

              {pdfSignedUrl && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-600" />
                      <a
                        href={pdfSignedUrl}
                        download
                        className="text-sm font-medium text-green-700 hover:underline"
                      >
                        下载 PDF
                      </a>
                      <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">
                        链接 1 小时内有效
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {recentArtifact && (
                <Card className="border-muted">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      最近导出记录
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-1">
                    <p>导出时间：{new Date(recentArtifact.created_at).toLocaleString("zh-CN")}</p>
                    {recentArtifact.sha256 && (
                      <p className="font-mono">SHA256：{recentArtifact.sha256.slice(0, 8)}...</p>
                    )}
                    {recentArtifact.template_version && (
                      <p>模板版本：{recentArtifact.template_version}</p>
                    )}
                    {recentArtifact.schema_version && (
                      <p>Schema 版本：{recentArtifact.schema_version}</p>
                    )}
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>编辑 Markdown 内容后点击保存，将生成新版本</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="min-h-[500px] font-mono text-sm"
                    value={resumeMarkdown}
                    onChange={(e) => setResumeMarkdown(e.target.value)}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded leading-relaxed">
                    {resumeMarkdown || "—"}
                  </pre>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2" />
                <p>尚未生成简历</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4 mt-4">
          {profileOutput ? (
            <>
              {/* Publishing Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    公开主页设置
                  </CardTitle>
                  <CardDescription>
                    配置主题样式和 slug 后发布公开主页
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Theme Selector */}
                  <div className="space-y-2">
                    <Label className="text-xs">主题样式</Label>
                    <div className="flex items-center gap-3">
                      <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                        <SelectTrigger className="w-[240px]">
                          <Palette className="h-3.5 w-3.5 mr-1.5" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {THEME_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {publicPage && (
                        <Badge variant="outline" className="text-xs">
                          当前：{THEME_OPTIONS.find((t) => t.value === publicPage.selected_theme)?.label ?? publicPage.selected_theme}
                        </Badge>
                      )}
                      <Button size="sm" variant="outline" onClick={handleSaveTheme} disabled={savingTheme}>
                        {savingTheme ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                        保存主题
                      </Button>
                    </div>
                  </div>

                  {/* Slug Input */}
                  <div className="space-y-2">
                    <Label className="text-xs">公开链接 Slug</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-1.5 bg-muted/50 rounded-md px-3 py-1.5 text-sm">
                        <span className="text-muted-foreground shrink-0">/p/</span>
                        <Input
                          className="border-0 bg-transparent h-auto p-0 text-sm font-mono shadow-none focus-visible:ring-0"
                          value={slugValue}
                          onChange={(e) => setSlugValue(e.target.value)}
                          placeholder={currentSlug || "自动生成"}
                        />
                      </div>
                    </div>
                    {currentSlug && currentSlug !== slugValue && (
                      <p className="text-xs text-muted-foreground">
                        当前发布：/p/{currentSlug}
                      </p>
                    )}
                  </div>

                  {/* Publish Button & Link */}
                  <div className="flex items-center gap-3 pt-1">
                    <Button onClick={handlePublish} disabled={publishing}>
                      {publishing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
                      {isPublished ? "更新公开主页" : "发布公开主页"}
                    </Button>
                    {currentSlug && isPublished && (
                      <Link
                        href={`/p/${currentSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        /p/{currentSlug}
                      </Link>
                    )}
                    {currentSlug && !isPublished && (
                      <Badge variant="secondary" className="text-xs">未发布</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Theme Preview */}
              {profileOutput.content && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      主题预览
                      <Badge variant="outline" className="text-xs ml-2">
                        {selectedTheme}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/20 p-4 max-h-[400px] overflow-y-auto text-sm">
                        <ProfileMiniPreview
                          content={profileOutput.content as Record<string, unknown>}
                          theme={selectedTheme}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Markdown Editor */}
              <div className="flex justify-end">
                <Button size="sm" variant="outline" onClick={handleSaveProfile} disabled={profileSaving}>
                  {profileSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  保存 Markdown 修改
                </Button>
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>编辑 Markdown 内容后点击保存，将生成新版本</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="min-h-[400px] font-mono text-sm"
                    value={profileMarkdown}
                    onChange={(e) => setProfileMarkdown(e.target.value)}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Markdown 预览
                    {profileOutput.title && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {profileOutput.title}
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/30 p-4 rounded leading-relaxed">
                    {profileMarkdown || "—"}
                  </pre>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Globe className="h-10 w-10 mx-auto mb-2" />
                <p>尚未生成个人主页</p>
                <p className="text-sm mt-1">请先生成交付物，个人主页将自动生成</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                交付包
              </CardTitle>
              <CardDescription>将所有交付物打包，准备发送给候选人</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* PDF 简历下载 */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2 rounded">
                    <FileText className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">PDF 简历</p>
                    <p className="text-xs text-muted-foreground">
                      {recentArtifact
                        ? `最近导出：${new Date(recentArtifact.created_at).toLocaleString("zh-CN")}`
                        : "尚未导出"}
                    </p>
                  </div>
                </div>
                {resumeOutput ? (
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/cases/${caseId}/resume-print`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        预览
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={exporting}>
                      {exporting ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1" />}
                      {exporting ? "导出中..." : "导出 PDF"}
                    </Button>
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-xs">请先生成简历</Badge>
                )}
              </div>

              {pdfSignedUrl && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="py-3">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-600" />
                      <a href={pdfSignedUrl} download className="text-sm font-medium text-green-700 hover:underline">
                        下载最新 PDF
                      </a>
                      <Badge variant="outline" className="text-xs bg-green-100 border-green-300 text-green-700">
                        链接 1 小时内有效
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {recentArtifact && (
                <div className="text-xs text-muted-foreground space-y-0.5 bg-muted/30 rounded p-3">
                  <p>导出时间：{new Date(recentArtifact.created_at).toLocaleString("zh-CN")}</p>
                  {recentArtifact.sha256 && (
                    <p className="font-mono">SHA256：{recentArtifact.sha256.slice(0, 8)}...</p>
                  )}
                </div>
              )}

              {/* 个人主页链接 */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">个人主页</p>
                    <p className="text-xs text-muted-foreground">
                      {currentSlug && isPublished
                        ? `/p/${currentSlug}`
                        : currentSlug
                          ? "草稿（未发布）"
                          : "尚未发布"}
                    </p>
                  </div>
                </div>
                {currentSlug && isPublished ? (
                  <Link href={`/p/${currentSlug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      打开
                    </Button>
                  </Link>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    {profileOutput ? "请先发布" : "请先生成主页"}
                  </Badge>
                )}
              </div>

              {/* 风险审查报告入口 */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-50 p-2 rounded">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">风险审查报告</p>
                    <p className="text-xs text-muted-foreground">简历风险点和修改建议</p>
                  </div>
                </div>
                <Link href={`/admin/cases/${caseId}/risk`}>
                  <Button variant="outline" size="sm">
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                    查看
                  </Button>
                </Link>
              </div>

              {/* 面试准备包入口 */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 p-2 rounded">
                    <MessageSquare className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">面试准备包</p>
                    <p className="text-xs text-muted-foreground">
                      {interviewPack
                        ? `v${interviewPack.version} · ${new Date(interviewPack.created_at).toLocaleString("zh-CN")}`
                        : "尚未生成"}
                    </p>
                  </div>
                </div>
                <Link href={`/admin/cases/${caseId}/interview`}>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    {interviewPack ? "查看" : "生成"}
                  </Button>
                </Link>
              </div>

              {/* JD 匹配摘要 */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">JD 匹配摘要</CardTitle>
                </CardHeader>
                <CardContent>
                  {jdData ? (
                    <div className="space-y-3 text-sm">
                      {jdData.role_name && (
                        <div>
                          <span className="font-medium text-muted-foreground">目标职位：</span>
                          {jdData.role_name}
                        </div>
                      )}
                      {jdData.keywords && typeof jdData.keywords === "object" && (
                        <div>
                          <span className="font-medium text-muted-foreground">关键词：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(() => {
                              const kw = jdData.keywords as Record<string, unknown>
                              const vals = Array.isArray(kw) ? kw : Array.isArray(kw.keywords) ? kw.keywords as unknown[] : Object.values(kw).flat()
                              return vals.slice(0, 10).map((k, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{String(k)}</Badge>
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                      {jdData.core_responsibilities && typeof jdData.core_responsibilities === "object" && (
                        <div>
                          <span className="font-medium text-muted-foreground">核心职责：</span>
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {(() => {
                              const cr = jdData.core_responsibilities as Record<string, unknown>
                              const vals = Array.isArray(cr) ? cr : Array.isArray(cr.responsibilities) ? cr.responsibilities as unknown[] : Object.values(cr).flat().filter(Boolean)
                              return vals.slice(0, 5).map((r, i) => (
                                <li key={i} className="text-muted-foreground">{String(r)}</li>
                              ))
                            })()}
                          </ul>
                        </div>
                      )}
                      {jdData.required_skills && typeof jdData.required_skills === "object" && (
                        <div>
                          <span className="font-medium text-muted-foreground">技能要求：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(() => {
                              const rs = jdData.required_skills as Record<string, unknown>
                              const vals = Array.isArray(rs) ? rs : Object.values(rs).flat()
                              return vals.filter(Boolean).slice(0, 8).map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{String(s)}</Badge>
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                      {jdData.hidden_requirements && typeof jdData.hidden_requirements === "object" && (
                        <div>
                          <span className="font-medium text-muted-foreground">隐性要求：</span>
                          <ul className="list-disc list-inside mt-1 space-y-0.5">
                            {(() => {
                              const hr = jdData.hidden_requirements as Record<string, unknown>
                              const vals = Array.isArray(hr) ? hr : Object.values(hr).flat().filter(Boolean)
                              return vals.slice(0, 5).map((r, i) => (
                                <li key={i} className="text-muted-foreground">{String(r)}</li>
                              ))
                            })()}
                          </ul>
                        </div>
                      )}
                      {jdData.resume_strategy && typeof jdData.resume_strategy === "object" && (
                        <div>
                          <span className="font-medium text-muted-foreground">简历策略：</span>
                          <div className="mt-1 space-y-1">
                            {(() => {
                              const strat = jdData.resume_strategy as Record<string, unknown>
                              const emphasize = strat.emphasize
                              const deemphasize = strat.deemphasize
                              const parts: string[] = []
                              if (emphasize) {
                                const ev = Array.isArray(emphasize) ? emphasize : [String(emphasize)]
                                parts.push(`强调：${ev.join("、")}`)
                              }
                              if (deemphasize) {
                                const dv = Array.isArray(deemphasize) ? deemphasize : [String(deemphasize)]
                                parts.push(`弱化：${dv.join("、")}`)
                              }
                              return parts.map((p, i) => <p key={i} className="text-muted-foreground text-xs">{p}</p>)
                            })()}
                          </div>
                        </div>
                      )}
                      {jdData.interview_focus && typeof jdData.interview_focus === "object" && (
                        <div>
                          <span className="font-medium text-muted-foreground">面试重点：</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(() => {
                              const iff = jdData.interview_focus as Record<string, unknown>
                              const vals = Array.isArray(iff.areas) ? iff.areas as unknown[] : Object.values(iff).flat()
                              return vals.filter(Boolean).slice(0, 5).map((a, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{String(a)}</Badge>
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">暂无 JD 匹配摘要，请先解析 JD</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 标记已交付 */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">标记已交付</p>
                    <p className="text-xs text-muted-foreground">
                      {caseStatus === "delivered"
                        ? "已标记为已交付"
                        : "确认所有交付物已发送给候选人"}
                    </p>
                  </div>
                  <Button
                    variant={caseStatus === "delivered" ? "outline" : "default"}
                    size="sm"
                    onClick={handleMarkDelivered}
                    disabled={markingDelivered || caseStatus === "delivered"}
                  >
                    {markingDelivered ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    )}
                    {caseStatus === "delivered" ? "已交付" : "标记已交付"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProfileMiniPreview({ content, theme }: { content: Record<string, unknown>; theme: string }) {
  const hero = (content.hero ?? {}) as Record<string, unknown>
  const trustNotes = (content.trust_notes ?? []) as string[]
  const evidenceHighlights = (content.evidence_highlights ?? []) as Array<Record<string, unknown>>
  const featuredProjects = (content.featured_projects ?? []) as Array<Record<string, unknown>>
  const targetRoles = (content.target_roles ?? []) as string[]
  const coreCapabilities = (content.core_capabilities ?? []) as string[]
  const heroName = (hero.name as string) ?? ""
  const heroTitle = (hero.positioning_title as string) ?? ""
  const oneLineValue = (hero.one_line_value as string) ?? ""

  return (
    <div className="space-y-3">
      {heroName && (
        <div>
          <p className="font-bold text-base">{heroName || "—"}</p>
          {heroTitle && <p className="text-muted-foreground text-xs">{heroTitle}</p>}
          {oneLineValue && (
            <p className="text-xs mt-1 leading-relaxed">{oneLineValue}</p>
          )}
        </div>
      )}

      {theme === "headhunter_quickview" && targetRoles.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {targetRoles.map((r, i) => (
            <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
          ))}
        </div>
      )}

      {theme === "headhunter_quickview" && coreCapabilities.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">核心亮点</p>
          <ul className="space-y-0.5">
            {coreCapabilities.slice(0, 4).map((c, i) => (
              <li key={i} className="text-xs flex items-start gap-1">
                <span className="text-primary">•</span> {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {evidenceHighlights.length > 0 && theme !== "headhunter_quickview" && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">证据亮点</p>
          {evidenceHighlights.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-xs py-0.5">
              <span className="font-semibold text-primary shrink-0">{(item.metric as string) ?? ""}</span>
              <span className="text-muted-foreground">{(item.description as string) ?? ""}</span>
            </div>
          ))}
        </div>
      )}

      {theme !== "headhunter_quickview" && featuredProjects.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">代表项目</p>
          {featuredProjects.slice(0, 2).map((proj, i) => (
            <div key={i} className="text-xs py-0.5">
              <span className="font-medium">{(proj.name as string) ?? ""}</span>
            </div>
          ))}
        </div>
      )}

      {trustNotes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {trustNotes.slice(0, 3).map((note, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
              {note}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
