-- CareerProof Agent MVP - Initial Schema
-- Migration: 001_init

-- ============================================================================
-- 1. cases
-- ============================================================================
CREATE TABLE cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_name text,
    email text,
    wechat text,
    current_title text,
    target_direction text,
    target_role text,
    status text NOT NULL DEFAULT 'new_submitted',
    privacy_notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_status ON cases (status);
CREATE INDEX idx_cases_created_at ON cases (created_at);

-- ============================================================================
-- 2. documents
-- ============================================================================
CREATE TABLE documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    type text NOT NULL,
    file_url text,
    raw_text text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_case_id ON documents (case_id);
CREATE INDEX idx_documents_type ON documents (type);

-- ============================================================================
-- 3. candidate_profiles
-- ============================================================================
CREATE TABLE candidate_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    personal_info jsonb,
    education jsonb,
    work_experiences jsonb,
    skills jsonb,
    metrics jsonb,
    strong_claims jsonb,
    missing_info jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_candidate_profiles_case_id ON candidate_profiles (case_id);

-- ============================================================================
-- 4. project_cards
-- ============================================================================
CREATE TABLE project_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    project_name text,
    business_context text,
    business_problem text,
    candidate_role text,
    personal_actions jsonb,
    team_actions jsonb,
    metrics jsonb,
    result_summary text,
    evidence_level text,
    public_visibility text,
    risk_flags jsonb,
    role_angle_tags jsonb,
    reader_lens_tags jsonb,
    recommended_expression text,
    not_recommended_expression text,
    interview_risks jsonb,
    is_featured boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_cards_case_id ON project_cards (case_id);
CREATE INDEX idx_project_cards_evidence_level ON project_cards (evidence_level);
CREATE INDEX idx_project_cards_is_featured ON project_cards (is_featured);

-- ============================================================================
-- 5. job_descriptions
-- ============================================================================
CREATE TABLE job_descriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    raw_jd text,
    role_name text,
    company_type text,
    seniority_level text,
    core_responsibilities jsonb,
    required_skills jsonb,
    hidden_requirements jsonb,
    keywords jsonb,
    interview_focus jsonb,
    resume_strategy jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_descriptions_case_id ON job_descriptions (case_id);

-- ============================================================================
-- 6. career_fingerprints
-- ============================================================================
CREATE TABLE career_fingerprints (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    career_axis text,
    secondary_axis text,
    decision_style text,
    expression_style text,
    differentiation_summary text,
    signature_projects jsonb,
    not_recommended_positioning jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_career_fingerprints_case_id ON career_fingerprints (case_id);

-- ============================================================================
-- 7. positionings
-- ============================================================================
CREATE TABLE positionings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    selected boolean NOT NULL DEFAULT false,
    version_name text,
    target_reader text,
    career_axis text,
    secondary_axis text,
    one_line_summary text,
    value_summary text,
    tone_tags jsonb,
    recommended_projects jsonb,
    weak_projects jsonb,
    risks jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_positionings_case_id ON positionings (case_id);
CREATE INDEX idx_positionings_selected ON positionings (selected);

-- ============================================================================
-- 8. generated_outputs
-- ============================================================================
CREATE TABLE generated_outputs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    output_type text NOT NULL,
    title text,
    content jsonb,
    markdown text,
    version integer NOT NULL DEFAULT 1,
    template_id text,
    prompt_version text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_outputs_case_id ON generated_outputs (case_id);
CREATE INDEX idx_generated_outputs_output_type ON generated_outputs (output_type);

-- ============================================================================
-- 9. risk_issues
-- ============================================================================
CREATE TABLE risk_issues (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    source_type text,
    source_text text,
    risk_type text,
    risk_level text,
    reason text,
    suggestion text,
    safer_rewrite text,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_risk_issues_case_id ON risk_issues (case_id);
CREATE INDEX idx_risk_issues_risk_level ON risk_issues (risk_level);
CREATE INDEX idx_risk_issues_status ON risk_issues (status);

-- ============================================================================
-- 10. public_pages
-- ============================================================================
CREATE TABLE public_pages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    slug text UNIQUE NOT NULL,
    password_hash text,
    is_published boolean NOT NULL DEFAULT false,
    page_content jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_public_pages_case_id ON public_pages (case_id);
CREATE INDEX idx_public_pages_slug ON public_pages (slug);
CREATE INDEX idx_public_pages_is_published ON public_pages (is_published);

-- ============================================================================
-- 11. export_artifacts
-- ============================================================================
CREATE TABLE export_artifacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    artifact_type text NOT NULL,
    file_url text,
    sha256 text,
    template_version text,
    schema_version text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_export_artifacts_case_id ON export_artifacts (case_id);
CREATE INDEX idx_export_artifacts_artifact_type ON export_artifacts (artifact_type);

-- ============================================================================
-- 12. generation_runs
-- ============================================================================
CREATE TABLE generation_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid REFERENCES cases (id) ON DELETE SET NULL,
    agent_name text NOT NULL,
    model text NOT NULL DEFAULT 'unknown',
    input jsonb,
    output jsonb,
    error text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_generation_runs_case_id ON generation_runs (case_id);
CREATE INDEX idx_generation_runs_agent_name ON generation_runs (agent_name);
CREATE INDEX idx_generation_runs_created_at ON generation_runs (created_at);

-- ============================================================================
-- Row Level Security - Enable on all tables
-- ============================================================================
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE positionings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_runs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies - Service role full access
-- ============================================================================

-- cases
CREATE POLICY "service_role_full_access" ON cases
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- documents
CREATE POLICY "service_role_full_access" ON documents
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- candidate_profiles
CREATE POLICY "service_role_full_access" ON candidate_profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- project_cards
CREATE POLICY "service_role_full_access" ON project_cards
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- job_descriptions
CREATE POLICY "service_role_full_access" ON job_descriptions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- career_fingerprints
CREATE POLICY "service_role_full_access" ON career_fingerprints
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- positionings
CREATE POLICY "service_role_full_access" ON positionings
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- generated_outputs
CREATE POLICY "service_role_full_access" ON generated_outputs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- risk_issues
CREATE POLICY "service_role_full_access" ON risk_issues
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- public_pages
CREATE POLICY "service_role_full_access" ON public_pages
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- export_artifacts
CREATE POLICY "service_role_full_access" ON export_artifacts
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- generation_runs
CREATE POLICY "service_role_full_access" ON generation_runs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- Updated-at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER set_updated_at_cases
    BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_project_cards
    BEFORE UPDATE ON project_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_public_pages
    BEFORE UPDATE ON public_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Grant table-level access to roles
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure future tables inherit the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE ON SEQUENCES TO anon, authenticated, service_role;
