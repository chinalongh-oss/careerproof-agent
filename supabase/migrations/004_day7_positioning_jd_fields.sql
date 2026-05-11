-- Day 7: Add new columns, unique constraints, partial unique index
-- Migration: 004_day7_positioning_jd_fields

-- ============================================================================
-- 1. Add recommended_project_types and not_recommended_project_types to job_descriptions
-- ============================================================================
ALTER TABLE public.job_descriptions
    ADD COLUMN IF NOT EXISTS recommended_project_types jsonb,
    ADD COLUMN IF NOT EXISTS not_recommended_project_types jsonb;

-- ============================================================================
-- 2. Clean duplicates before adding unique constraints
-- ============================================================================
DO $$
BEGIN
    DELETE FROM public.job_descriptions
    WHERE id NOT IN (
        SELECT DISTINCT ON (case_id) id
        FROM public.job_descriptions
        ORDER BY case_id, created_at DESC
    );
END $$;

DO $$
BEGIN
    DELETE FROM public.career_fingerprints
    WHERE id NOT IN (
        SELECT DISTINCT ON (case_id) id
        FROM public.career_fingerprints
        ORDER BY case_id, created_at DESC
    );
END $$;

-- ============================================================================
-- 3. Add unique constraints for upsert support
-- ============================================================================
DO $$
BEGIN
    ALTER TABLE public.job_descriptions
        ADD CONSTRAINT job_descriptions_case_id_unique UNIQUE (case_id);
EXCEPTION WHEN duplicate_table THEN
    RAISE NOTICE 'constraint job_descriptions_case_id_unique already exists, skipping';
END $$;

DO $$
BEGIN
    ALTER TABLE public.career_fingerprints
        ADD CONSTRAINT career_fingerprints_case_id_unique UNIQUE (case_id);
EXCEPTION WHEN duplicate_table THEN
    RAISE NOTICE 'constraint career_fingerprints_case_id_unique already exists, skipping';
END $$;

-- ============================================================================
-- 4. Partial unique index: ensure at most one positioning.selected=true per case
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS positionings_one_selected_per_case_idx
    ON public.positionings (case_id)
    WHERE selected = true;
