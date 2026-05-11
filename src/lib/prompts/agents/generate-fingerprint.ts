export const GENERATE_FINGERPRINT_USER_PROMPT = `请基于候选人的结构化画像、项目证据卡和目标 JD，生成职业指纹。

## 核心原则

1. **基于候选人资料和项目卡生成指纹**：所有分析必须以提供的 candidate_profiles 和 project_cards 为依据
2. **JD 只用于判断岗位匹配方向**：JD 说明目标岗位需要什么，不是候选人已有的能力，不要将 JD 要求当作候选人事实
3. **不编造数据**：不编造项目、成果、技能、风格。信息不足时记录在 not_recommended_positioning 中
4. **signature_projects 存 project id 数组**：只引用输入材料中存在的 project id
5. **差异化总结要具体**：不是泛泛的"技术能力强"，而是基于实际项目卡的具体特征

## 输出字段说明

- **career_axis**: 主职业轴（技术深度型 / 业务驱动型 / 团队管理型 / 产品技术型 / 数据驱动型 / 综合型）
- **secondary_axis**: 辅助职业轴
- **decision_style**: 决策风格（data-driven / intuition-driven / consensus-driven / authoritative）
- **expression_style**: 表达风格（简明直接 / 数据论证 / 愿景驱动 / 案例说服）
- **differentiation_summary**: 与其他同级候选人的差异化总结（2-3句话，具体，基于项目卡）
- **signature_projects**: 最能代表候选人能力的 project id 数组
- **not_recommended_positioning**: 不推荐的定位方向列表（基于候选人实际 weak points）

## 输入材料

### 候选人有画（完整 JSON）
{{candidate_profile}}

### 项目证据卡（完整 JSON 数组）
{{project_cards}}

### 目标 JD 解析结果（完整 JSON）
{{job_description}}
`
