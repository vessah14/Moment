-- =============================================================================
-- Moindre privilège pour le compte utilisé par l'API (app_admin).
--
-- Avant : app_admin était PROPRIÉTAIRE de nombreuses tables. Une API compromise pouvait
-- donc supprimer des tables, en changer la structure, désactiver la RLS ou vider des
-- tables entières (TRUNCATE).
-- Après : postgres possède tout ; app_admin ne peut que lire et écrire des lignes
-- (SELECT, INSERT, UPDATE, DELETE), toujours sous la RLS.
--
-- À exécuter avec le compte postgres, APRÈS les autres migrations :
--   psql -U postgres -d eventsaas -f 20261013_least_privilege.sql
-- Rejouable sans risque. Ensuite, toutes les migrations se lancent avec postgres.
-- =============================================================================
BEGIN;

DO $$
DECLARE r record;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tableowner = 'app_admin' LOOP
        EXECUTE format('ALTER TABLE public.%I OWNER TO postgres', r.tablename);
    END LOOP;
    FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' AND sequenceowner = 'app_admin' LOOP
        EXECUTE format('ALTER SEQUENCE public.%I OWNER TO postgres', r.sequencename);
    END LOOP;
    FOR r IN SELECT p.oid::regprocedure AS sig FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND pg_get_userbyid(p.proowner) = 'app_admin' LOOP
        EXECUTE format('ALTER FUNCTION %s OWNER TO postgres', r.sig);
    END LOOP;
END $$;

-- Plus de création d'objets dans le schéma par l'API.
REVOKE CREATE ON SCHEMA public FROM app_admin;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO app_admin;

-- Lecture / écriture des lignes uniquement (ni TRUNCATE, ni TRIGGER, ni REFERENCES).
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_admin;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_admin;

-- Tables créées plus tard par postgres : mêmes droits automatiquement.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_admin;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO app_admin;

COMMIT;

-- Vérification : aucune ligne ne doit apparaître (app_admin ne possède plus rien).
SELECT 'table' AS objet, tablename AS nom FROM pg_tables WHERE schemaname = 'public' AND tableowner = 'app_admin'
UNION ALL
SELECT 'fonction', p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND pg_get_userbyid(p.proowner) = 'app_admin';
