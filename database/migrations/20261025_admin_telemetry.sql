-- Historique d'audit superadmin et erreurs HTTP, conservés 90 jours.
-- À exécuter avec le compte postgres avant le déploiement de l'API.
BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id uuid PRIMARY KEY,
    admin_id uuid NULL REFERENCES public.admin_accounts(id) ON DELETE SET NULL,
    admin_email varchar(320) NOT NULL,
    http_method varchar(10) NOT NULL,
    route varchar(300) NOT NULL,
    created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_admin_activity_logs_created_at
    ON public.admin_activity_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS public.technical_error_logs (
    id uuid PRIMARY KEY,
    category varchar(100) NOT NULL,
    route varchar(300) NOT NULL,
    status_code integer NOT NULL,
    created_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_technical_error_logs_created_at
    ON public.technical_error_logs (created_at DESC);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_activity_logs_app_admin ON public.admin_activity_logs;
CREATE POLICY admin_activity_logs_app_admin ON public.admin_activity_logs
    USING (current_user = 'app_admin')
    WITH CHECK (current_user = 'app_admin');

ALTER TABLE public.technical_error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_error_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS technical_error_logs_app_admin ON public.technical_error_logs;
CREATE POLICY technical_error_logs_app_admin ON public.technical_error_logs
    USING (current_user = 'app_admin')
    WITH CHECK (current_user = 'app_admin');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_activity_logs TO app_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technical_error_logs TO app_admin;

COMMIT;
