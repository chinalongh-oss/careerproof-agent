"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Fingerprint,
  ShieldAlert,
  MessageSquare,
  Download,
  Globe,
  CheckCheck,
  ScanText,
  Target,
  Layout,
  Loader2,
  FileSearch,
} from "lucide-react"
import {
  parseResumeAction,
  buildProjectCardsAction,
  parseJDAction,
  generateFingerprintAction,
  generatePositioningsAction,
  generateOutputsAction,
  auditRisksAction,
  generateInterviewPackAction,
  evaluateJobFitAction,
  generateQualityReviewAction,
} from "./actions"

const actions = [
  { key: "parse_resume", label: "解析简历", icon: ScanText, requires: "new_submitted" },
  { key: "generate_evidence", label: "生成项目证据卡", icon: FileText, requires: "parsed" },
  { key: "parse_jd", label: "解析 JD", icon: ScanText, requires: "new_submitted" },
  { key: "generate_fingerprint", label: "生成职业指纹", icon: Fingerprint, requires: "evidence_ready" },
  { key: "generate_positioning", label: "生成职业定位", icon: Target, requires: "fingerprint_ready" },
  { key: "evaluate_job_fit", label: "岗位适配判断", icon: ShieldAlert, requires: "jd_ready" },
  { key: "generate_outputs", label: "生成简历和主页", icon: Layout, requires: "positioning_ready" },
  { key: "run_risk", label: "运行风险审查", icon: ShieldAlert, requires: "outputs_ready" },
  { key: "generate_interview", label: "生成面试准备包", icon: MessageSquare, requires: "risk_reviewed" },
  { key: "generate_quality_review", label: "新旧简历质量对比", icon: FileSearch, requires: "outputs_ready" },
]

const statusOrder = [
  "new_submitted", "parsed", "evidence_ready", "jd_ready", "fingerprint_ready",
  "positioning_ready", "outputs_ready", "risk_reviewed", "interview_ready", "delivered",
]

export function WorkflowPanel({ caseId, currentStatus }: { caseId: string; currentStatus: string }) {
  const router = useRouter()
  const currentIdx = statusOrder.indexOf(currentStatus)
  const [parsePending, setParsePending] = useState(false)
  const [evidencePending, setEvidencePending] = useState(false)
  const [jdPending, setJdPending] = useState(false)
  const [fpPending, setFpPending] = useState(false)
  const [posPending, setPosPending] = useState(false)
  const [outputsPending, setOutputsPending] = useState(false)
  const [riskPending, setRiskPending] = useState(false)
  const [interviewPending, setInterviewPending] = useState(false)
  const [fitPending, setFitPending] = useState(false)
  const [exportPdfPending, setExportPdfPending] = useState(false)
  const [qualityReviewPending, setQualityReviewPending] = useState(false)

  function isAvailable(requires: string) {
    if (currentIdx < 0) return false
    const reqIdx = statusOrder.indexOf(requires)
    return currentIdx >= reqIdx
  }

  async function handleParseResume() {
    setParsePending(true)
    try {
      const result = await parseResumeAction(caseId)
      if (result.success) {
        toast.success(result.message || "简历解析完成")
        router.refresh()
      } else {
        toast.error(result.error || "简历解析失败")
      }
    } catch (e) {
      toast.error(`解析异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setParsePending(false)
    }
  }

  async function handleBuildEvidence() {
    setEvidencePending(true)
    try {
      const result = await buildProjectCardsAction(caseId)
      if (result.success) {
        toast.success(result.message || "项目证据卡生成完成")
        router.refresh()
      } else {
        toast.error(result.error || "项目证据卡生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setEvidencePending(false)
    }
  }

  async function handleParseJD() {
    setJdPending(true)
    try {
      const result = await parseJDAction(caseId)
      if (result.success) {
        toast.success(result.message || "JD 解析完成")
        router.refresh()
      } else {
        toast.error(result.error || "JD 解析失败")
      }
    } catch (e) {
      toast.error(`解析异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setJdPending(false)
    }
  }

  async function handleGenerateFingerprint() {
    setFpPending(true)
    try {
      const result = await generateFingerprintAction(caseId)
      if (result.success) {
        toast.success(result.message || "职业指纹生成完成")
        router.refresh()
      } else {
        toast.error(result.error || "职业指纹生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setFpPending(false)
    }
  }

  async function handleGeneratePositioning() {
    setPosPending(true)
    try {
      const result = await generatePositioningsAction(caseId)
      if (result.success) {
        toast.success(result.message || "职业定位生成完成")
        router.refresh()
      } else {
        toast.error(result.error || "职业定位生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setPosPending(false)
    }
  }

  async function handleGenerateOutputs() {
    setOutputsPending(true)
    try {
      const result = await generateOutputsAction(caseId)
      if (result.success) {
        toast.success(result.message || "交付物生成完成")
        router.refresh()
      } else {
        toast.error(result.error || "交付物生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setOutputsPending(false)
    }
  }

  async function handleRiskAudit() {
    setRiskPending(true)
    try {
      const result = await auditRisksAction(caseId)
      if (result.success) {
        toast.success(result.message || "风险审查完成")
        router.refresh()
      } else {
        toast.error(result.error || "风险审查失败")
      }
    } catch (e) {
      toast.error(`审查异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setRiskPending(false)
    }
  }

  async function handleGenerateInterview() {
    setInterviewPending(true)
    try {
      const result = await generateInterviewPackAction(caseId)
      if (result.success) {
        toast.success(result.message || "面试准备包生成完成")
        router.refresh()
      } else {
        toast.error(result.error || "面试准备包生成失败")
      }
    } catch (e) {
      toast.error(`生成异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setInterviewPending(false)
    }
  }

  async function handleEvaluateFit() {
    setFitPending(true)
    try {
      const result = await evaluateJobFitAction(caseId)
      if (result.success) {
        toast.success(result.message || "岗位适配判断完成")
        router.refresh()
      } else {
        toast.error(result.error || "岗位适配判断失败")
      }
    } catch (e) {
      toast.error(`判断异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setFitPending(false)
    }
  }

  async function handleQualityReview() {
    setQualityReviewPending(true)
    try {
      const result = await generateQualityReviewAction(caseId)
      if (result.success) {
        toast.success(result.message || "质量对比评审完成")
        router.refresh()
      } else {
        toast.error(result.error || "质量对比评审失败")
      }
    } catch (e) {
      toast.error(`评审异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setQualityReviewPending(false)
    }
  }

  async function handleExportPdf() {
    setExportPdfPending(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/export-pdf`)
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error || "导出 PDF 失败")
        return
      }
      toast.success("PDF 导出成功")
    } catch (e) {
      toast.error(`导出异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setExportPdfPending(false)
    }
  }

  function handleClick(key: string) {
    switch (key) {
      case "parse_resume":
        handleParseResume()
        break
      case "generate_evidence":
        handleBuildEvidence()
        break
      case "parse_jd":
        handleParseJD()
        break
      case "generate_fingerprint":
        handleGenerateFingerprint()
        break
      case "generate_positioning":
        handleGeneratePositioning()
        break
      case "generate_outputs":
        handleGenerateOutputs()
        break
      case "run_risk":
        handleRiskAudit()
        break
      case "generate_interview":
        handleGenerateInterview()
        break
      case "evaluate_job_fit":
        handleEvaluateFit()
        break
      case "generate_quality_review":
        handleQualityReview()
        break
      default:
        toast.info("该功能将在后续版本实现")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Agent 工作流</CardTitle>
        <CardDescription>
          逐步执行 AI 处理任务。
          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            当前: {currentStatus}
          </span>
        </CardDescription>
        {currentIdx < 0 && (
          <p className="text-xs text-destructive mt-1">&ldquo;{currentStatus}&rdquo; 不在工作流中，所有按钮均不可用</p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => {
          const enabled = isAvailable(action.requires)
          const isLoading =
            (action.key === "parse_resume" && parsePending) ||
            (action.key === "generate_evidence" && evidencePending) ||
            (action.key === "parse_jd" && jdPending) ||
            (action.key === "generate_fingerprint" && fpPending) ||
            (action.key === "generate_positioning" && posPending) ||
            (action.key === "evaluate_job_fit" && fitPending) ||
            (action.key === "generate_outputs" && outputsPending) ||
            (action.key === "run_risk" && riskPending) ||
            (action.key === "generate_interview" && interviewPending) ||
            (action.key === "generate_quality_review" && qualityReviewPending)

          return (
            <WorkflowBtn
              key={action.key}
              label={action.label}
              icon={action.icon}
              enabled={enabled}
              loading={isLoading}
              onClick={() => handleClick(action.key)}
            />
          )
        })}

        <Separator className="my-3" />

        <WorkflowBtn label="导出 PDF" icon={Download} enabled={isAvailable("outputs_ready")} loading={exportPdfPending} onClick={handleExportPdf} />
        <WorkflowBtn label="发布个人主页" icon={Globe} enabled={isAvailable("outputs_ready")} loading={false} onClick={() => router.push(`/admin/cases/${caseId}/outputs?tab=profile`)} />
        <WorkflowBtn label="标记已交付" icon={CheckCheck} enabled={isAvailable("interview_ready")} loading={false} onClick={() => toast.info("标记已交付 — 后续版本实现")} />
      </CardContent>
    </Card>
  )
}

function WorkflowBtn({ label, icon: Icon, enabled, loading, onClick }: {
  label: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
  loading: boolean
  onClick: () => void
}) {
  if (enabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "0.5rem",
          borderRadius: "0.375rem",
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          height: "2.25rem",
          padding: "0 0.75rem",
          fontSize: "0.875rem",
          fontWeight: 500,
          width: "100%",
          border: "none",
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Icon className="h-4 w-4 shrink-0" />}
        {loading ? (label.includes("解析") ? "解析中..." : "生成中...") : label}
      </button>
    )
  }
  return (
    <button
      type="button"
      disabled
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: "0.5rem",
        borderRadius: "0.375rem",
        backgroundColor: "hsl(var(--muted))",
        color: "hsl(var(--muted-foreground))",
        height: "2.25rem",
        padding: "0 0.75rem",
        fontSize: "0.875rem",
        fontWeight: 500,
        width: "100%",
        border: "1px solid hsl(var(--border))",
        opacity: 0.4,
        cursor: "not-allowed",
      }}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  )
}
