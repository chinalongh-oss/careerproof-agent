-- Migration: 009_add_export_artifact_storage_fields
-- Day13: Idempotent migration for export_artifacts storage fields and composite index

ALTER TABLE export_artifacts
ADD COLUMN IF NOT EXISTS storage_path text;

ALTER TABLE export_artifacts
ADD COLUMN IF NOT EXISTS source_output_id uuid REFERENCES generated_outputs(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_export_artifacts_case_type_created'
      AND tablename = 'export_artifacts'
  ) THEN
    CREATE INDEX idx_export_artifacts_case_type_created
    ON export_artifacts (case_id, artifact_type, created_at);
  END IF;
END
$$;
