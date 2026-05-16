import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export function PricingCard({
  title,
  price,
  description,
  features,
  highlighted,
}: {
  title: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`p-6 rounded-lg border ${
        highlighted
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card"
      }`}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p
          className={`text-sm ${
            highlighted ? "text-background/70" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      </div>
      <div className="mb-6">
        <span className="text-3xl font-bold">¥{price}</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle2
              className={`h-4 w-4 mt-0.5 shrink-0 ${
                highlighted ? "text-background/70" : "text-muted-foreground"
              }`}
            />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        className="w-full rounded-full"
        variant={highlighted ? "secondary" : "outline"}
      >
        选择方案
      </Button>
    </div>
  )
}
