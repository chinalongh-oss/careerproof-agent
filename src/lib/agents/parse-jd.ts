import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { JDParseSchema } from "@/lib/schemas"
import { PARSE_JD_USER_PROMPT } from "@/lib/prompts/agents/parse-jd"
import { serviceClient, normalizeError } from "@/lib/supabase/service"
import { ensureDocumentText } from "@/lib/file-parser"

export async function parseJD(caseId: string) {
  const { data: docs, error: docsError } = await serviceClient
    .from("documents")
    .select("id,case_id,type,raw_text,file_path,mime_type,parse_status")
    .eq("case_id", caseId)

  if (docsError) {
    return { success: false, error: `读取文档失败：${normalizeError(docsError)}` }
  }

  const docsArr = Array.isArray(docs) ? docs : docs ? [docs] : []
  const jdDoc = docsArr.find((d) => d.type === "jd")

  if (!jdDoc) {
    return { success: false, error: "未找到 JD 文档，请先在案例详情页提交 JD 文件" }
  }

  const jdText = await ensureDocumentText(jdDoc as Parameters<typeof ensureDocumentText>[0])
  if (!jdText) {
    return { success: false, error: "无法读取 JD 文本，请检查文件是否上传成功或手动粘贴文本" }
  }

  const userPrompt = PARSE_JD_USER_PROMPT.replace("{{jd_text}}", jdText)

  const result = await generateStructuredOutput({
    agent_name: "parse_jd",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.PARSE_JD,
    user_prompt: userPrompt,
    schema_name: "jd_parse",
    schema: JDParseSchema,
  })

  if ("error" in result) {
    return { success: false, error: `JD 解析失败：${result.error}` }
  }

  const data = result.data

  const { error: upsertError } = await serviceClient
    .from("job_descriptions")
    .upsert({
      case_id: caseId,
      raw_jd: jdText,
      role_name: data.role_name ?? null,
      company_type: data.company_type ?? null,
      seniority_level: data.seniority_level ?? null,
      core_responsibilities: data.core_responsibilities ?? null,
      required_skills: data.required_skills ?? null,
      hidden_requirements: data.hidden_requirements ?? null,
      keywords: data.keywords ?? null,
      interview_focus: data.interview_focus ?? null,
      resume_strategy: data.resume_strategy ?? null,
      recommended_project_types: data.recommended_project_types ?? null,
      not_recommended_project_types: data.not_recommended_project_types ?? null,
    }, { onConflict: "case_id" })

  if (upsertError) {
    return { success: false, error: `保存 JD 解析结果失败：${normalizeError(upsertError)}` }
  }

  const { error: statusError } = await serviceClient
    .from("cases")
    .update({ status: "jd_ready", updated_at: new Date().toISOString() })
    .eq("id", caseId)

  if (statusError) {
    return { success: false, error: `更新案例状态失败：${normalizeError(statusError)}` }
  }

  return { success: true, message: "JD 解析完成" }
}
