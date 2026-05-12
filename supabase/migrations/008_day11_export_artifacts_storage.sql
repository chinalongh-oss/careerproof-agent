-- Migration: 008_day11_export_artifacts_storage
-- Day11: Add source_output_id and storage_path to export_artifacts for PDF export traceability

ALTER TABLE export_artifacts
ADD COLUMN IF NOT EXISTS source_output_id uuid REFERENCES generated_outputs(id) ON DELETE SET NULL;

ALTER TABLE export_artifacts
ADD COLUMN IF NOT EXISTS storage_path text;

COMMENT ON COLUMN export_artifacts.source_output_id IS '追溯来源：generated_outputs 中触发导出的记录';
COMMENT ON COLUMN export_artifacts.storage_path IS 'Supabase Storage 路径，如 resume/{caseId}/timestamp.pdf';
