export const GENERATE_INTERVIEW_PACK_USER_PROMPT = `请基于候选人的最终简历、项目证据卡、风险审查结果和选定的职业定位，生成一份面试准备包。

## 核心原则

1. **不是泛泛的面试题大全**：所有问题必须基于候选人的具体经验和项目
2. **基于证据**：每个问题必须能够从输入材料中找到依据
3. **对高风险表达生成追问**：凡是 evidence_level 不是 strong、或 risk_issues 中有相关风险的，都要生成追问
4. **对数据缺失生成准备清单**：凡是 metrics 或 result_summary 不清晰的，要提醒候选人准备数据
5. **对归因不清生成回答边界**：凡是 personal_actions 和 team_actions 边界模糊的，要给出生涯
6. **不帮助编造经历**：所有建议必须基于已有材料
7. **不帮助规避背调**：不提供如何粉饰或规避背调的建议

## 输出结构

{
  "overall_interview_strategy": "整体面试策略（2-3段），基于候选人的强项、弱项、定位策略，给出面试中的主线思路",
  "top_risks": [
    {
      "risk": "风险描述",
      "source": "来源于 risk_issues 或 project_cards.risk_flags",
      "interview_approach": "面试中如何处理该风险"
    }
  ],
  "preparation_checklist": [
    {
      "item": "准备项",
      "reason": "为什么需要准备",
      "detail": "具体准备什么数据或材料"
    }
  ],
  "project_questions": [
    {
      "project_name": "项目名称",
      "project_summary": "项目一句话总结",
      "likely_questions": [
        {
          "question": "面试官可能问的问题",
          "context": "为什么问这个问题"
        }
      ],
      "high_risk_questions": [
        {
          "question": "高风险追问",
          "risk_source": "风险来源",
          "why_risky": "为什么有风险"
        }
      ],
      "why_asked": "面试官为什么关心这个项目",
      "answer_structure": "推荐的回答框架（STAR 等）",
      "data_to_prepare": ["需要准备的具体数据"],
      "do_not_overclaim": ["不要过度声称的点"],
      "suggested_boundary_statement": "当被问到无法回答的问题时，建议的边界声明"
    }
  ]
}

## 输入材料

### 最终简历
{{resume_markdown}}

### 项目证据卡
{{project_cards}}

### 风险问题
{{risk_issues}}

### 目标 JD 解析
{{job_description}}

### 选定职业定位
{{selected_positioning}}
`
