interface QuickFactsProps {
  targetRoles?: string[]
  yearsOfExperience?: string
  direction?: string
  industry?: string
  highlights?: string[]
}

export function QuickFacts({ targetRoles, yearsOfExperience, direction, industry, highlights }: QuickFactsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {targetRoles && targetRoles.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">目标岗位</span>
            <span className="font-medium">{targetRoles.join(" / ")}</span>
          </div>
        )}
        {yearsOfExperience && (
          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">从业年限</span>
            <span className="font-medium">{yearsOfExperience}</span>
          </div>
        )}
        {direction && (
          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">职业方向</span>
            <span className="font-medium">{direction}</span>
          </div>
        )}
        {industry && (
          <div>
            <span className="text-xs text-muted-foreground block mb-0.5">行业</span>
            <span className="font-medium">{industry}</span>
          </div>
        )}
      </div>
      {highlights && highlights.length > 0 && (
        <div>
          <span className="text-xs text-muted-foreground block mb-1.5">核心亮点</span>
          <ul className="space-y-0.5">
            {highlights.map((h, i) => (
              <li key={i} className="text-sm flex items-start gap-1.5">
                <span className="text-primary mt-1">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
