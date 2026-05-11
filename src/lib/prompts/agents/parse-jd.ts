export const PARSE_JD_USER_PROMPT = `请解析以下目标职位的职位描述（JD），提取结构化信息。

## 核心原则

1. **只做事实提取，不推测，不补充**：JD 写什么就提取什么，不要润色、不要补充、不要推测
2. **区分显性要求和隐性要求**：
   - 显性要求（core_responsibilities / required_skills）：JD 中明确写出的
   - 隐性要求（hidden_requirements）：JD 没说但行业内同级别岗位通常需要的
3. **不得根据 JD 编造候选人经历**：你的任务只是解析 JD，不要推测候选人应该有什么经历
4. **简历定制策略**：基于 JD 分析，给出简历应强调和弱化的方向

## 输出字段说明

- **role_name**: 目标职位名称
- **company_type**: 公司类型（大厂/中型/创业/外企/国企）
- **seniority_level**: 资历要求（P7/P8/P9/总监/VP）
- **core_responsibilities**: 核心职责列表
- **required_skills**: 必备技能，按 category 分组（technical/management/domain）
- **hidden_requirements**: 隐性要求列表（JD 没说但实际需要的）
- **keywords**: 关键词列表
- **interview_focus**: 面试重点，包含 areas 和 likely_questions
- **resume_strategy**: 简历定制策略，包含 emphasize 和 deemphasize
- **recommended_project_types**: 推荐突出的项目类型列表（如：从0到1、大规模系统重构、跨部门推动）
- **not_recommended_project_types**: 不建议突出的项目类型列表

## 输入材料

### JD 文本
{{jd_text}}
`
