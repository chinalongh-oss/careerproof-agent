-- Migration: 017_resume_quality_assessments
-- Add resume quality comparison (old vs new resume) table

CREATE TABLE IF NOT EXISTS resume_quality_assessments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    old_resume_score jsonb,
    new_resume_score jsonb,
    score_delta jsonb,
    overall_conclusion text,
    recommendation_level text CHECK (recommendation_level IN ('recommended', 'use_with_caution', 'not_recommended', 'high_risk_trial')),
    improved_points jsonb,
    regressed_points jsonb,
    new_risks jsonb,
    usage_suggestions jsonb,
    user_decision text CHECK (user_decision IN ('use_new', 'use_old', 'generate_alternative_role', 'force_target_version', 'request_revision', 'pending')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_quality_assessments_case_id ON resume_quality_assessments (case_id);
CREATE INDEX IF NOT EXISTS idx_resume_quality_assessments_recommendation ON resume_quality_assessments (recommendation_level);
CREATE INDEX IF NOT EXISTS idx_resume_quality_assessments_decision ON resume_quality_assessments (user_decision);
