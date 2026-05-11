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
import { Layout, RefreshCw, Save, Loader2, FileText, Globe, ShieldAlert, ExternalLink, Palette, Send } from "lucide-react"
import { generateOutputsAction, saveOutputAction, auditRisksAction, upsertPublicPageAction, savePublicPageThemeAction } from "../actions"

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

interface Props {
  caseId: string
  candidateName: string | null
  targetRole: string | null
  resumeOutput: OutputRow | null
  profileOutput: OutputRow | null
  publicPage: PublicPageRow
}

const THEME_OPTIONS = [
  { value: "minimal", label: "Minimal - 极简" },
  { value: "professional", label: "Professional - 专业" },
  { value: "headhunter_quickview", label: "Headhunter Quick View - 猎头速览" },
]

export function OutputsClient({ caseId, candidateName, targetRole, resumeOutput, profileOutput, publicPage }: Props) {
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
