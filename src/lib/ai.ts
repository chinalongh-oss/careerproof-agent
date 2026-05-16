import "server-only"

import OpenAI from "openai"
import * as z from "zod"
import { serviceClient } from "@/lib/supabase/service"
import { PROMPT_VERSION } from "@/lib/prompt"

function getDeepseekConfig() {
  const apiKey = process.env.DEEPSEEK_API_KEY
  const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com"
  const model = process.env.DEEPSEEK_MODEL || process.env.OPENAI_MODEL || "deepseek-v4-flash"
  return { apiKey, baseURL, model }
}

function getDeepseekClient(): OpenAI | null {
  const { apiKey, baseURL } = getDeepseekConfig()
  if (!apiKey) return null
  return new OpenAI({ baseURL, apiKey })
}

async function sha256hex(input: string): Promise<string> {
  const enc = new TextEncoder()
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(input) as BufferSource)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

type GenerationInput = {
  provider: string
  model: string
  agent_name: string
  schema_name: string
  prompt_version: string
  system_prompt_key: string
  user_prompt_length: number
  user_prompt_preview: string
  input_sha256: string
  max_tokens: number
}

type GenerationOutput = {
  raw_content: string
  parsed_data: unknown
}

async function logRun(
  caseId: string | undefined,
  agentName: string,
  model: string,
  input: GenerationInput,
  output: GenerationOutput | null,
  error: string | null,
  runStatus?: string,
  startedAt?: string,
  finishedAt?: string,
  durationMs?: number
): Promise<string> {
  try {
    const { data, error: insertError } = await serviceClient
      .from("generation_runs")
      .insert({
        case_id: caseId ?? null,
        agent_name: agentName,
        model,
        input: input as unknown as Record<string, unknown>,
        output: output as unknown as Record<string, unknown> | null,
        error,
        status: runStatus ?? (error ? "failed" : "completed"),
        started_at: startedAt ?? null,
        finished_at: finishedAt ?? null,
        duration_ms: durationMs ?? null,
      })
      .select("id")
      .single()

    if (insertError) return ""
    return (data as { id: string } | null)?.id ?? ""
  } catch {
    return ""
  }
}

function buildSchemaText(schema: z.ZodObject<z.ZodRawShape>): string {
  try {
    const jsonSchema = z.toJSONSchema(schema, {
      target: "draft-07",
      unrepresentable: "any",
    })
    return JSON.stringify(jsonSchema, null, 2)
  } catch {
    return JSON.stringify(schema.shape, null, 2)
  }
}

function buildUserPrompt(userPrompt: string, schema: z.ZodObject<z.ZodRawShape>): string {
  const schemaText = buildSchemaText(schema)
  return `${userPrompt}\n\n请严格按照以下 JSON 格式返回结果，只返回 JSON，不要包含其他文字：\n\`\`\`json\n${schemaText}\n\`\`\``
}

function stripNulls(value: unknown): unknown {
  if (value === null) return undefined
  if (Array.isArray(value)) return value.map(stripNulls)
  if (typeof value === "object") {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = stripNulls(v)
      if (cleaned !== undefined) {
        result[k] = cleaned
      }
    }
    return result
  }
  return value
}

export async function generateStructuredOutput<T extends z.ZodObject<z.ZodRawShape>>(opts: {
  agent_name: string
  case_id?: string
  system_prompt: string
  system_prompt_key: string
  user_prompt: string
  schema_name: string
  schema: T
  temperature?: number
  max_tokens?: number
}): Promise<{ data: z.infer<T>; run_id: string } | { error: string }> {
  const cfg = getDeepseekConfig()
  const deepseek = getDeepseekClient()

  if (!deepseek) {
    if (!cfg.apiKey && !cfg.baseURL) {
      return { error: "AI 服务未配置：DEEPSEEK_API_KEY 和 DEEPSEEK_BASE_URL 环境变量均未设置" }
    }
    if (!cfg.apiKey) {
      return { error: "AI 服务未配置：DEEPSEEK_API_KEY 环境变量未设置，请在 .env.local 中配置" }
    }
    return { error: "AI 服务未配置：DEEPSEEK_BASE_URL 环境变量未设置" }
  }

  const model = cfg.model
  const provider = process.env.LLM_PROVIDER || "deepseek"
  const maxTokens = opts.max_tokens ?? 4096

  const userPromptPreview = opts.user_prompt.slice(0, 200)
  const inputSha256 = await sha256hex(opts.user_prompt)

  const inputLog: GenerationInput = {
    provider,
    model,
    agent_name: opts.agent_name,
    schema_name: opts.schema_name,
    prompt_version: PROMPT_VERSION,
    system_prompt_key: opts.system_prompt_key,
    user_prompt_length: opts.user_prompt.length,
    user_prompt_preview: userPromptPreview,
    input_sha256: inputSha256,
    max_tokens: maxTokens,
  }

  const finalUserPrompt = buildUserPrompt(opts.user_prompt, opts.schema)
  const startedAt = new Date().toISOString()

  try {
    const completion = await deepseek.chat.completions.create({
      model,
      temperature: opts.temperature ?? 0.3,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: opts.system_prompt },
        { role: "user", content: finalUserPrompt },
      ],
    })

    const rawContent = completion.choices[0]?.message?.content

    if (!rawContent) {
      const errMsg = "AI 返回内容为空"
      const finishedAt = new Date().toISOString()
      await logRun(opts.case_id, opts.agent_name, model, inputLog, null, errMsg, "failed", startedAt, finishedAt, new Date(finishedAt).getTime() - new Date(startedAt).getTime())
      return { error: errMsg }
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      const errMsg = "AI 返回内容不是合法 JSON"
      const finishedAt = new Date().toISOString()
      await logRun(
        opts.case_id,
        opts.agent_name,
        model,
        inputLog,
        { raw_content: rawContent, parsed_data: null },
        errMsg,
        "failed",
        startedAt,
        finishedAt,
        new Date(finishedAt).getTime() - new Date(startedAt).getTime()
      )
      return { error: errMsg }
    }

    const sanitized = stripNulls(parsed)

    const result = opts.schema.safeParse(sanitized)

    if (!result.success) {
      const errMsg = `Zod 校验失败：${result.error.message}`
      const finishedAt = new Date().toISOString()
      await logRun(
        opts.case_id,
        opts.agent_name,
        model,
        inputLog,
        { raw_content: rawContent, parsed_data: parsed },
        errMsg,
        "failed",
        startedAt,
        finishedAt,
        new Date(finishedAt).getTime() - new Date(startedAt).getTime()
      )
      return { error: errMsg }
    }

    const finishedAt = new Date().toISOString()
    const runId = await logRun(
      opts.case_id,
      opts.agent_name,
      model,
      inputLog,
      { raw_content: rawContent, parsed_data: result.data },
      null,
      "completed",
      startedAt,
      finishedAt,
      new Date(finishedAt).getTime() - new Date(startedAt).getTime()
    )

    return { data: result.data as z.infer<T>, run_id: runId }
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e)
    const finishedAt = new Date().toISOString()
    await logRun(opts.case_id, opts.agent_name, model, inputLog, null, errMsg, "failed", startedAt, finishedAt, new Date(finishedAt).getTime() - new Date(startedAt).getTime())
    return { error: errMsg }
  }
}
