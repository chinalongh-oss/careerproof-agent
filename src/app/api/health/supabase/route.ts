import { NextResponse } from "next/server"
import { serviceClient } from "@/lib/supabase/service"

export async function GET() {
  let dbStatus: "ok" | "error" = "error"
  let errorMessage: string | null = null
  let caseCount = 0

  try {
    const { data, error } = await serviceClient
      .from("cases")
      .select("id")

    if (error) {
      errorMessage = error.message
    } else {
      dbStatus = "ok"
      caseCount = Array.isArray(data) ? data.length : 0
    }
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    ok: dbStatus === "ok",
    timestamp: new Date().toISOString(),
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL || "not set",
    database: dbStatus,
    cases_count: caseCount,
    error: errorMessage,
  })
}
