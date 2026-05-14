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
import { Layout, RefreshCw, Save, Loader2, FileText, Globe, ShieldAlert, ExternalLink, Palette, Send, Download, Printer, Package, CheckCircle2, MessageSquare, Lock, AlertTriangle, Target } from "lucide-react"
import { generateOutputsAction, saveOutputAction, auditRisksAction, upsertPublicPageAction, savePublicPageThemeAction, markDeliveredAction, setPagePasswordAction, clearPagePasswordAction, setDeliveryTargetAction } from "../actions"
import { formatLocalTime } from "@/lib/utils"
import type { JobFitAssessment, SelectedDeliveryTarget } from "@/lib/supabase/types"

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
  password_hash: string | null
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
  resumeOutputs: OutputRow[]
  diagnosticOutput: OutputRow | null
  profileOutput: OutputRow | null
  publicPage: PublicPageRow
  recentArtifact: ArtifactRow
  interviewPack: OutputRow | null
  jdData: JDRow
  jobFitAssessment: JobFitAssessment | null
  deliveryTargets: SelectedDeliveryTarget[]
}

const THEME_OPTIONS = [
  { value: "minimal", label: "Minimal - 极简" },
  { value: "professional", label: "Professional - 专业" },
  { value: "headhunter_quickview", label: "Headhunter Quick View - 猎头速览" },
]

export function OutputsClient({ caseId, candidateName, targetRole, caseStatus, resumeOutputs, diagnosticOutput, profileOutput, publicPage, recentArtifact, interviewPack, jdData, jobFitAssessment, deliveryTargets }: Props) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") ?? "resume")

  const [selectedResumeId, setSelectedResumeId] = useState(resumeOutputs[0]?.id ?? "")
  const selectedResume = resumeOutputs.find((r) => r.id === selectedResumeId) ?? resumeOutputs[0] ?? null

  const [generating, setGenerating] = useState(false)
  const [resumeMarkdown, setResumeMarkdown] = useState(selectedResume?.markdown ?? "")
  const [resumeTitle, setResumeTitle] = useState(selectedResume?.title ?? "")
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
  const [pagePassword, setPagePassword] = useState("")
  const [settingPassword, setSettingPassword] = useState(false)
  const [clearingPassword, setClearingPassword] = useState(false)
  const [forceGenerating, setForceGenerating] = useState(false)
  const [forceTargetSaving, setForceTargetSaving] = useState(false)

  const [checkedTargets, setCheckedTargets] = useState<Array<{mode: string; role?: string | null}>>(
    () => deliveryTargets.map(t => ({ mode: t.delivery_mode, role: t.target_role ?? null }))
  )

  const hasAny = !!(selectedResume || profileOutput)
  const currentSlug = publicPage?.slug
  const isPublished = publicPage?.is_published ?? false
  const fitLevel = jobFitAssessment?.fit_level ?? "high"
  const hasForcedTarget = checkedTargets.some(t => t.mode === "forced_target_resume")
  const hasDiagnostic = checkedTargets.some(t => t.mode === "diagnostic_report")
  const hasAltRoles = checkedTargets.some(t => t.mode === "full_resume" && t.role)
  const altRoleTargets = checkedTargets.filter(t => t.mode === "full_resume" && t.role)
  const anyTarget = checkedTargets.length > 0
  const isForcedTargetMode = hasForcedTarget
  const isLowFit = fitLevel === "low" || fitLevel === "no_fit"
  const showFitWarning = jobFitAssessment && fitLevel !== "high"
  const needsForceGenerate = isLowFit && !anyTarget

  const reloadPreservingTab = useCallback((tab?: string) => {
    const t = tab ?? activeTab
    const url = new URL(window.location.href)
    url.searchParams.set("tab", t)
    window.location.href = url.toString()
  }, [activeTab])

  async function handleGenerate(forceRegenerate = false) {
    setGenerating(true)
    try {
      const result = await generateOutputsAction(caseId, forceRegenerate ? { forceRegenerate: true } : undefined)
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

  async function handleForceGenerate() {
    setForceGenerating(true)
    try {
      const result = await generateOutputsAction(caseId, { forceGenerate: true })
      if (result.success) {
        toast.success(result.message || "强制生成完成（已附加风险标记）")
        reloadPreservingTab()
      } else {
        toast.error(result.error || "强制生成失败")
      }
    } catch (e) {
      toast.error(`强制生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setForceGenerating(false)
    }
  }

  async function handleToggleTarget(deliveryMode: string, targetRole?: string) {
    const role = targetRole ?? null
    const alreadyChecked = checkedTargets.some(t => t.mode === deliveryMode && t.role === role)

    if (alreadyChecked) {
      setCheckedTargets(prev => prev.filter(t => !(t.mode === deliveryMode && t.role === role)))
    } else {
      setCheckedTargets(prev => [...prev, { mode: deliveryMode, role }])
    }

    setForceTargetSaving(true)
    try {
      const isForced = deliveryMode === "forced_target_resume"
      const result = await setDeliveryTargetAction(
        caseId,
        deliveryMode,
        isForced ? "original_jd" : "job_fit_recommended",
        isForced,
        isForced ? "用户坚持投递原目标 JD，已确认岗位适配风险" : undefined,
        targetRole || undefined,
        isForced
      )
      if (!result.success) {
        toast.error(result.error || "操作失败")
        setCheckedTargets(prev => alreadyChecked
          ? [...prev, { mode: deliveryMode, role }]
          : prev.filter(t => !(t.mode === deliveryMode && t.role === role))
        )
      } else {
        window.location.reload()
      }
    } catch (e) {
      toast.error(`操作异常：${e instanceof Error ? e.message : String(e)}`)
      setCheckedTargets(prev => alreadyChecked
        ? [...prev, { mode: deliveryMode, role }]
        : prev.filter(t => !(t.mode === deliveryMode && t.role === role))
      )
    } finally {
      setForceTargetSaving(false)
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
      const outputId = selectedResume?.id
      if (!outputId) {
        setExportError("请先选择一个简历版本")
        toast.error("请先选择一个简历版本")
        setExporting(false)
        return
      }
      const res = await fetch(`/api/cases/${caseId}/export-pdf?outputId=${outputId}`)
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
      const result = await markDeliveredAction(caseId, selectedResume?.id)
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

  async function handleSetPassword() {
    if (!pagePassword) {
      toast.error("请输入密码")
      return
    }
    setSettingPassword(true)
    try {
      const result = await setPagePasswordAction(caseId, pagePassword)
      if (result.success) {
        toast.success(result.message || "密码已设置")
        setPagePassword("")
        window.location.reload()
      } else {
        toast.error(result.error || "设置失败")
      }
    } catch (e) {
      toast.error(`设置异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setSettingPassword(false)
    }
  }

  async function handleClearPassword() {
    setClearingPassword(true)
    try {
      const result = await clearPagePasswordAction(caseId)
      if (result.success) {
        toast.success(result.message || "密码已清除")
        window.location.reload()
      } else {
        toast.error(result.error || "清除失败")
      }
    } catch (e) {
      toast.error(`清除异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setClearingPassword(false)
    }
  }

  const isTargetChecked = (mode: string, role?: string) => {
    const r = role ?? null
    return checkedTargets.some(t => t.mode === mode && t.role === r)
  }

  const deliveryTargetSelector = isLowFit && jobFitAssessment ? (
    <Card className="border-dashed border-yellow-400">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">选择交付目标（可多选）</CardTitle>
        </div>
        <CardDescription>勾选需要生成的交付物，点击生成按钮时一并打包。每个交付物会标明类型。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Alt roles */}
        {Array.isArray(jobFitAssessment.alternative_roles) && (jobFitAssessment.alternative_roles as Array<{role?: string; fit_reason?: string}>).length > 0 && (
          <div className="border rounded-lg p-3">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              替代岗位简历（推荐）
            </p>
            <p className="text-xs text-muted-foreground mt-1">基于候选人实际经历，生成匹配度更高的正式简历。</p>
            <div className="mt-2 space-y-1.5">
              {(jobFitAssessment.alternative_roles as Array<{role?: string; fit_reason?: string}>).slice(0, 5).map((alt, i) => {
                const checked = isTargetChecked("full_resume", alt.role)
                return (
                  <label key={i} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1.5 rounded">
                    <input type="checkbox" className="h-4 w-4" checked={checked}
                      onChange={() => handleToggleTarget("full_resume", alt.role)}
                      disabled={forceTargetSaving} />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{alt.role}</span>
                      {alt.fit_reason && <span className="text-xs text-muted-foreground block mt-0.5">{alt.fit_reason}</span>}
                    </div>
                    {checked && <Badge variant="default" className="text-xs shrink-0">已选</Badge>}
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Forced target */}
        <div className={`border rounded-lg p-3 ${hasForcedTarget ? 'border-destructive/50 bg-destructive/10' : 'border-destructive/30 bg-destructive/5'}`}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-4 w-4" checked={hasForcedTarget}
              onChange={() => handleToggleTarget("forced_target_resume")}
              disabled={forceTargetSaving} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                目标 JD 尝试版（高风险）
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                基于原目标 JD 生成尝试版。系统不会编造缺失经验，简历标题使用过渡性表达。
              </p>
            </div>
            {hasForcedTarget && <Badge variant="destructive" className="text-xs shrink-0">已选</Badge>}
          </label>
        </div>

        {/* Diagnostic */}
        <div className={`border rounded-lg p-3 ${hasDiagnostic ? 'bg-muted/50' : ''}`}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-4 w-4" checked={hasDiagnostic}
              onChange={() => handleToggleTarget("diagnostic_report")}
              disabled={forceTargetSaving} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                诊断报告
              </p>
              <p className="text-xs text-muted-foreground mt-1">生成差距分析、可迁移能力清单和替代岗位建议。</p>
            </div>
            {hasDiagnostic && <Badge variant="secondary" className="text-xs shrink-0">已选</Badge>}
          </label>
        </div>

        {anyTarget && (
          <div className="bg-muted p-2 rounded text-xs">
            <p className="text-muted-foreground">
              当前选择：
              {hasAltRoles && <span className="font-medium ml-1">{altRoleTargets.length} 个替代岗位简历</span>}
              {hasForcedTarget && <span className="font-medium ml-1">· 目标 JD 尝试版</span>}
              {hasDiagnostic && <span className="font-medium ml-1">· 诊断报告</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  ) : null

  if (!hasAny) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">交付物</h1>
          <p className="text-muted-foreground mt-1">
            候选人：{candidateName || caseId}
            {targetRole && ` · 目标岗位：${targetRole}`}
            {jdData?.role_name && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                来自 JD 解析
              </span>
            )}
          </p>
        </div>

        {showFitWarning && (
          <Card className={isForcedTargetMode ? "border-dashed border-orange-400" : "border-dashed border-yellow-400"}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${isForcedTargetMode ? "text-orange-500" : "text-yellow-500"}`} />
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    {isForcedTargetMode
                      ? "目标 JD 尝试版（已确认风险）"
                      : `岗位适配判断：${fitLevel === "medium" ? "中匹配" : fitLevel === "low" ? "低匹配" : "不匹配"}`}
                    {!isForcedTargetMode && jobFitAssessment?.fit_score != null && ` (${jobFitAssessment.fit_score}/100)`}
                  </p>
                  {!isForcedTargetMode && jobFitAssessment?.summary && (
                    <p className="text-xs text-muted-foreground mt-1">{jobFitAssessment.summary}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {deliveryTargetSelector}

        {anyTarget ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center space-y-3">
                <Package className="h-10 w-10 text-muted-foreground mx-auto" />
                <p className="font-medium">已选择 {checkedTargets.length} 个交付目标</p>
                <p className="text-xs text-muted-foreground">
                  {hasAltRoles && <span className="mr-2">替代岗位简历 ×{altRoleTargets.length}</span>}
                  {hasForcedTarget && <span className="mr-2">· 目标 JD 尝试版</span>}
                  {hasDiagnostic && <span>· 诊断报告</span>}
                </p>
                <Button onClick={() => handleGenerate()} disabled={generating}>
                  {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Layout className="h-4 w-4 mr-1.5" />}
                  {generating ? "生成中..." : "打包生成交付物"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-3">
                <Layout className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">暂无交付物</p>
                <p className="text-sm text-muted-foreground">
                  请先完成前置步骤（解析简历、解析 JD、生成证据卡、生成职业指纹、选择职业定位），然后生成简历和主页。
                </p>
                <div className="flex items-center justify-center gap-2">
                  {isForcedTargetMode ? (
                    <Button onClick={() => handleGenerate()} disabled={generating}>
                      {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Layout className="h-4 w-4 mr-1.5" />}
                      {generating ? "生成中..." : "生成目标 JD 尝试版"}
                    </Button>
                  ) : !needsForceGenerate ? (
                    <Button onClick={() => handleGenerate()} disabled={generating}>
                      {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Layout className="h-4 w-4 mr-1.5" />}
                      {generating ? "生成中..." : "生成简历和主页"}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => handleGenerate()} disabled={generating} variant="outline">
                        {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Layout className="h-4 w-4 mr-1.5" />}
                        {generating ? "生成中..." : "尝试生成"}
                      </Button>
                      <Button onClick={handleForceGenerate} disabled={forceGenerating} variant="destructive">
                        {forceGenerating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ShieldAlert className="h-4 w-4 mr-1.5" />}
                        {forceGenerating ? "强制生成中..." : "强制生成（附加风险）"}
                      </Button>
                    </>
                  )}
                </div>
                {needsForceGenerate && (
                  <p className="text-xs text-destructive mt-1">
                    强制生成将自动附加 jd_overfit 高风险标记
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
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
            {jdData?.role_name && (
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                来自 JD 解析
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGenerate(true)}
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

      {showFitWarning && (
        <Card className={isForcedTargetMode ? "border-dashed border-orange-400" : "border-dashed border-yellow-400"}>
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${isForcedTargetMode ? "text-orange-500" : "text-yellow-500"}`} />
              <div className="space-y-1 flex-1">
                <p className="font-medium text-sm">
                  {isForcedTargetMode
                    ? "目标 JD 尝试版（已确认风险）"
                    : `岗位适配：${fitLevel === "medium" ? "中匹配" : fitLevel === "low" ? "低匹配" : "不匹配"}`}
                  {!isForcedTargetMode && jobFitAssessment?.fit_score != null && ` (${jobFitAssessment.fit_score}/100)`}
                </p>
                {!isForcedTargetMode && jobFitAssessment?.summary && (
                  <p className="text-sm text-muted-foreground mt-1">{jobFitAssessment.summary}</p>
                )}
                {needsForceGenerate && (
                  <Button size="sm" variant="destructive" onClick={handleForceGenerate} disabled={forceGenerating} className="mt-1">
                    {forceGenerating ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <ShieldAlert className="h-3.5 w-3.5 mr-1" />}
                    {forceGenerating ? "强制生成中..." : "强制生成（附加风险）"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {deliveryTargetSelector}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resume">
            <FileText className="h-4 w-4 mr-1.5" />
            简历
            {selectedResume && (
              <Badge variant="secondary" className="ml-2 text-xs">v{selectedResume.version}</Badge>
            )}
            {resumeOutputs.length > 1 && (
              <Badge variant="outline" className="ml-1 text-xs">{resumeOutputs.length}个版本</Badge>
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
          {resumeOutputs.length > 1 && (
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">简历版本：</Label>
              <Select value={selectedResumeId} onValueChange={(v) => setSelectedResumeId(v)}>
                <SelectTrigger className="w-[300px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resumeOutputs.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="text-xs">
                      {r.title || `v${r.version}`} · v{r.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {selectedResume ? (
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
                <Link href={`/print/cases/${caseId}/resume?outputId=${selectedResumeId}`} target="_blank">
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
                    <p>导出时间：{formatLocalTime(recentArtifact.created_at)}</p>
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

              {diagnosticOutput && (
                <Card className="border-dashed border-blue-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-500" />
                      诊断报告
                      <Badge variant="outline" className="text-xs">v{diagnosticOutput.version}</Badge>
                    </CardTitle>
                    <CardDescription>岗位适配诊断分析，不用于正式投递</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm whitespace-pre-wrap font-sans bg-blue-50 dark:bg-blue-950/20 p-4 rounded leading-relaxed max-h-[600px] overflow-y-auto">
                      {diagnosticOutput.markdown || "—"}
                    </pre>
                  </CardContent>
                </Card>
              )}
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

              {/* Password Management */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    访问密码
                  </CardTitle>
                  <CardDescription>
                    设置或清除公开主页的访问密码
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={publicPage?.password_hash ? "default" : "secondary"} className="text-xs">
                      {publicPage?.password_hash ? "已设置密码" : "无需密码"}
                    </Badge>
                    {publicPage?.password_hash && (
                      <span className="text-xs text-muted-foreground">访问者需要输入密码才能查看主页</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="password"
                      className="max-w-[200px]"
                      value={pagePassword}
                      onChange={(e) => setPagePassword(e.target.value)}
                      placeholder="输入新密码"
                      disabled={settingPassword || clearingPassword}
                    />
                    <Button size="sm" onClick={handleSetPassword} disabled={settingPassword || !pagePassword}>
                      {settingPassword ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Lock className="h-3.5 w-3.5 mr-1" />}
                      设置密码
                    </Button>
                    {publicPage?.password_hash && (
                      <Button size="sm" variant="outline" onClick={handleClearPassword} disabled={clearingPassword}>
                        {clearingPassword ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : null}
                        清除密码
                      </Button>
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
              {/* PDF 简历 - 每个版本一张卡 */}
              {resumeOutputs.map((r) => (
                <div key={r.id} className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        PDF 简历 {r.title && <span className="text-muted-foreground font-normal">· {r.title}</span>}
                        <Badge variant="secondary" className="ml-2 text-xs">v{r.version}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatLocalTime(r.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/cases/${caseId}/resume-print?outputId=${r.id}`} target="_blank">
                      <Button variant="outline" size="sm">
                        <Printer className="h-3.5 w-3.5 mr-1" />
                        预览
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={async () => {
                      try {
                        const res = await fetch(`/api/cases/${caseId}/export-pdf?outputId=${r.id}`)
                        const data = await res.json()
                        if (data.ok && data.signedUrl) {
                          window.open(data.signedUrl, "_blank")
                        } else {
                          toast.error(data.error || "导出失败")
                        }
                      } catch {
                        toast.error("导出请求失败")
                      }
                    }}>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      导出 PDF
                    </Button>
                  </div>
                </div>
              ))}

              {resumeOutputs.length === 0 && (
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded">
                      <FileText className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">PDF 简历</p>
                      <p className="text-xs text-muted-foreground">尚未生成</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">请先生成简历</Badge>
                </div>
              )}

              {/* 诊断报告 */}
              {diagnosticOutput && (
                <div className="flex items-center justify-between border rounded-lg p-4 border-dashed border-blue-300 bg-blue-50/30 dark:bg-blue-950/10">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded">
                      <AlertTriangle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        诊断报告
                        <Badge variant="outline" className="ml-2 text-xs">v{diagnosticOutput.version}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatLocalTime(diagnosticOutput.created_at)} · 岗位适配分析，不用于正式投递
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/cases/${caseId}/resume-print?outputId=${diagnosticOutput.id}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Printer className="h-3.5 w-3.5 mr-1" />
                      预览
                    </Button>
                  </Link>
                </div>
              )}

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
                  <p>导出时间：{formatLocalTime(recentArtifact.created_at)}</p>
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
                        ? `v${interviewPack.version} · ${formatLocalTime(interviewPack.created_at)}`
                        : "尚未生成"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {interviewPack && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/cases/${caseId}/export-interview-pdf`)
                          const data = await res.json()
                          if (data.ok && data.signedUrl) {
                            window.open(data.signedUrl, "_blank")
                          } else {
                            toast.error(data.error || "导出失败")
                          }
                        } catch {
                          toast.error("导出请求失败")
                        }
                      }}
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      下载 PDF
                    </Button>
                  )}
                  <Link href={`/admin/cases/${caseId}/interview`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      {interviewPack ? "查看" : "生成"}
                    </Button>
                  </Link>
                </div>
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
