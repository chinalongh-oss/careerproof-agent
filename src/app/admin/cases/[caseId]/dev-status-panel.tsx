"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateCaseStatus } from "./actions"
import { Loader2 } from "lucide-react"

const statusOptions = [
  { value: "new_submitted", label: "新提交" },
  { value: "parsed", label: "简历已解析" },
  { value: "evidence_ready", label: "证据卡已生成" },
  { value: "jd_ready", label: "JD 已解析" },
  { value: "fingerprint_ready", label: "指纹已生成" },
  { value: "positioning_ready", label: "定位已生成" },
  { value: "outputs_ready", label: "交付物已生成" },
  { value: "risk_reviewed", label: "风险审查完成" },
  { value: "interview_ready", label: "面试准备完成" },
  { value: "delivered", label: "已交付" },
  { value: "failed", label: "失败" },
]

export function DevStatusPanel({ caseId, currentStatus }: { caseId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateCaseStatus(caseId, status)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`状态已更新为：${statusOptions.find((s) => s.value === status)?.label}`)
      }
    })
  }

  return (
    <div className="rounded-lg border border-dashed border-destructive/30 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-destructive">开发调试区</span>
        <span className="text-xs text-muted-foreground">— 仅 MVP 阶段使用</span>
      </div>
      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={setStatus} disabled={isPending}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleUpdate} disabled={isPending || status === currentStatus}>
          {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          更新状态
        </Button>
      </div>
    </div>
  )
}
