import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const envPath = resolve(process.cwd(), ".env.local")
try {
  const content = readFileSync(envPath, "utf-8")
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*(?:[A-Za-z0-9_]*))\s*=\s*(.*)$/)
    if (match) {
      const [, key, value] = match
      if (!process.env[key]) {
        process.env[key] = value.trim()
      }
    }
  }
} catch {
  console.error("❌ 无法读取 .env.local")
  process.exit(1)
}

import { generateStructuredOutput } from "../src/lib/ai"
import { SYSTEM_PROMPT } from "../src/lib/prompt"
import { SmokeTestSchema } from "../src/lib/schemas"
import { serviceClient } from "../src/lib/supabase/service"

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("❌ DEEPSEEK_API_KEY 未设置，请在 .env.local 中填入真实密钥")
    process.exit(1)
  }

  console.log(`🔧 LLM Provider: ${process.env.LLM_PROVIDER || "deepseek"}`)
  console.log(`🔧 Model: ${process.env.DEEPSEEK_MODEL || "deepseek-v4-flash"}`)
  console.log(`🔧 Base URL: ${process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"}`)
  console.log("")

  console.log("📋 正在查询最新案例 ...")
  const { data: cases, error: casesError } = await serviceClient
    .from("cases")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)

  if (casesError) {
    console.error(`❌ 查询案例失败: ${casesError.message}`)
    process.exit(1)
  }

  const rows = Array.isArray(cases) ? cases : cases ? [cases] : []
  const latest = rows[0] as { id?: string } | undefined

  if (!latest?.id) {
    console.log("⚠️  数据库中没有案例，请先通过 /submit 创建案例")
    console.log("   脚本将继续运行，但 generation_runs 将不关联 case_id")
  }

  const caseId = latest?.id
  console.log(`📋 case_id: ${caseId || "(无)"}`)
  console.log("")

  console.log("🚀 正在调用 generateStructuredOutput ...")
  const result = await generateStructuredOutput({
    agent_name: "smoke_test",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: "smoke_test",
    user_prompt: '请返回一个 JSON，验证你能正常工作。要求包含 ok=true、message 为 "CareerProof Agent smoke test passed"、risk_flags 为一个空数组。',
    schema_name: "smoke_test",
    schema: SmokeTestSchema,
    temperature: 0,
  })

  if ("error" in result) {
    console.error(`❌ AI 调用失败: ${result.error}`)
    process.exit(1)
  }

  console.log("✅ AI 调用成功!")
  console.log("")
  console.log("📦 解析结果:")
  console.log(JSON.stringify(result.data, null, 2))
  console.log("")
  console.log(`📝 generation_run ID: ${result.run_id}`)

  if (result.run_id) {
    console.log("")
    console.log("📋 正在验证 generation_runs 记录 ...")
    const { data: runData, error: runError } = await serviceClient
      .from("generation_runs")
      .select("id, agent_name, model, input, output, error, created_at")
      .eq("id", result.run_id)
      .single()

    if (runError) {
      console.log(`⚠️  查询 generation_runs 失败: ${runError.message}`)
    } else if (runData) {
      console.log("✅ generation_runs 记录已确认:")
      console.log(JSON.stringify(runData, null, 2))
    } else {
      console.log("⚠️  未找到 generation_runs 记录")
    }
  }

  console.log("")
  console.log("🎉 Smoke test 全部通过!")
}

main().catch((e) => {
  console.error("❌ 未预期的错误:", e)
  process.exit(1)
})
