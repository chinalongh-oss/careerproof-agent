-- Migration: 013_job_fit_assessment
-- Add job_fit_assessments table for JD Fit Gate

CREATE TABLE IF NOT EXISTS job_fit_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    fit_score integer,
    fit_level text,
    summary text,
    matched_requirements jsonb,
    partially_matched_requirements jsonb,
    missing_requirements jsonb,
    hard_gaps jsonb,
    transferable_capabilities jsonb,
    overfit_risks jsonb,
    recommended_delivery_mode text,
    safe_positioning_statement text,
    unsafe_positioning_statement text,
    alternative_roles jsonb,
    evidence_to_collect jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_fit_assessments_case_id ON job_fit_assessments (case_id);
CREATE INDEX IF NOT EXISTS idx_job_fit_assessments_fit_level ON job_fit_assessments (fit_level);
