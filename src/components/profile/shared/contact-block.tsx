interface ContactBlockProps {
  email?: string
  wechat?: string
  linkedin?: string
}

export function ContactBlock({ email, wechat, linkedin }: ContactBlockProps) {
  const hasAny = email || wechat || linkedin
  if (!hasAny) return null

  return (
    <div className="space-y-1.5 text-sm">
      {email && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs font-medium text-foreground/60 w-12 shrink-0">邮箱</span>
          <span>{email}</span>
        </div>
      )}
      {wechat && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs font-medium text-foreground/60 w-12 shrink-0">微信</span>
          <span>{wechat}</span>
        </div>
      )}
      {linkedin && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-xs font-medium text-foreground/60 w-12 shrink-0">LinkedIn</span>
          <span className="truncate">{linkedin}</span>
        </div>
      )}
    </div>
  )
}
