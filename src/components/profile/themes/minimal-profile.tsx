import { EvidenceHighlight } from "../shared/evidence-highlight"
import { ProjectCard } from "../shared/project-card"
import { ContactBlock } from "../shared/contact-block"
import { TrustBadge, TrustLevel } from "../shared/trust-badge"
import type { ProfilePageData } from "../profile-page-renderer"

interface MinimalProfileProps {
  data: ProfilePageData
  trustLevel: TrustLevel | null
  trustReason?: string
}

export function MinimalProfile({ data, trustLevel, trustReason }: MinimalProfileProps) {
  const hero = data.hero
  const hasEvidence = data.evidence_highlights && data.evidence_highlights.length > 0
  const hasProjects = data.featured_projects && data.featured_projects.length > 0
  const hasExperience = data.work_experiences && data.work_experiences.length > 0
  const hasFingerprint = data.career_fingerprint
  const hasContact = data.contact

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-12">
      {/* Hero */}
      <section className="space-y-4">
        {hero?.name && (
          <h1 className="text-3xl font-bold tracking-tight">{hero.name}</h1>
        )}
        {hero?.positioning_title && (
          <p className="text-xl text-muted-foreground">{hero.positioning_title}</p>
        )}
        {hero?.one_line_value && (
          <p className="text-base text-foreground/80 leading-relaxed max-w-prose">
            {hero.one_line_value}
          </p>
        )}
        <TrustBadge level={trustLevel} reason={trustReason} />
        {data.target_roles && data.target_roles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {data.target_roles.map((role, i) => (
              <span key={i} className="inline-flex text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {role}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Evidence Highlights */}
      {hasEvidence && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">证据亮点</h2>
          <div className="divide-y">
            {data.evidence_highlights!.slice(0, 3).map((item, i) => (
              <EvidenceHighlight
                key={i}
                metric={item.metric ?? ""}
                description={item.description ?? ""}
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {hasProjects && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">代表项目</h2>
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
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">工作经历</h2>
          <div className="space-y-4">
            {data.work_experiences!.map((exp, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-sm">{exp.company}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{exp.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{exp.role}</p>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="space-y-0.5 mt-1">
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

      {/* Career Fingerprint */}
      {hasFingerprint && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">职业指纹</h2>
          <div className="text-sm space-y-1.5 text-muted-foreground">
            {data.career_fingerprint!.career_axis && (
              <p>主职业轴：{data.career_fingerprint!.career_axis}</p>
            )}
            {data.career_fingerprint!.secondary_axis && (
              <p>辅助轴：{data.career_fingerprint!.secondary_axis}</p>
            )}
            {data.career_fingerprint!.differentiation_summary && (
              <p className="text-foreground/80">{data.career_fingerprint!.differentiation_summary}</p>
            )}
          </div>
        </section>
      )}

      {/* Contact */}
      {hasContact && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">联系方式</h2>
          <ContactBlock
            email={data.contact?.email}
            wechat={data.contact?.wechat}
            linkedin={data.contact?.linkedin}
          />
        </section>
      )}

      {/* Download */}
      {data.downloadable_resume && (
        <section className="pt-2">
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
