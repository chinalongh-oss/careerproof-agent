export const PARSE_RESUME_USER_PROMPT = `请从以下候选人的原始简历和项目材料中提取结构化信息。

## 核心原则

1. **只做事实提取，不优化，不美化**：简历写什么就提取什么，不要润色、不要补充、不要推测
2. **不编造数据**：不编造公司、职位、学历、项目、数据。如果简历没有明确说明，不要推断
3. **识别强表述**：识别简历中"主导、Owner、公司级、千万级、从 0 到 1、战略、负责、统筹"等强表述词汇
4. **识别所有数字指标**：提取所有可量化的数字，包括金额、百分比、人数、时间周期、规模等
5. **缺失信息标记**：缺少时间、范围、来源、数据支撑的信息放入 missing_info

## 输出字段说明

- **personal_info**: 姓名、邮箱、电话、城市、LinkedIn 等基本信息
- **education**: 学历信息数组，每项包含 school, degree, major, start, end
- **work_experiences**: 工作经历数组，每项包含 company, role, start, end, highlights（亮点列表）, industry, team_size
- **skills**: 技能分类，包含 technical（技术）, management（管理）, domain（领域）, languages（语言）等
- **metrics**: 全局量化指标，如 total_years（总工作年限）, management_years（管理年限）, max_team_size（最大团队规模）, project_count（项目数量）
- **strong_claims**: 强表述集合，claims 为数组，evidence_quality 标记 overall 可信度（high/medium/low）
- **missing_info**: 缺失信息列表，标注哪些关键信息在原始材料中找不到

## 输入材料

### 简历文本
{{resume_text}}

### 项目材料
{{project_material}}
`
