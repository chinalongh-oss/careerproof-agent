import { NextResponse } from "next/server"
import { serviceClient } from "@/lib/supabase/service"

export async function GET() {
  const results: Record<string, unknown> = {}

  // Test 1: Read
  const { data: readData, error: readError } = await serviceClient
    .from("cases")
    .select("id")
    .limit(1)
  results.read = readError ? { error: readError.message } : { ok: true, data: readData }

  // Test 2: Insert
  const testName = `__test_${Date.now()}`
  const { data: insertData, error: insertError } = await serviceClient
    .from("cases")
    .insert({
      candidate_name: testName,
      status: "new_submitted",
    })
    .select("id")
    .single()

  if (insertError) {
    results.insert = { error: insertError.message }
  } else {
    results.insert = { ok: true, id: insertData?.id }
    if (insertData?.id) {
      await serviceClient.from("cases").delete().eq("id", insertData.id)
    }
  }

  results.jwt_present = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  results.url = process.env.NEXT_PUBLIC_SUPABASE_URL

  return NextResponse.json(results)
}
