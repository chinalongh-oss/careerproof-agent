ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS status text;
ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS finished_at timestamptz;
ALTER TABLE generation_runs ADD COLUMN IF NOT EXISTS duration_ms integer;
