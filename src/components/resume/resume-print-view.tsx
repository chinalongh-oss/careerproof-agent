import ReactMarkdown from "react-markdown"
import { type NormalizedPersonalInfo, stripMarkdownIdentityBlock } from "@/lib/resume/personal-info"

interface ResumePrintViewProps {
  markdown: string
  personalInfo: NormalizedPersonalInfo
  version: number
  createdAt: string
}

interface ResumeSection {
  title: string
  content: string
  entries: string[]
  isEntrySection: boolean
}

const WORK_SECTION_TITLES = ["工作经历", "工作经验", "职业经历", "工作履历"]
const PROJECT_SECTION_TITLES = ["代表项目", "项目经历", "项目经验", "重点项目"]
const COMPETENCY_TITLES = ["核心能力", "专业能力", "核心竞争力"]

function parseResumeSections(markdown: string): ResumeSection[] {
  const lines = markdown.split("\n")
  const markerLines: { index: number; title: string }[] = []

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^##\s+(.+)/)
    if (m) {
      markerLines.push({ index: i, title: m[1].trim() })
    }
  }

  const sections: ResumeSection[] = []
  for (let i = 0; i < markerLines.length; i++) {
    const start = markerLines[i].index + 1
    const end = i + 1 < markerLines.length ? markerLines[i + 1].index : lines.length
    const content = lines.slice(start, end).join("\n").trim()
    const title = markerLines[i].title

    const isWorkSection = WORK_SECTION_TITLES.some((t) => title.includes(t))
    const isProjectSection = PROJECT_SECTION_TITLES.some((t) => title.includes(t))

    sections.push({
      title,
      content,
      entries: isWorkSection || isProjectSection ? splitEntries(content) : [content],
      isEntrySection: isWorkSection || isProjectSection,
    })
  }

  return sections
}

function splitEntries(content: string): string[] {
  const lines = content.split("\n")
  const result: string[] = []
  let buf: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const isH3 = /^###\s/.test(line)
    const isBoldEntry = /^\*\*.*\|.*\|.*\*\*$/.test(line.trim())

    if (isH3 || isBoldEntry) {
      if (buf.length > 0) {
        result.push(buf.join("\n").trim())
      }
      buf = [line]
    } else {
      buf.push(line)
    }
  }

  if (buf.length > 0) {
    result.push(buf.join("\n").trim())
  }

  return result.length > 0 ? result.filter((e) => e.length > 0) : [content]
}

function buildContactLine(info: NormalizedPersonalInfo): string | null {
  const parts: string[] = []
  if (info.email) parts.push(info.email)
  if (info.wechat) parts.push(`微信：${info.wechat}`)
  if (info.phone) parts.push(info.phone)
  if (info.city) parts.push(info.city)
  return parts.length > 0 ? parts.join(" · ") : null
}

export function ResumePrintView({
  markdown,
  personalInfo,
  version,
  createdAt,
}: ResumePrintViewProps) {
  const bodyMarkdown = stripMarkdownIdentityBlock(markdown) || markdown
  const sections = parseResumeSections(bodyMarkdown)
  const contactLine = buildContactLine(personalInfo)
  const targetDisplay = personalInfo.targetRole || personalInfo.targetDirection || null
  const nameDisplay = personalInfo.name || "候选人姓名未填写"

  return (
    <>
      <style href="print">{PRINT_CSS}</style>

      <article className="resume-print-root" data-render-ready="true">
        <div className="resume-print-header">
          <h1 className="resume-name">{nameDisplay}</h1>
          {targetDisplay && (
            <p className="resume-target">目标岗位：{targetDisplay}</p>
          )}
          {contactLine && (
            <p className="resume-contact">{contactLine}</p>
          )}
          {personalInfo.portfolioLinks && (
            <p className="resume-contact">
              作品链接：{personalInfo.portfolioLinks}
            </p>
          )}
        </div>

        {sections.length === 0 && (
          <div className="resume-section">
            <ReactMarkdown components={bodyComponents}>
              {bodyMarkdown}
            </ReactMarkdown>
          </div>
        )}

        {sections.map((section) => (
          <section key={section.title} className="resume-section">
            <h2>{section.title}</h2>
            {section.isEntrySection ? (
              section.entries.map((entry, ei) => {
                const wrapperClass = PROJECT_SECTION_TITLES.some((t) =>
                  section.title.includes(t)
                )
                  ? "project-card"
                  : "resume-entry"

                const isCompetency = COMPETENCY_TITLES.some((t) =>
                  section.title.includes(t)
                )

                return (
                  <div key={ei} className={wrapperClass}>
                    <ReactMarkdown
                      components={
                        isCompetency ? competencyComponents : entryComponents
                      }
                    >
                      {entry}
                    </ReactMarkdown>
                  </div>
                )
              })
            ) : (
              <ReactMarkdown components={bodyComponents}>
                {section.content}
              </ReactMarkdown>
            )}
          </section>
        ))}

        <footer className="resume-print-footer">
          <p>
            CareerProof AI &middot; v{version} &middot;{" "}
            {new Date(createdAt).toLocaleDateString("zh-CN")}
          </p>
        </footer>
      </article>
    </>
  )
}

const bodyComponents = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h1: ({ children, ...rest }: any) => <h2 {...rest}>{children}</h2>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h2: ({ children, ...rest }: any) => <h2 {...rest}>{children}</h2>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h3: ({ children, ...rest }: any) => <h3 {...rest}>{children}</h3>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h4: ({ children, ...rest }: any) => <h3 {...rest}>{children}</h3>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p: ({ children, ...rest }: any) => <p {...rest}>{children}</p>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ul: ({ children, ...rest }: any) => <ul {...rest}>{children}</ul>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ol: ({ children, ...rest }: any) => <ol {...rest}>{children}</ol>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  li: ({ children, ...rest }: any) => <li {...rest}>{children}</li>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strong: ({ children, ...rest }: any) => <strong {...rest}>{children}</strong>,
  hr: () => <hr className="section-divider" />,
}

const entryComponents = {
  ...bodyComponents,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  h3: ({ children, ...rest }: any) => (
    <p className="resume-entry-title" {...rest}>{children}</p>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p: ({ children, ...rest }: any) => {
    const text = extractText(children)
    if (!text) return <p {...rest}>{children}</p>
    const boldMatch = text.match(/^\*\*(.*?)\*\*$/)
    if (boldMatch) {
      return <p className="resume-entry-title" {...rest}>{boldMatch[1]}</p>
    }
    return <p {...rest}>{children}</p>
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  li: ({ children, ...rest }: any) => {
    const text = extractText(children)
    if (text) {
      const labelMatch = text.match(/^\*\*(.+?)\*\*[：:]\s*(.*)/)
      if (labelMatch) {
        return (
          <li {...rest}>
            <strong>{labelMatch[1]}：</strong>
            {labelMatch[2]}
          </li>
        )
      }
    }
    return <li {...rest}>{children}</li>
  },
}

const competencyComponents = {
  ...bodyComponents,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  li: ({ children, ...rest }: any) => {
    const text = extractText(children)
    if (text) {
      const labelMatch = text.match(/^\*\*(.+?)\*\*[：:]\s*(.*)/)
      if (labelMatch) {
        return (
          <li className="competency-li" {...rest}>
            <strong>{labelMatch[1]}：</strong>
            {labelMatch[2]}
          </li>
        )
      }
    }
    return <li className="competency-li" {...rest}>{children}</li>
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  p: ({ children, ...rest }: any) => (
    <p className="competency-p" {...rest}>{children}</p>
  ),
}

function extractText(children: React.ReactNode): string | null {
  if (typeof children === "string") return children
  if (Array.isArray(children)) {
    return children
      .map((c) => {
        if (typeof c === "string") return c
        if (typeof c === "object" && c !== null && "props" in c) {
          const props = c.props as Record<string, unknown>
          if (props.children) {
            return extractText(props.children as React.ReactNode)
          }
          return ""
        }
        return ""
      })
      .join("")
  }
  if (typeof children === "object" && children !== null && "props" in children) {
    const props = (children as { props?: { children?: React.ReactNode } }).props
    if (props?.children) {
      return extractText(props.children)
    }
  }
  return null
}

const PRINT_CSS = `
@page {
  size: A4;
  margin: 10mm 12mm;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #fff;
  color: #111;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.resume-print-root {
  width: 100%;
  max-width: 186mm;
  margin: 0 auto;
  background: #fff;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    Arial,
    sans-serif;
  font-size: 9.6pt;
  line-height: 1.42;
  letter-spacing: 0;
}

.resume-print-header {
  text-align: center;
  margin-bottom: 4mm;
  break-inside: avoid;
  page-break-inside: avoid;
}

.resume-name {
  font-size: 18pt;
  font-weight: 700;
  line-height: 1.15;
  margin: 0 0 1.5mm;
  letter-spacing: 0.5px;
}

.resume-contact {
  font-size: 8.5pt;
  line-height: 1.35;
  color: #444;
  max-width: 170mm;
  margin: 0 auto 1mm;
  word-break: normal;
  overflow-wrap: anywhere;
}

.resume-target {
  font-size: 9.5pt;
  line-height: 1.35;
  font-weight: 600;
  margin-top: 1mm;
  color: #333;
}

.contact-sep {
  color: #bbb;
}

.resume-section {
  margin-bottom: 2mm;
}

.resume-print-root h2 {
  font-size: 11.5pt;
  line-height: 1.2;
  margin: 4mm 0 1.8mm;
  padding-bottom: 1mm;
  border-bottom: 0.6px solid #222;
  font-weight: 700;
  break-after: avoid;
  page-break-after: avoid;
}

.resume-print-root h3 {
  font-size: 10pt;
  margin: 2.5mm 0 1mm;
  font-weight: 600;
  break-after: avoid;
  page-break-after: avoid;
}

.resume-print-root p {
  margin: 0 0 1.2mm;
  line-height: 1.4;
}

.resume-print-root ul,
.resume-print-root ol {
  margin: 0 0 2mm 4.5mm;
  padding: 0;
}

.resume-print-root li {
  margin: 0 0 0.8mm;
  padding-left: 0.5mm;
  line-height: 1.38;
}

.competency-li {
  margin-bottom: 0.8mm !important;
}

.competency-p {
  margin-bottom: 0.6mm !important;
}

.resume-print-root strong {
  font-weight: 600;
  color: #111;
}

.resume-print-root a {
  color: #444;
  text-decoration: none;
}

.resume-entry {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 2.8mm;
}

.resume-entry-title {
  font-size: 10pt;
  font-weight: 700;
  margin: 0 0 1.2mm !important;
}

.resume-entry ul {
  margin: 0 0 0 4.5mm !important;
  padding: 0 !important;
}

.resume-entry li {
  margin: 0 0 0.9mm !important;
  padding-left: 0.5mm !important;
}

.project-card {
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 2.5mm;
}

.project-card p {
  margin-bottom: 0.8mm;
}

.project-card ul {
  margin: 0 0 1mm 4.5mm !important;
}

.project-card li {
  margin-bottom: 0.6mm !important;
}

.project-card strong {
  font-weight: 700;
}

.section-divider {
  border: none;
  border-top: 1px solid #ddd;
  margin: 6px 0;
}

.resume-print-footer {
  margin-top: 6mm;
  padding-top: 1.5mm;
  border-top: 0.6px solid #ddd;
  text-align: center;
}

.resume-print-footer p {
  font-size: 7.5pt;
  color: #888;
  margin: 0;
}

@media print {
  .no-print,
  nav,
  header,
  aside,
  button,
  a.back-link,
  [data-admin-shell],
  [data-sidebar],
  [data-case-tabs] {
    display: none !important;
  }

  body {
    background: #fff !important;
  }

  .resume-print-root {
    max-width: none;
    margin: 0;
  }

  .resume-entry,
  .project-card {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .resume-print-root h2,
  .resume-print-root h3 {
    break-after: avoid;
    page-break-after: avoid;
  }
}
`
