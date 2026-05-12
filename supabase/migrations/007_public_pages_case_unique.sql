-- Migration: 007_public_pages_case_unique
-- Add unique index on public_pages(case_id) to ensure at most one public page per case

-- If duplicate case_ids exist, this CREATE will fail with an error like:
-- "could not create unique index ... Key (case_id) is duplicated"
-- In that case, manually clean up duplicates before re-running.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_index
    WHERE indexrelid = 'public_pages_case_id_unique_idx'::regclass
  ) THEN
    CREATE UNIQUE INDEX public_pages_case_id_unique_idx ON public_pages(case_id);
  END IF;
END
$$;
