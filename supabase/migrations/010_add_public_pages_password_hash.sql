-- Migration: 010_add_public_pages_password_hash
-- Day13: Idempotent migration to ensure password_hash column exists on public_pages

ALTER TABLE public_pages
ADD COLUMN IF NOT EXISTS password_hash text;
