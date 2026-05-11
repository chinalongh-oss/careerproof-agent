export const GENERATE_PROFILE_PAGE_USER_PROMPT = `请基于候选人的完整资料和选定的职业定位，生成面向 HR、猎头和业务负责人的职业主页结构化内容。

## 个人主页结构

- **hero**：姓名、职业定位（positioning_title）、一句话价值（one_line_value）
- **target_roles**：目标岗位列表
- **core_capabilities**：核心能力列表
- **evidence_highlights**：证据亮点（metric + description）
- **featured_projects**：精选项目（name + context + contribution + result）
- **work_experiences**：工作经历（company + role + period + highlights）
- **career_fingerprint**：职业指纹摘要（career_axis + secondary_axis + differentiation_summary）
- **trust_notes**：信任背书列表（学历、知名公司经历、项目规模等可信度标记）
- **downloadable_resume**：是否有可下载简历
- **contact**：联系方式（email + wechat + linkedin）
- **theme**：页面主题，从 "minimal" / "professional" / "headhunter_quickview" 中选择
- **markdown**：上述内容的一份完整 Markdown 叙事版本，适合阅读而非简历格式

## 核心原则

1. **不能只是 PDF 简历的复制**：职业主页应更注重叙事、证据亮点和职业故事
2. **适合专业读者**：HR、猎头、面试官、业务负责人
3. **三个主题共用同一份结构化数据，只改变信息密度说明**
4. **不编造事实**
5. **项目内容必须来自 project_cards**
6. **JD 是适配上下文，不是候选人事实来源**
7. **信息不足要克制表达**
8. **不要生成花哨作品集风格**，保持专业简洁

## 输出格式

{
  "hero": { "name": "姓名", "positioning_title": "职业定位", "one_line_value": "一句话价值" },
  "target_roles": ["目标岗位1"],
  "core_capabilities": ["核心能力1", "核心能力2"],
  "evidence_highlights": [{ "metric": "指标", "description": "说明" }],
  "featured_projects": [{ "name": "项目名", "context": "背景", "contribution": "个人贡献", "result": "结果" }],
  "work_experiences": [{ "company": "公司", "role": "职位", "period": "时间", "highlights": ["亮点"] }],
  "career_fingerprint": { "career_axis": "主职业轴", "secondary_axis": "辅助轴", "differentiation_summary": "差异化总结" },
  "trust_notes": ["信任点1"],
  "downloadable_resume": true,
  "contact": { "email": "邮箱", "wechat": "微信", "linkedin": "LinkedIn" },
  "theme": "professional",
  "markdown": "完整的 Markdown 叙事版本"
}

## 输入材料

### 候选人画像
{{candidate_profile}}

### 项目证据卡
{{project_cards}}

### 目标 JD 解析
{{job_description}}

### 职业指纹
{{career_fingerprint}}

### 选定定位
{{selected_positioning}}
`
