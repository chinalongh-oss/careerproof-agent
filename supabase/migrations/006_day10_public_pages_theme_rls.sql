-- Migration: 006_day10_public_pages_theme_rls
-- Day10: Add selected_theme to public_pages, RLS policies for public read

-- ============================================================================
-- 1. Add selected_theme column
-- ============================================================================
ALTER TABLE public_pages
ADD COLUMN IF NOT EXISTS selected_theme text NOT NULL DEFAULT 'minimal';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_selected_theme'
      AND conrelid = 'public_pages'::regclass
  ) THEN
    ALTER TABLE public_pages
    ADD CONSTRAINT chk_selected_theme CHECK (
      selected_theme IN ('minimal', 'professional', 'headhunter_quickview')
    );
  END IF;
END
$$;

-- ============================================================================
-- 2. RLS policies for public_pages (anon/authenticated read-only for published pages)
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'anon_select_published_public_pages'
      AND polrelid = 'public_pages'::regclass
  ) THEN
    CREATE POLICY "anon_select_published_public_pages" ON public_pages
        FOR SELECT TO anon
        USING (is_published = true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polname = 'authenticated_select_published_public_pages'
      AND polrelid = 'public_pages'::regclass
  ) THEN
    CREATE POLICY "authenticated_select_published_public_pages" ON public_pages
        FOR SELECT TO authenticated
        USING (is_published = true);
  END IF;
END
$$;

-- ============================================================================
-- 3. Revoke INSERT/UPDATE/DELETE from anon and authenticated on public_pages
-- (SELECT was granted via default grants; we only want SELECT on published rows)
-- REVOKE is idempotent — safe to re-run
-- ============================================================================
REVOKE INSERT, UPDATE, DELETE ON public_pages FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public_pages FROM authenticated;
