"use server"

import { cookies } from "next/headers"
import { signAdminCookie, getAdminPassword } from "@/lib/auth"

const COOKIE_NAME = "admin_token"

export async function loginAction(password: string) {
  try {
    if (!process.env.ADMIN_PASSWORD) {
      return { success: false, error: "服务器配置错误：ADMIN_PASSWORD 未设置" }
    }

    if (!password || typeof password !== "string") {
      return { success: false, error: "请输入密码" }
    }

    const correctPassword = getAdminPassword()
    if (password !== correctPassword) {
      return { success: false, error: "密码错误" }
    }

    const cookieValue = signAdminCookie()
    const isProduction = process.env.NODE_ENV === "production"

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: undefined,
    })

    return { success: true }
  } catch (e) {
    return { success: false, error: `登录异常：${e instanceof Error ? e.message : String(e)}` }
  }
}
