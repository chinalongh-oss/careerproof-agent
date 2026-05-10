export const BUILD_PROJECT_CARDS_USER_PROMPT = `请基于候选人的完整简历上下文、结构化画像和原始项目材料，提取可量化的项目经验，生成项目证据卡。

## 核心原则

1. **不得编造数据**：所有信息必须来源于提供的材料
2. **没有证据的数据 confidence = low**：如果某项指标无法在材料中找到支撑，标注 evidence_level 为 weak
3. **明确个人动作和团队动作**：
   - personal_actions：候选人个人主导、独立完成的动作
   - team_actions：需要团队协作完成的动作
4. **明确可公开程度**：
   - public：可以对外公开的项目
   - internal：仅限内部使用的项目信息
   - confidential：涉及敏感信息，需脱敏处理
5. **识别风险**：
   - overclaim：候选人可能夸大了自己的贡献
   - data_missing：关键数据缺失
   - attribution_unclear：个人贡献与团队成果边界模糊
   - sensitive_info：包含敏感商业信息
   - timeline_unclear：时间线不清晰

## 每张项目卡字段说明

- **project_name**: 项目名称
- **business_context**: 业务背景（1-2句话，说清楚项目所处的业务环境）
- **business_problem**: 要解决的核心业务问题
- **candidate_role**: 候选人在项目中的角色（如：项目负责人、核心开发、技术顾问等）
- **personal_actions**: 候选人个人主导的动作列表
- **team_actions**: 团队协作动作列表
- **metrics**: 项目关键指标，键值对形式，包含数值和单位
- **result_summary**: 项目成果总结（1-2句话）
- **evidence_level**: 证据等级（strong：有明确数据支撑 / medium：有部分数据 / weak：缺乏数据支撑）
- **public_visibility**: 公开程度（public / internal / confidential）
- **risk_flags**: 风险标签数组，从 [overclaim, data_missing, attribution_unclear, sensitive_info, timeline_unclear] 中选择
- **role_angle_tags**: 角色角度标签，如 ["技术Leader", "架构决策者", "从0到1"]
- **reader_lens_tags**: 读者视角标签，如 ["技术VP视角", "业务负责人视角", "HRBP视角"]
- **recommended_expression**: 推荐的表达方式（面试中如何讲述这个项目）
- **not_recommended_expression**: 不推荐的表达方式（面试中应避免的说法）
- **interview_risks**: 面试中可能被追问的风险点，键值对形式

## 输入材料

### 候选人画像（完整 JSON）
{{candidate_profile}}

### 简历原文
{{resume_text}}

### 项目材料原文
{{project_material}}
`
