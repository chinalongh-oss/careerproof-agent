"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, Loader2 } from "lucide-react"
import { verifyPublicPagePasswordAction } from "./actions"

export function PublicPagePasswordGate({ slug }: { slug: string }) {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await verifyPublicPagePasswordAction(slug, password)
      if (result.success) {
        window.location.reload()
      } else {
        toast.error(result.error || "密码错误")
      }
    } catch (e) {
      toast.error(`验证异常：${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-amber-50 p-3 rounded-full">
              <Lock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-xl">需要密码</CardTitle>
          <CardDescription>此个人主页已设置访问密码，请输入密码查看</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-password">密码</Label>
              <Input
                id="page-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入访问密码"
                autoFocus
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !password}>
              {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Lock className="h-4 w-4 mr-1.5" />}
              {loading ? "验证中..." : "查看主页"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
