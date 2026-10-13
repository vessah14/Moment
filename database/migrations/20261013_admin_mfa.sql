-- Double authentification (TOTP) des comptes d'administration.
-- Exécutable par app_admin ou postgres. Rejouable sans risque.
BEGIN;

CREATE TABLE IF NOT EXISTS public.admin_mfa (
    admin_id        UUID PRIMARY KEY REFERENCES public.admin_accounts(id) ON DELETE CASCADE,
    -- Secret chiffré par l'API (ASP.NET Data Protection) : illisible depuis la base seule.
    secret_protected TEXT NOT NULL,
    enabled_at      TIMESTAMPTZ,
    -- Dernier pas de temps accepté : un même code ne peut pas servir deux fois.
    last_used_step  BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comptes d'administration : accès global (console admin) uniquement, jamais en tant
-- qu'organisateur (voir 20261011_row_level_security.sql).
ALTER TABLE public.admin_mfa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_mfa FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tbf_bypass ON public.admin_mfa;
CREATE POLICY tbf_bypass ON public.admin_mfa FOR ALL TO app_admin
    USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_mfa TO app_admin;

COMMIT;
