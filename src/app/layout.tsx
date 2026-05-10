import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CareerProof Agent - 职业凭证智能助手",
  description: "面向中高阶候选人的 AI 职业证据工作台 — 提交简历与 JD，自动生成项目证据卡、职业指纹、定制简历、风险审查、面试准备包",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
