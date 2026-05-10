"use client"

import { CheckCircle2, Circle, Clock } from "lucide-react"

const steps = [
  { key: "new_submitted", label: "新提交" },
  { key: "parsed", label: "简历已解析" },
  { key: "evidence_ready", label: "证据卡已生成" },
  { key: "jd_ready", label: "JD 已解析" },
  { key: "fingerprint_ready", label: "指纹已生成" },
  { key: "positioning_ready", label: "定位已生成" },
  { key: "outputs_ready", label: "交付物已生成" },
  { key: "risk_reviewed", label: "风险审查完成" },
  { key: "interview_ready", label: "面试准备完成" },
  { key: "delivered", label: "已交付" },
]

function stepClass(isCompleted: boolean, isCurrent: boolean) {
  if (isCurrent) return "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs bg-primary text-primary-foreground font-medium"
  if (isCompleted) return "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs bg-primary/10 text-primary"
  return "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs bg-muted text-muted-foreground"
}

function connectorClass(isCompleted: boolean, idx: number, currentIdx: number) {
  if (isCompleted && idx < currentIdx) return "h-0.5 w-4 bg-primary/30"
  return "h-0.5 w-4 bg-muted"
}

export function CaseStatusBar({ currentStatus }: { currentStatus: string }) {
  const currentIdx = steps.findIndex((s) => s.key === currentStatus)

  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs font-medium text-muted-foreground mb-3">
        处理进度
        {currentIdx < 0 && <span className="ml-2 text-destructive">（未知状态: {currentStatus}）</span>}
      </p>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {steps.map((step, idx) => {
          const isCompleted = currentIdx >= 0 && idx <= currentIdx
          const isCurrent = step.key === currentStatus

          return (
            <div key={step.key} className="flex items-center gap-1 shrink-0">
              <div className={stepClass(isCompleted, isCurrent)}>
                {isCompleted && !isCurrent ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : isCurrent ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                {step.label}
              </div>
              {idx < steps.length - 1 && (
                <div className={connectorClass(isCompleted, idx, currentIdx)} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
