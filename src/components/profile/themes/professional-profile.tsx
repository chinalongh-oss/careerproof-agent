import { EvidenceHighlight } from "../shared/evidence-highlight"
import { ProjectCard } from "../shared/project-card"
import { ContactBlock } from "../shared/contact-block"
import { TrustBadge, TrustLevel } from "../shared/trust-badge"
import type { ProfilePageData } from "../profile-page-renderer"

interface ProfessionalProfileProps {
  data: ProfilePageData
  trustLevel: TrustLevel
  trustReason?: string
}

export function ProfessionalProfile({ data, trustLevel, trustReason }: ProfessionalProfileProps) {
  const hero = data.hero
  const hasCore = data.core_capabilities && data.core_capabilities.length > 0
  const hasExperience = data.work_experiences && data.work_experiences.length > 0
  const hasProjects = data.featured_projects && data.featured_projects.length > 0
  const hasFingerprint = data.career_fingerprint
  const hasContact = data.contact

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="mb-10">
        {hero?.name && <h1 className="text-3xl font-bold tracking-tight mb-1">{hero.name}</h1>}
        {hero?.positioning_title && <p className="text-lg text-muted-foreground mb-2">{hero.positioning_title}</p>}
        {hero?.one_line_value && <p className="text-sm text-foreground/70 max-w-2xl">{hero.one_line_value}</p>}
        <div className="mt-3">
          <TrustBadge level={trustLevel} reason={trustReason} />
        </div>
        {data.trust_notes && data.trust_notes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {data.trust_notes.map((note, i) => (
              <span key={i} className="inline-flex text-xs px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                {note}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <aside className="space-y-8">
          {/* Core Capabilities */}
          {hasCore && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">核心能力</h2>
              <ul className="space-y-1.5">
                {data.core_capabilities!.map((cap, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1 shrink-0">•</span>
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Career Fingerprint */}
          {hasFingerprint && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">职业指纹</h2>
              <div className="text-sm space-y-1.5 text-muted-foreground">
                {data.career_fingerprint!.career_axis && <p>主：{data.career_fingerprint!.career_axis}</p>}
                {data.career_fingerprint!.secondary_axis && <p>辅：{data.career_fingerprint!.secondary_axis}</p>}
                {data.career_fingerprint!.differentiation_summary && (
                  <p className="text-foreground/80 mt-2 leading-relaxed">{data.career_fingerprint!.differentiation_summary}</p>
                )}
              </div>
            </section>
          )}

          {/* Contact */}
          {hasContact && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">联系方式</h2>
              <ContactBlock
                email={data.contact?.email}
                wechat={data.contact?.wechat}
                linkedin={data.contact?.linkedin}
              />
            </section>
          )}
        </aside>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Featured Projects */}
          {hasProjects && (
            <section>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">代表项目</h2>
              <div className="space-y-3">
                {data.featured_projects!.map((proj, i) => (
                  <ProjectCard
                    key={i}
                    name={proj.name ?? `项目 ${i + 1}`}
                    context={proj.context}
                    contribution={proj.contribution}
                    result={proj.result}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Work Experiences */}
          {hasExperience && (
            <section>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">工作经历</h2>
              <div className="space-y-5">
                {data.work_experiences!.map((exp, i) => (
                  <div key={i}>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <div>
                        <span className="font-semibold text-sm">{exp.company}</span>
                        <span className="text-muted-foreground text-sm mx-2">|</span>
                        <span className="text-sm text-muted-foreground">{exp.role}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{exp.period}</span>
                    </div>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="space-y-0.5">
                        {exp.highlights.map((h, j) => (
                          <li key={j} className="text-sm text-foreground/70 pl-3 relative before:content-['—'] before:absolute before:left-0 before:text-muted-foreground">
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Evidence Highlights */}
          {data.evidence_highlights && data.evidence_highlights.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold border-b pb-2 mb-4">可信说明</h2>
              <div className="divide-y">
                {data.evidence_highlights.map((item, i) => (
                  <EvidenceHighlight
                    key={i}
                    metric={item.metric ?? ""}
                    description={item.description ?? ""}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {data.downloadable_resume && (
        <section className="mt-10 text-center">
          <button
            disabled
            className="text-sm text-muted-foreground/50 border border-dashed rounded px-4 py-2 cursor-not-allowed"
          >
            PDF 下载（暂不可用）
          </button>
        </section>
      )}
    </div>
  )
}
