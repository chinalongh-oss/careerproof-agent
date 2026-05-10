-- Add UNIQUE constraint on candidate_profiles.case_id to enable upsert
-- Migration: 002_add_case_id_unique

-- First, check for duplicate case_id rows
DO $$
DECLARE
    dup_count integer;
BEGIN
    SELECT count(*) INTO dup_count
    FROM (
        SELECT case_id, count(*)
        FROM candidate_profiles
        GROUP BY case_id
        HAVING count(*) > 1
    ) AS duplicates;

    IF dup_count > 0 THEN
        RAISE NOTICE 'Found % case_ids with duplicate candidate_profiles. Keeping the latest row per case_id.', dup_count;

        -- Delete older duplicates, keeping the row with the highest created_at per case_id
        DELETE FROM candidate_profiles
        WHERE id NOT IN (
            SELECT DISTINCT ON (case_id) id
            FROM candidate_profiles
            ORDER BY case_id, created_at DESC
        );
    END IF;
END $$;

ALTER TABLE candidate_profiles
    ADD CONSTRAINT IF NOT EXISTS candidate_profiles_case_id_unique UNIQUE (case_id);
