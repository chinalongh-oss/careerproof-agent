import { QuickFacts } from "../shared/quick-facts"
import { ProjectCard } from "../shared/project-card"
import { TrustBadge, TrustLevel } from "../shared/trust-badge"
import type { ProfilePageData } from "../profile-page-renderer"

interface HeadhunterQuickviewProfileProps {
  data: ProfilePageData
  trustLevel: TrustLevel | null
  trustReason?: string
}

export function HeadhunterQuickviewProfile({ data, trustLevel, trustReason }: HeadhunterQuickviewProfileProps) {
  const hero = data.hero
  const hasProjects = data.featured_projects && data.featured_projects.length > 0
  const hasCore = data.core_capabilities && data.core_capabilities.length > 0
  const finger = data.career_fingerprint

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Hero + Trust */}
      <section className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            {hero?.name && <h1 className="text-2xl font-bold tracking-tight">{hero.name}</h1>}
            {hero?.positioning_title && <p className="text-base text-muted-foreground">{hero.positioning_title}</p>}
          </div>
          <TrustBadge level={trustLevel} reason={trustReason} />
        </div>
      </section>

      {/* Quick Facts */}
      <section className="bg-muted/30 rounded-xl p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">速览</h2>
        <QuickFacts
          targetRoles={data.target_roles}
          direction={finger?.career_axis}
          highlights={data.core_capabilities?.slice(0, 5)}
        />
      </section>

      {/* Core highlights - bullet style for recruiter copy */}
      {hasCore && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">核心亮点</h2>
          <ul className="space-y-1">
            {data.core_capabilities!.map((cap, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Recommended copy for headhunters */}
      {(hero?.one_line_value || hero?.positioning_title) && (
        <section className="bg-blue-50/50 rounded-xl p-5 border border-blue-200">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-700 mb-2">推荐语（供猎头参考）</h2>
          <div className="space-y-2 text-sm text-blue-900/80">
            {hero?.one_line_value && (
              <p className="leading-relaxed">{hero.one_line_value}</p>
            )}
            {hero?.positioning_title && hero?.one_line_value && (
              <p className="font-medium">{hero.positioning_title}</p>
            )}
            {finger?.differentiation_summary && (
              <p className="leading-relaxed text-blue-900/70">{finger.differentiation_summary}</p>
            )}
          </div>
          {data.trust_notes && data.trust_notes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {data.trust_notes.map((note, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded bg-blue-100/80 text-blue-700">
                  ✓ {note}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Evidence highlights - compact */}
      {data.evidence_highlights && data.evidence_highlights.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">量化证据</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.evidence_highlights.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 font-semibold text-primary">{item.metric}</span>
                <span className="text-muted-foreground">{item.description}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {hasProjects && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-2">代表项目</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Work Experiences - summary only */}
      {data.work_experiences && data.work_experiences.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold border-b pb-2">职业轨迹</h2>
          <div className="space-y-2">
            {data.work_experiences.map((exp, i) => (
              <div key={i} className="flex items-baseline justify-between text-sm">
                <span>
                  <span className="font-medium">{exp.company}</span>
                  <span className="text-muted-foreground ml-1.5">{exp.role}</span>
                </span>
                <span className="text-xs text-muted-foreground">{exp.period}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
