-- Migration: 014_selected_delivery_target
-- Add selected_delivery_targets table for user-chosen delivery mode override

CREATE TABLE IF NOT EXISTS selected_delivery_targets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id uuid NOT NULL REFERENCES cases (id) ON DELETE CASCADE,
    source_type text NOT NULL DEFAULT 'original_jd',
    delivery_mode text NOT NULL,
    target_role text,
    force_generate boolean NOT NULL DEFAULT false,
    force_reason text,
    risk_acknowledged boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_selected_delivery_targets_case_id ON selected_delivery_targets (case_id);
