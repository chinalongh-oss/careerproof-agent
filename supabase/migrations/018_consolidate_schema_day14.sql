-- Migration: 018_consolidate_schema_day14
-- P0 Fix: Consolidate schema — partial unique index, RLS policies, updated_at triggers

-- ============================================================================
-- 1. generated_outputs: partial unique index — one is_current per variant
--    COALESCE(delivery_variant_key, '') ensures NULL variant_keys (profile_page)
--    are treated as the same group, preventing multiple is_current=true rows.
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_generated_outputs_one_current_per_variant'
  ) THEN
    CREATE UNIQUE INDEX idx_generated_outputs_one_current_per_variant
      ON generated_outputs (case_id, output_type, COALESCE(delivery_variant_key, ''))
      WHERE is_current = true;
  END IF;
END
$$;

-- ============================================================================
-- 2. job_fit_assessments: at most one assessment per case
-- ============================================================================
DO $$
BEGIN
  DELETE FROM job_fit_assessments
  WHERE id NOT IN (
    SELECT DISTINCT ON (case_id) id
    FROM job_fit_assessments
    ORDER BY case_id, created_at DESC
  );
END $$;

DO $$
BEGIN
  ALTER TABLE job_fit_assessments
    ADD CONSTRAINT job_fit_assessments_case_id_unique UNIQUE (case_id);
EXCEPTION WHEN duplicate_table THEN
  RAISE NOTICE 'constraint job_fit_assessments_case_id_unique already exists, skipping';
END $$;

-- ============================================================================
-- 3. resume_quality_assessments: at most one assessment per case
-- ============================================================================
DO $$
BEGIN
  DELETE FROM resume_quality_assessments
  WHERE id NOT IN (
    SELECT DISTINCT ON (case_id) id
    FROM resume_quality_assessments
    ORDER BY case_id, created_at DESC
  );
END $$;

DO $$
BEGIN
  ALTER TABLE resume_quality_assessments
    ADD CONSTRAINT resume_quality_assessments_case_id_unique UNIQUE (case_id);
EXCEPTION WHEN duplicate_table THEN
  RAISE NOTICE 'constraint resume_quality_assessments_case_id_unique already exists, skipping';
END $$;

-- ============================================================================
-- 4. RLS: enable and grant service_role access for tables added after 001_init
-- ============================================================================
ALTER TABLE job_fit_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE selected_delivery_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_quality_assessments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'service_role_full_access'
      AND polrelid = 'job_fit_assessments'::regclass
  ) THEN
    CREATE POLICY "service_role_full_access" ON job_fit_assessments
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'service_role_full_access'
      AND polrelid = 'selected_delivery_targets'::regclass
  ) THEN
    CREATE POLICY "service_role_full_access" ON selected_delivery_targets
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'service_role_full_access'
      AND polrelid = 'resume_quality_assessments'::regclass
  ) THEN
    CREATE POLICY "service_role_full_access" ON resume_quality_assessments
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END
$$;

-- ============================================================================
-- 5. updated_at triggers for tables added after 001_init
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_selected_delivery_targets'
  ) THEN
    CREATE TRIGGER set_updated_at_selected_delivery_targets
      BEFORE UPDATE ON selected_delivery_targets
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_resume_quality_assessments'
  ) THEN
    CREATE TRIGGER set_updated_at_resume_quality_assessments
      BEFORE UPDATE ON resume_quality_assessments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- ============================================================================
-- 6. Per-table grants for new tables (service_role may not be covered by
--    ALTER DEFAULT PRIVILEGES from 001_init if tables were created manually)
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON job_fit_assessments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON selected_delivery_targets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON resume_quality_assessments TO service_role;
GRANT SELECT ON job_fit_assessments TO anon, authenticated;
GRANT SELECT ON selected_delivery_targets TO anon, authenticated;
GRANT SELECT ON resume_quality_assessments TO anon, authenticated;
