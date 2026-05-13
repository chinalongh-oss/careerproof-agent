interface InterviewPrintViewProps {
  candidateName: string | null
  targetRole: string | null
  content: Record<string, unknown> | null
  version: number
  createdAt: string
}

const PRINT_CSS = `
@page {
  size: A4;
  margin: 10mm 12mm;
}

html, body {
  margin: 0;
  padding: 0;
  background: #fff;
  color: #111;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.interview-print-root {
  width: 100%;
  max-width: 186mm;
  margin: 0 auto;
  background: #fff;
  font-family:
    -apple-system, BlinkMacSystemFont,
    "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei",
    Arial, sans-serif;
  font-size: 9.6pt;
  line-height: 1.42;
}

.interview-print-header {
  text-align: center;
  margin-bottom: 4mm;
  break-inside: avoid;
  page-break-inside: avoid;
}

.interview-name {
  font-size: 18pt;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 1.5mm;
  letter-spacing: 0.5px;
}

.interview-target {
  font-size: 9.5pt;
  line-height: 1.35;
  font-weight: 600;
  margin-top: 1mm;
  color: #333;
}

.interview-section {
  margin-bottom: 2mm;
}

.interview-print-root h2 {
  font-size: 11.5pt;
  line-height: 1.2;
  margin: 4mm 0 1.8mm;
  padding-bottom: 1mm;
  border-bottom: 0.6px solid #222;
  font-weight: 700;
  break-after: avoid;
  page-break-after: avoid;
}

.interview-print-root h3 {
  font-size: 10pt;
  margin: 2.5mm 0 1mm;
  font-weight: 600;
  break-after: avoid;
  page-break-after: avoid;
}

.interview-print-root p {
  margin: 0 0 1.2mm;
  line-height: 1.4;
}

.interview-print-root ul, .interview-print-root ol {
  margin: 0 0 2mm 4.5mm;
  padding: 0;
}

.interview-print-root li {
  margin: 0 0 0.8mm;
  padding-left: 0.5mm;
  line-height: 1.38;
}

.interview-print-root strong {
  font-weight: 600;
  color: #111;
}

.risk-card {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 2.5mm;
  padding: 2mm;
  border: 0.5px solid #ddd;
  border-radius: 2mm;
}

.question-card {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 2.5mm;
  padding: 2mm;
  border: 0.5px solid #ddd;
  border-radius: 2mm;
}

@media print {
  .no-print, nav, header, aside, button {
    display: none !important;
  }
  body { background: #fff !important; }
  .interview-print-root { max-width: none; margin: 0; }
}
`

export function InterviewPrintView({
  candidateName,
  targetRole,
  content,
  version,
  createdAt,
}: InterviewPrintViewProps) {
  if (!content) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        fontFamily: "system-ui, sans-serif",
      }}>
        <p style={{ fontSize: "18px", color: "#666" }}>暂未生成面试准备包</p>
      </div>
    )
  }

  const strategy = content.overall_interview_strategy as string | undefined
  const risks = (content.top_risks as Array<{ risk?: string; source?: string; interview_approach?: string }>) ?? []
  const checklist = (content.preparation_checklist as Array<{ item?: string; reason?: string; detail?: string }>) ?? []
  const projQuestions = (content.project_questions as Array<{
    project_name?: string
    project_summary?: string
    why_asked?: string
    answer_structure?: string
    likely_questions?: Array<{ question?: string; context?: string }>
    high_risk_questions?: Array<{ question?: string; risk_source?: string; why_risky?: string }>
    data_to_prepare?: string[]
    do_not_overclaim?: string[]
    suggested_boundary_statement?: string
  }>) ?? []

  return (
    <>
      <style href="print">{PRINT_CSS}</style>

      <article className="interview-print-root" data-render-ready="true">
        <div className="interview-print-header">
          <h1 className="interview-name">{candidateName || "候选人"}</h1>
          {targetRole && (
            <p className="interview-target">目标岗位：{targetRole}</p>
          )}
        </div>

        {strategy && (
          <section className="interview-section">
            <h2>整体面试策略</h2>
            <p style={{ whiteSpace: "pre-wrap" }}>{strategy}</p>
          </section>
        )}

        {risks.length > 0 && (
          <section className="interview-section">
            <h2>主要风险及应对</h2>
            {risks.map((risk, i) => (
              <div key={i} className="risk-card">
                <p><strong>风险：</strong>{risk.risk}</p>
                {risk.source && <p style={{ fontSize: "8pt", color: "#666" }}>来源：{risk.source}</p>}
                {risk.interview_approach && (
                  <p style={{ whiteSpace: "pre-wrap" }}><strong>应对策略：</strong>{risk.interview_approach}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {checklist.length > 0 && (
          <section className="interview-section">
            <h2>准备清单</h2>
            <ol>
              {checklist.map((item, i) => (
                <li key={i}>
                  <strong>{item.item}</strong>
                  {item.detail && <p style={{ fontSize: "8.5pt", color: "#555", marginTop: "0.5mm" }}>{item.detail}</p>}
                  {item.reason && <p style={{ fontSize: "8pt", color: "#888" }}>原因：{item.reason}</p>}
                </li>
              ))}
            </ol>
          </section>
        )}

        {projQuestions.length > 0 && (
          <section className="interview-section">
            <h2>重点项目追问</h2>
            {projQuestions.map((pq, i) => (
              <div key={i} className="question-card">
                <h3>{pq.project_name || `项目 ${i + 1}`}</h3>
                {pq.project_summary && <p style={{ fontSize: "8.5pt", color: "#555" }}>{pq.project_summary}</p>}

                {pq.why_asked && (
                  <p style={{ fontSize: "8.5pt", color: "#666" }}><strong>面试官关注点：</strong>{pq.why_asked}</p>
                )}
                {pq.answer_structure && (
                  <p style={{ fontSize: "8.5pt", color: "#666" }}><strong>推荐回答框架：</strong>{pq.answer_structure}</p>
                )}

                {pq.likely_questions && pq.likely_questions.length > 0 && (
                  <div style={{ margin: "1mm 0" }}>
                    <p style={{ fontWeight: 600, fontSize: "9pt" }}>可能被问到的问题</p>
                    {pq.likely_questions.map((q, qi) => (
                      <p key={qi} style={{ margin: "0.5mm 0" }}>
                        Q: {q.question}
                        {q.context && <span style={{ fontSize: "8pt", color: "#888" }}>（{q.context}）</span>}
                      </p>
                    ))}
                  </div>
                )}

                {pq.high_risk_questions && pq.high_risk_questions.length > 0 && (
                  <div style={{ margin: "1mm 0", color: "#c00" }}>
                    <p style={{ fontWeight: 600, fontSize: "9pt" }}>⚠ 高风险追问</p>
                    {pq.high_risk_questions.map((q, qi) => (
                      <p key={qi} style={{ margin: "0.5mm 0" }}>
                        Q: {q.question}
                        {q.why_risky && <span style={{ fontSize: "8pt" }}>（{q.why_risky}）</span>}
                      </p>
                    ))}
                  </div>
                )}

                {pq.data_to_prepare && pq.data_to_prepare.length > 0 && (
                  <div style={{ margin: "1mm 0" }}>
                    <p style={{ fontWeight: 600, fontSize: "9pt" }}>需准备的数据</p>
                    <ul style={{ margin: "0 0 0 4mm", padding: 0 }}>
                      {pq.data_to_prepare.map((d, di) => <li key={di} style={{ fontSize: "8.5pt" }}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {pq.do_not_overclaim && pq.do_not_overclaim.length > 0 && (
                  <div style={{ margin: "1mm 0" }}>
                    <p style={{ fontWeight: 600, fontSize: "9pt", color: "#c00" }}>⚠ 不要过度声称</p>
                    <ul style={{ margin: "0 0 0 4mm", padding: 0 }}>
                      {pq.do_not_overclaim.map((d, di) => <li key={di} style={{ fontSize: "8.5pt" }}>{d}</li>)}
                    </ul>
                  </div>
                )}

                {pq.suggested_boundary_statement && (
                  <p style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic" }}>
                    <strong>建议边界声明：</strong>{pq.suggested_boundary_statement}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        <p style={{ textAlign: "center", fontSize: "7.5pt", color: "#888", marginTop: "6mm" }}>
          CareerProof AI · Interview Preparation Pack · v{version} ·{" "}
          {new Date(createdAt).toLocaleDateString("zh-CN")}
        </p>
      </article>
    </>
  )
}
