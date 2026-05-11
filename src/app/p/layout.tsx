import Link from "next/link"
import { Shield } from "lucide-react"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-base font-bold">CareerProof</span>
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          CareerProof 职业凭证 · 内容由候选人授权分享
        </div>
      </footer>
    </div>
  )
}
