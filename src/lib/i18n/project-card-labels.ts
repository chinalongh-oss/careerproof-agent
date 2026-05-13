export const FIELD_LABELS: Record<string, string> = {
  personal_actions: "个人动作",
  team_actions: "团队动作",
  metrics: "指标",
  risk_flags: "风险标签",
  role_angle_tags: "角色视角标签",
  reader_lens_tags: "读者视角标签",
  interview_risks: "面试风险",
}

export const RISK_FLAG_LABELS: Record<string, string> = {
  overclaim: "夸大表达",
  data_missing: "数据缺失",
  attribution_unclear: "归因不清",
  sensitive_info: "敏感信息",
  timeline_unclear: "时间线不清",
  generic_expression: "同质化表达",
  timeline_conflict: "时间线冲突",
  jd_mismatch: "岗位不匹配",
  evidence_missing: "证据缺失",
}

export function translateRiskFlag(flag: string): string {
  return RISK_FLAG_LABELS[flag] ?? flag
}

export function translateRiskFlags(flags: unknown): unknown {
  if (!flags) return flags
  if (Array.isArray(flags)) {
    return flags.map((f) => (typeof f === "string" ? translateRiskFlag(f) : f))
  }
  if (typeof flags === "object") {
    const translated: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(flags as Record<string, unknown>)) {
      const labelKey = translateRiskFlag(key)
      translated[labelKey] = typeof value === "string" ? translateRiskFlag(value) : value
    }
    return translated
  }
  return flags
}
