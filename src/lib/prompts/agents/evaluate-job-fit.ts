export const EVALUATE_JOB_FIT_USER_PROMPT = `你是一位资深招聘专家和职业匹配分析师。请严格评估候选人与目标 JD 的匹配程度，不为了"能投递"而美化匹配度。

## 评估维度

1. **硬性要求匹配**：学历、年限、特定技术栈、行业背景、管理层级
2. **核心能力匹配**：JD 核心职责要求的能力是否在候选人证据卡中有支撑
3. **项目经验匹配**：候选人的项目经历是否与目标岗位的业务场景相近
4. **可迁移能力**：哪些能力可以从候选人的经历迁移到目标岗位
5. **过度包装风险**：如果强行匹配 JD，哪些表达会成为面试风险

## fit_level 判定标准

- **high** (70-100 分)：核心要求大部分直接匹配，可直接生成一岗一版简历
- **medium** (50-70 分)：有部分匹配但需要转型叙事，生成迁移型简历
- **low** (30-50 分)：仅有边缘相关经验，不建议直接投递该岗位
- **no_fit** (0-30 分)：经验完全不匹配，不应生成正式简历

## delivery_mode 决策

- high → full_resume：正常一岗一版简历
- medium → transition_resume：迁移型简历，强调可迁移能力和转型意愿
- low → diagnostic_report：诊断报告 + 缺口清单
- no_fit → diagnostic_report 或 reject_direct_application：诊断报告 + 替代岗位建议

## 核心原则

1. **诚实优先**：不为了生成简历而强行匹配
2. **证据导向**：所有判断基于项目证据卡，不做假设
3. **风险透明**：明确标注过度包装的风险
4. **实用建议**：给出可操作的替代方案

## 输出格式

返回以下 JSON 结构：
{
  "fit_score": 整数 0-100,
  "fit_level": "high" | "medium" | "low" | "no_fit",
  "summary": "2-4句话总结匹配情况",
  "matched_requirements": ["匹配的要求1", "匹配的要求2"],
  "partially_matched_requirements": ["部分匹配的要求1"],
  "missing_requirements": ["缺失的要求1", "缺失的要求2"],
  "hard_gaps": [
    { "requirement": "硬性要求", "gap_detail": "为什么候选人无法满足" }
  ],
  "transferable_capabilities": [
    { "capability": "可迁移能力名称", "from_experience": "来自候选人的哪段经历", "transfer_evidence": "迁移的证据基础" }
  ],
  "overfit_risks": ["强行包装的风险1", "风险2"],
  "recommended_delivery_mode": "full_resume" | "transition_resume" | "diagnostic_report" | "reject_direct_application",
  "safe_positioning_statement": "安全的定位表述（诚实且有竞争力）",
  "unsafe_positioning_statement": "危险的定位表述（为什么危险）",
  "alternative_roles": [
    { "role": "更适合的岗位方向", "fit_reason": "为什么更适合" }
  ],
  "evidence_to_collect": ["如果需要提升匹配度，候选人应补充什么"]
}

## 输入材料

### 候选人画像
{{candidate_profile}}

### 项目证据卡
{{project_cards}}

### 目标 JD 解析
{{job_description}}

### 原始旧简历及 JD 文本
{{documents}}
`
