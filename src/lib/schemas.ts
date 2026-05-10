import { z } from "zod"

export const ResumeParseSchema = z.looseObject({
  personal_info: z.record(z.string(), z.unknown()).optional(),
  education: z.array(z.record(z.string(), z.unknown())).optional(),
  work_experiences: z.array(
    z.looseObject({
      company: z.string().optional(),
      role: z.string().optional(),
      start: z.string().optional(),
      end: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      industry: z.string().optional(),
      team_size: z.union([z.string(), z.number()]).optional(),
    })
  ).optional(),
  skills: z.unknown().optional(),
  metrics: z.unknown().optional(),
  strong_claims: z.unknown().optional(),
  missing_info: z.unknown().optional(),
})

export type ResumeParseOutput = z.infer<typeof ResumeParseSchema>

export const EvidenceCardSchema = z.object({
  project_name: z.string(),
  business_context: z.string().optional(),
  business_problem: z.string().optional(),
  candidate_role: z.string().optional(),
  personal_actions: z.array(z.string()).optional(),
  team_actions: z.array(z.string()).optional(),
  metrics: z.record(z.string(), z.unknown()).optional(),
  result_summary: z.string().optional(),
  evidence_level: z.string().optional(),
  public_visibility: z.string().optional(),
  risk_flags: z.array(z.string()).optional(),
  role_angle_tags: z.array(z.string()).optional(),
  reader_lens_tags: z.array(z.string()).optional(),
  recommended_expression: z.string().optional(),
  not_recommended_expression: z.string().optional(),
  interview_risks: z.record(z.string(), z.unknown()).optional(),
})

export const EvidenceCardsOutputSchema = z.object({
  projects: z.array(EvidenceCardSchema),
})

export type EvidenceCardsOutput = z.infer<typeof EvidenceCardsOutputSchema>

export const JDParseSchema = z.looseObject({
  role_name: z.string().optional(),
  company_type: z.string().optional(),
  seniority_level: z.string().optional(),
  core_responsibilities: z.array(z.string()).optional(),
  required_skills: z.record(z.string(), z.unknown()).optional(),
  hidden_requirements: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  interview_focus: z.record(z.string(), z.unknown()).optional(),
  resume_strategy: z.record(z.string(), z.unknown()).optional(),
})

export type JDParseOutput = z.infer<typeof JDParseSchema>

export const FingerprintSchema = z.object({
  career_axis: z.string().optional(),
  secondary_axis: z.string().optional(),
  decision_style: z.string().optional(),
  expression_style: z.string().optional(),
  differentiation_summary: z.string().optional(),
  signature_projects: z.array(z.string()).optional(),
  not_recommended_positioning: z.array(z.string()).optional(),
})

export type FingerprintOutput = z.infer<typeof FingerprintSchema>

export const PositioningItemSchema = z.object({
  version_name: z.string().optional(),
  target_reader: z.string().optional(),
  career_axis: z.string().optional(),
  one_line_summary: z.string().optional(),
  value_summary: z.string().optional(),
  tone_tags: z.array(z.string()).optional(),
  recommended_projects: z.array(z.string()).optional(),
  weak_projects: z.array(z.string()).optional(),
  risks: z.array(z.string()).optional(),
})

export const PositioningsOutputSchema = z.object({
  positionings: z.array(PositioningItemSchema),
})

export type PositioningsOutput = z.infer<typeof PositioningsOutputSchema>

export const ResumeOutputSchema = z.object({
  title: z.string().optional(),
  markdown: z.string(),
  sections: z.record(z.string(), z.unknown()).optional(),
})

export type ResumeOutput = z.infer<typeof ResumeOutputSchema>

export const RiskIssueSchema = z.object({
  risk_type: z.string().optional(),
  risk_level: z.string().optional(),
  source_text: z.string().optional(),
  reason: z.string().optional(),
  suggestion: z.string().optional(),
  safer_rewrite: z.string().optional(),
})

export const RiskReviewOutputSchema = z.object({
  issues: z.array(RiskIssueSchema),
})

export type RiskReviewOutput = z.infer<typeof RiskReviewOutputSchema>

export const InterviewPrepSchema = z.object({
  title: z.string().optional(),
  markdown: z.string(),
  sections: z.record(z.string(), z.unknown()).optional(),
})

export type InterviewPrepOutput = z.infer<typeof InterviewPrepSchema>

export const SmokeTestSchema = z.object({
  ok: z.boolean(),
  message: z.string(),
  risk_flags: z.array(z.string()),
})

export type SmokeTestOutput = z.infer<typeof SmokeTestSchema>

export const SCHEMA_REGISTRY = {
  resume_parse: ResumeParseSchema,
  evidence_cards: EvidenceCardsOutputSchema,
  jd_parse: JDParseSchema,
  fingerprint: FingerprintSchema,
  positionings: PositioningsOutputSchema,
  resume_output: ResumeOutputSchema,
  risk_review: RiskReviewOutputSchema,
  interview_prep: InterviewPrepSchema,
  smoke_test: SmokeTestSchema,
} as const

export type SchemaName = keyof typeof SCHEMA_REGISTRY
