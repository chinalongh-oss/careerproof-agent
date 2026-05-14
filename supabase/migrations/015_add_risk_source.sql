-- Migration: 015_add_risk_source
-- Add risk_source field to risk_issues to track origin of risk entries

ALTER TABLE risk_issues
ADD COLUMN IF NOT EXISTS risk_source text NOT NULL DEFAULT 'llm_audit';

CREATE INDEX IF NOT EXISTS idx_risk_issues_risk_source ON risk_issues (risk_source);
