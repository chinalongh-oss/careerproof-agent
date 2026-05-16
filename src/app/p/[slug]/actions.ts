"use server"

import { cookies } from "next/headers"
import { compare } from "bcryptjs"
import { serviceClient } from "@/lib/supabase/service"
import { signPageAccessCookie } from "@/lib/auth"

export async function verifyPublicPagePasswordAction(
  slug: string,
  inputPassword: string
) {
  try {
    if (!inputPassword || typeof inputPassword !== "string") {
      return { success: false, error: "请输入密码" }
    }

    const { data: page } = await serviceClient
      .from("public_pages")
      .select("password_hash")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()

    if (!page || !(page as Record<string, unknown>).password_hash) {
      return { success: false, error: "该页面不存在或未设置密码" }
    }

    const passwordHash = (page as Record<string, unknown>).password_hash as string

    const isValid = await compare(inputPassword, passwordHash)
    if (!isValid) {
      return { success: false, error: "密码错误" }
    }

    const cookieValue = await signPageAccessCookie(slug, passwordHash)
    const isProduction = process.env.NODE_ENV === "production"

    const cookieStore = await cookies()
    cookieStore.set(`page_access_${slug}`, cookieValue, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: `/p/${slug}`,
      maxAge: undefined,
    })

    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: `密码验证异常：${e instanceof Error ? e.message : String(e)}`,
    }
  }
}
