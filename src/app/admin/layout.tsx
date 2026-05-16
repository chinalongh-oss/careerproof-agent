"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderOpen,
  Shield,
  ChevronLeft,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard, exact: true },
  { href: "/admin/cases", label: "案例列表", icon: FolderOpen },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-56 border-r flex flex-col bg-card shrink-0">
        <div className="h-14 px-4 flex items-center border-b">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
              <Shield className="h-3.5 w-3.5 text-background" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CareerProof</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 space-y-1">
          <Separator className="mb-3" />
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
