"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard, exact: true },
  { href: "/admin/cases", label: "案例列表", icon: FolderOpen },
]

const bottomNavItems = [
  { href: "/admin/settings", label: "设置", icon: Settings },
  { href: "/admin/help", label: "帮助", icon: HelpCircle },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border flex flex-col bg-card shrink-0">
        {/* Logo */}
        <div className="h-16 px-4 flex items-center border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
              <Shield className="h-4 w-4 text-background" />
            </div>
            <span className="font-semibold tracking-tight">CareerProof</span>
          </Link>
        </div>

        {/* Main nav */}
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

        {/* Bottom nav */}
        <div className="p-3 space-y-1">
          <Separator className="mb-3" />
          {bottomNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href)

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
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
