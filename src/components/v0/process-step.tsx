export function ProcessStep({
  number,
  title,
  description,
  isFirst,
  isLast,
}: {
  number: string
  title: string
  description: string
  isFirst?: boolean
  isLast?: boolean
}) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div
          className={`w-px flex-1 ${isFirst ? "bg-transparent" : "bg-border"}`}
        />
        <div className="h-12 w-12 rounded-full border-2 border-foreground bg-background flex items-center justify-center text-sm font-bold shrink-0">
          {number}
        </div>
        <div
          className={`w-px flex-1 ${isLast ? "bg-transparent" : "bg-border"}`}
        />
      </div>
      <div className={`pb-12 ${isLast ? "pb-0" : ""} pt-2`}>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed max-w-md">
          {description}
        </p>
      </div>
    </div>
  )
}
