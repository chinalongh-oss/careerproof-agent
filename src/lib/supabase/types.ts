export const CASE_STATUSES = [
  "new_submitted",
  "parsed",
  "evidence_ready",
  "jd_ready",
  "fingerprint_ready",
  "positioning_ready",
  "outputs_ready",
  "risk_reviewed",
  "interview_ready",
  "delivered",
  "failed",
] as const

export type CaseStatus = (typeof CASE_STATUSES)[number]

export interface Case {
  id: string
  candidate_name: string | null
  email: string | null
  wechat: string | null
  current_title: string | null
  target_direction: string | null
  target_role: string | null
  status: CaseStatus
  privacy_notes: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  case_id: string
  type: string
  file_url: string | null
  raw_text: string | null
  file_path: string | null
  file_name: string | null
  mime_type: string | null
  file_size: number | null
  parse_status: string | null
  parse_error: string | null
  created_at: string
}

export interface CandidateProfile {
  id: string
  case_id: string
  personal_info: Record<string, unknown> | null
  education: Record<string, unknown> | null
  work_experiences: Record<string, unknown> | null
  skills: Record<string, unknown> | null
  metrics: Record<string, unknown> | null
  strong_claims: Record<string, unknown> | null
  missing_info: Record<string, unknown> | null
  created_at: string
}

export interface ProjectCard {
  id: string
  case_id: string
  project_name: string | null
  business_context: string | null
  business_problem: string | null
  candidate_role: string | null
  personal_actions: Record<string, unknown> | null
  team_actions: Record<string, unknown> | null
  metrics: Record<string, unknown> | null
  result_summary: string | null
  evidence_level: string | null
  public_visibility: string | null
  risk_flags: Record<string, unknown> | null
  role_angle_tags: Record<string, unknown> | null
  reader_lens_tags: Record<string, unknown> | null
  recommended_expression: string | null
  not_recommended_expression: string | null
  interview_risks: Record<string, unknown> | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface JobDescription {
  id: string
  case_id: string
  raw_jd: string | null
  role_name: string | null
  company_type: string | null
  seniority_level: string | null
  core_responsibilities: Record<string, unknown> | null
  required_skills: Record<string, unknown> | null
  hidden_requirements: Record<string, unknown> | null
  keywords: Record<string, unknown> | null
  interview_focus: Record<string, unknown> | null
  resume_strategy: Record<string, unknown> | null
  recommended_project_types: Record<string, unknown> | null
  not_recommended_project_types: Record<string, unknown> | null
  created_at: string
}

export interface CareerFingerprint {
  id: string
  case_id: string
  career_axis: string | null
  secondary_axis: string | null
  decision_style: string | null
  expression_style: string | null
  differentiation_summary: string | null
  signature_projects: Record<string, unknown> | null
  not_recommended_positioning: Record<string, unknown> | null
  created_at: string
}

export interface Positioning {
  id: string
  case_id: string
  selected: boolean
  version_name: string | null
  target_reader: string | null
  career_axis: string | null
  secondary_axis: string | null
  one_line_summary: string | null
  value_summary: string | null
  tone_tags: Record<string, unknown> | null
  recommended_projects: Record<string, unknown> | null
  weak_projects: Record<string, unknown> | null
  risks: Record<string, unknown> | null
  created_at: string
}

export interface GeneratedOutput {
  id: string
  case_id: string
  output_type: string
  title: string | null
  content: Record<string, unknown> | null
  markdown: string | null
  version: number
  template_id: string | null
  prompt_version: string | null
  delivery_mode: string | null
  target_role: string | null
  delivery_variant_key: string | null
  is_current: boolean
  created_at: string
}

export interface RiskIssue {
  id: string
  case_id: string
  output_id: string | null
  source_type: string | null
  source_text: string | null
  risk_type: string | null
  risk_level: string | null
  reason: string | null
  suggestion: string | null
  safer_rewrite: string | null
  risk_source: string
  status: RiskIssueStatus
  created_at: string
}

export type RiskIssueStatus = "open" | "accepted" | "applied" | "fixed" | "ignored"

export interface PublicPage {
  id: string
  case_id: string
  slug: string
  selected_theme: string
  password_hash: string | null
  is_published: boolean
  page_content: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ExportArtifact {
  id: string
  case_id: string
  artifact_type: string
  file_url: string | null
  storage_path: string | null
  sha256: string | null
  template_version: string | null
  schema_version: string | null
  source_output_id: string | null
  created_at: string
}

export interface JobFitAssessment {
  id: string
  case_id: string
  fit_score: number | null
  fit_level: string | null
  summary: string | null
  matched_requirements: Record<string, unknown> | null
  partially_matched_requirements: Record<string, unknown> | null
  missing_requirements: Record<string, unknown> | null
  hard_gaps: Record<string, unknown> | null
  transferable_capabilities: Record<string, unknown> | null
  overfit_risks: Record<string, unknown> | null
  recommended_delivery_mode: string | null
  safe_positioning_statement: string | null
  unsafe_positioning_statement: string | null
  alternative_roles: Record<string, unknown> | null
  evidence_to_collect: Record<string, unknown> | null
  created_at: string
}

export interface SelectedDeliveryTarget {
  id: string
  case_id: string
  source_type: string
  delivery_mode: string
  target_role: string | null
  force_generate: boolean
  force_reason: string | null
  risk_acknowledged: boolean
  created_at: string
  updated_at: string
}

export interface GenerationRun {
  id: string
  case_id: string | null
  agent_name: string
  model: string
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  error: string | null
  status: string | null
  started_at: string | null
  finished_at: string | null
  duration_ms: number | null
  created_at: string
}

export interface ResumeQualityAssessment {
  id: string
  case_id: string
  old_resume_score: Record<string, unknown> | null
  new_resume_score: Record<string, unknown> | null
  score_delta: Record<string, unknown> | null
  overall_conclusion: string | null
  recommendation_level: string | null
  improved_points: Record<string, unknown> | null
  regressed_points: Record<string, unknown> | null
  new_risks: Record<string, unknown> | null
  usage_suggestions: Record<string, unknown> | null
  user_decision: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: Case
        Insert: Omit<Case, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Case, "id">>
        Relationships: []
      }
      documents: {
        Row: Document
        Insert: Omit<Document, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Document, "id">>
        Relationships: []
      }
      candidate_profiles: {
        Row: CandidateProfile
        Insert: Omit<CandidateProfile, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<CandidateProfile, "id">>
        Relationships: []
      }
      project_cards: {
        Row: ProjectCard
        Insert: Omit<ProjectCard, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ProjectCard, "id">>
        Relationships: []
      }
      job_descriptions: {
        Row: JobDescription
        Insert: Omit<JobDescription, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<JobDescription, "id">>
        Relationships: []
      }
      career_fingerprints: {
        Row: CareerFingerprint
        Insert: Omit<CareerFingerprint, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<CareerFingerprint, "id">>
        Relationships: []
      }
      positionings: {
        Row: Positioning
        Insert: Omit<Positioning, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Positioning, "id">>
        Relationships: []
      }
      generated_outputs: {
        Row: GeneratedOutput
        Insert: Omit<GeneratedOutput, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<GeneratedOutput, "id">>
        Relationships: []
      }
      risk_issues: {
        Row: RiskIssue
        Insert: Omit<RiskIssue, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<RiskIssue, "id">>
        Relationships: []
      }
      public_pages: {
        Row: PublicPage
        Insert: Omit<PublicPage, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<PublicPage, "id">>
        Relationships: []
      }
      export_artifacts: {
        Row: ExportArtifact
        Insert: Omit<ExportArtifact, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<ExportArtifact, "id">>
        Relationships: []
      }
      generation_runs: {
        Row: GenerationRun
        Insert: Omit<GenerationRun, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<GenerationRun, "id">>
        Relationships: []
      }
      job_fit_assessments: {
        Row: JobFitAssessment
        Insert: Omit<JobFitAssessment, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<JobFitAssessment, "id">>
        Relationships: []
      }
      selected_delivery_targets: {
        Row: SelectedDeliveryTarget
        Insert: Omit<SelectedDeliveryTarget, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<SelectedDeliveryTarget, "id">>
        Relationships: []
      }
      resume_quality_assessments: {
        Row: ResumeQualityAssessment
        Insert: Omit<ResumeQualityAssessment, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ResumeQualityAssessment, "id">>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
