interface EvidenceHighlightProps {
  metric: string
  description: string
}

export function EvidenceHighlight({ metric, description }: EvidenceHighlightProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="shrink-0 inline-flex items-center justify-center min-w-[4rem] px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
        {metric}
      </span>
      <span className="text-sm text-foreground/80 leading-relaxed">{description}</span>
    </div>
  )
}
