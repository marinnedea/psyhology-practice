-- ─────────────────────────────────────────────────────────────
-- Psychology Practice — PostgreSQL initial setup
--
-- Run as the PostgreSQL superuser before applying migrations:
--   sudo -u postgres psql -f database/setup.sql
--
-- Replace 'CHANGE_ME' with your chosen password, then update
-- DATABASE_URL in .env.local to match.
-- ─────────────────────────────────────────────────────────────

-- Create application user (skip if it already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'psychology_app') THEN
    CREATE USER psychology_app WITH PASSWORD 'CHANGE_ME';
  END IF;
END
$$;

-- Create database owned by the application user
CREATE DATABASE psychology_practice_next
  OWNER psychology_app
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE   'en_US.UTF-8'
  TEMPLATE template0;

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE psychology_practice_next TO psychology_app;

-- Connect to the new database and grant schema privileges
\connect psychology_practice_next

GRANT ALL ON SCHEMA public TO psychology_app;
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO psychology_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO psychology_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO psychology_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO psychology_app;
