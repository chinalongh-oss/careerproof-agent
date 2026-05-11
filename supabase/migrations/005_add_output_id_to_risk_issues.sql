-- Migration: 005_add_output_id_to_risk_issues
-- Add output_id to risk_issues to track which generated_outputs version the risk came from

ALTER TABLE risk_issues
ADD COLUMN IF NOT EXISTS output_id uuid REFERENCES generated_outputs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_risk_issues_output_id ON risk_issues (output_id);
