export const GENERATE_POSITIONING_USER_PROMPT = `请基于项目证据卡、目标 JD 和职业指纹，生成 3 个明显不同的职业定位方案。

## 核心原则

1. **必须生成恰好 3 条定位**，不多不少
2. **三种定位必须明显不同**：
   - **业务结果型**：强调指标提升、转化、收入增长、效率优化、成本降低等业务量化结果
   - **产品机制型**：强调机制设计、策略制定、系统化建设、平台化推进等架构和体系建设
   - **跨部门推动/数据诊断型**：强调数据诊断、跨部门协同、口径统一、实验设计、决策支持等信息整合和推动能力
3. **不得添加项目卡之外的新事实**：所有推荐和弱化都以 project_cards 中已有的项目为基础
4. **不得输出不存在的 project id**：recommended_projects 和 weak_projects 必须全部来自 project_cards 中的 id
5. **每条定位必须有 risks**：分析该定位角度可能面临的风险和挑战
6. **JD 是目标上下文，不是候选人事实来源**

## 输出字段说明

每条 positioning 包含：
- **version_name**: 定位版本名（如：业务增长驱动者定位）
- **target_reader**: 目标读者（如：技术VP / HRBP / 业务负责人）
- **career_axis**: 此版本强调的职业轴
- **secondary_axis**: 此版本强调的辅助职业轴
- **one_line_summary**: 一句话定位（20字以内）
- **value_summary**: 价值主张（2-3句话）
- **tone_tags**: 风格标签数组（如：数据说话、结果导向、体系化思维）
- **recommended_projects**: 推荐在此定位下突出的 project id 数组
- **weak_projects**: 建议在此定位下弱化的 project id 数组
- **risks**: 此定位的风险点数组
- **selected**: false（固定为 false，不要设为 true）

## 输入材料

### 项目证据卡（完整 JSON 数组，每条含 id 和 project_name）
{{project_cards}}

### 目标 JD 解析结果（完整 JSON）
{{job_description}}

### 职业指纹（完整 JSON）
{{career_fingerprint}}
`
