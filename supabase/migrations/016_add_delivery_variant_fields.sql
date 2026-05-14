-- Migration: 016_add_delivery_variant_fields
-- Add delivery variant tracking to generated_outputs for multi-target delivery

ALTER TABLE generated_outputs
    ADD COLUMN IF NOT EXISTS delivery_mode text,
    ADD COLUMN IF NOT EXISTS target_role text,
    ADD COLUMN IF NOT EXISTS delivery_variant_key text,
    ADD COLUMN IF NOT EXISTS is_current boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_generated_outputs_delivery_variant
    ON generated_outputs (case_id, output_type, delivery_variant_key, version);
