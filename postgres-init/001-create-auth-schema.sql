-- Runs automatically by the official postgres image on first init of a fresh
-- data volume (see /docker-entrypoint-initdb.d in the postgres service).
-- euro-auth's TypeORM data source is configured with schema "auth", and
-- TypeORM's own migrations-tracking-table bootstrap assumes that schema
-- already exists — it does not create it. This script creates it up front,
-- before the app or any migration ever runs.
CREATE SCHEMA IF NOT EXISTS auth;
