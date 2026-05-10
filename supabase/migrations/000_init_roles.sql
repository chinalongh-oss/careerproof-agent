-- Supabase Self-Hosted: Role Setup
-- Executed by PostgreSQL docker-entrypoint-initdb.d

CREATE ROLE anon NOINHERIT LOGIN PASSWORD 'anon-local-dev';
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'your-super-secret-password';
CREATE ROLE authenticated NOINHERIT;
CREATE ROLE service_role NOINHERIT LOGIN PASSWORD 'your-super-secret-password' BYPASSRLS;

GRANT anon TO authenticator;
GRANT authenticated TO authenticator;
GRANT service_role TO authenticator;

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
