import "server-only"

import { generateStructuredOutput } from "@/lib/ai"
import { SYSTEM_PROMPT, PROMPT_KEYS } from "@/lib/prompt"
import { ResumeParseSchema } from "@/lib/schemas"
import { PARSE_RESUME_USER_PROMPT } from "@/lib/prompts/agents/parse-resume"
import { serviceClient, normalizeError } from "@/lib/supabase/service"
import { ensureDocumentText } from "@/lib/file-parser"

export async function parseResume(caseId: string) {
  const { data: docs, error: docsError } = await serviceClient
    .from("documents")
    .select("id,case_id,type,raw_text,file_path,mime_type,parse_status")
    .eq("case_id", caseId)

  if (docsError) {
    return { success: false, error: `读取文档失败：${normalizeError(docsError)}` }
  }

  const docsArr = Array.isArray(docs) ? docs : docs ? [docs] : []
  const resumeDoc = docsArr.find((d) => d.type === "resume")
  const materialDoc = docsArr.find((d) => d.type === "project_material")

  if (!resumeDoc) {
    return { success: false, error: "未找到简历文档，请先提交简历" }
  }

  const resumeText = await ensureDocumentText(resumeDoc as Parameters<typeof ensureDocumentText>[0])
  if (!resumeText) {
    return { success: false, error: "无法读取简历文本，请检查文件是否上传成功或手动粘贴文本" }
  }

  const materialText = materialDoc
    ? (await ensureDocumentText(materialDoc as Parameters<typeof ensureDocumentText>[0])) || "无额外项目材料"
    : "无额外项目材料"

  const userPrompt = PARSE_RESUME_USER_PROMPT
    .replace("{{resume_text}}", resumeText)
    .replace("{{project_material}}", materialText)

  const result = await generateStructuredOutput({
    agent_name: "parse_resume",
    case_id: caseId,
    system_prompt: SYSTEM_PROMPT,
    system_prompt_key: PROMPT_KEYS.PARSE_RESUME,
    user_prompt: userPrompt,
    schema_name: "resume_parse",
    schema: ResumeParseSchema,
  })

  if ("error" in result) {
    return { success: false, error: `简历解析失败：${result.error}` }
  }

  const profile = result.data

  const { error: upsertError } = await serviceClient
    .from("candidate_profiles")
    .upsert({
      case_id: caseId,
      personal_info: profile.personal_info ?? null,
      education: profile.education ?? null,
      work_experiences: profile.work_experiences ?? null,
      skills: profile.skills ?? null,
      metrics: profile.metrics ?? null,
      strong_claims: profile.strong_claims ?? null,
      missing_info: profile.missing_info ?? null,
    }, { onConflict: "case_id" })

  if (upsertError) {
    return { success: false, error: `保存解析结果失败：${normalizeError(upsertError)}` }
  }

  const { error: statusError } = await serviceClient
    .from("cases")
    .update({ status: "parsed", updated_at: new Date().toISOString() })
    .eq("id", caseId)

  if (statusError) {
    return { success: false, error: `更新案例状态失败：${normalizeError(statusError)}` }
  }

  return { success: true, message: "简历解析完成" }
}
