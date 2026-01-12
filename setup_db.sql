-- Database Setup Script (Idempotent-ish)
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'gacp') THEN
      CREATE ROLE gacp LOGIN PASSWORD 'gacp2024';
   END IF;
END
$do$;

ALTER USER gacp CREATEDB;

SELECT 'CREATE DATABASE gacp_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'gacp_db')\gexec

ALTER DATABASE gacp_db OWNER TO gacp;
GRANT ALL PRIVILEGES ON DATABASE gacp_db TO gacp;
