ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size integer;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parse_status text DEFAULT 'pending';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parse_error text;
