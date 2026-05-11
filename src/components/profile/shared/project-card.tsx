interface ProjectCardProps {
  name: string
  context?: string
  contribution?: string
  result?: string
}

export function ProjectCard({ name, context, contribution, result }: ProjectCardProps) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <h3 className="font-semibold text-sm">{name}</h3>
      {context && (
        <p className="text-xs text-muted-foreground leading-relaxed">{context}</p>
      )}
      {contribution && (
        <div>
          <span className="text-xs font-medium text-foreground/60">个人贡献：</span>
          <span className="text-xs text-foreground/80">{contribution}</span>
        </div>
      )}
      {result && (
        <div>
          <span className="text-xs font-medium text-foreground/60">成果：</span>
          <span className="text-xs text-foreground/80">{result}</span>
        </div>
      )}
    </div>
  )
}
