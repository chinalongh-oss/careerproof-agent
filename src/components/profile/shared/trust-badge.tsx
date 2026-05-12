import { Badge } from "@/components/ui/badge"
import { ShieldCheck, ShieldAlert, ShieldOff } from "lucide-react"

export type TrustLevel = "已审查" | "需说明" | "已脱敏" | "未审查"

interface TrustBadgeProps {
  level: TrustLevel
  reason?: string
}

const config: Record<TrustLevel, { icon: typeof ShieldCheck; variant: "default" | "secondary" | "destructive"; className: string }> = {
  "已审查": {
    icon: ShieldCheck,
    variant: "default",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  "已脱敏": {
    icon: ShieldOff,
    variant: "secondary",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  "需说明": {
    icon: ShieldAlert,
    variant: "destructive",
    className: "bg-amber-100 text-amber-800 border-amber-300",
  },
  "未审查": {
    icon: ShieldAlert,
    variant: "destructive",
    className: "bg-gray-100 text-gray-600 border-gray-300",
  },
}

export function TrustBadge({ level, reason }: TrustBadgeProps) {
  const { icon: Icon, className } = config[level]

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={`gap-1 px-2.5 py-1 text-xs font-medium border ${className}`} variant="outline">
        <Icon className="h-3.5 w-3.5" />
        {level}
      </Badge>
      {reason && (
        <span className="text-xs text-muted-foreground">{reason}</span>
      )}
    </div>
  )
}
