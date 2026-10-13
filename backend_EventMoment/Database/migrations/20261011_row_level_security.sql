-- =============================================================================
-- Row Level Security sur toutes les tables (défense en profondeur).
--
-- Le serveur (rôle app_admin) indique à chaque connexion pour qui il travaille
-- (Data/RlsSessionInterceptor.cs) :
--   app.current_organizer_id = id de l'organisateur connecté, app.rls_bypass = off
--   app.rls_bypass = on  pour les accès globaux par nature (site public, connexion,
--                        console admin, tâches de fond : invitations, rappels…)
-- Pour un organisateur connecté, PostgreSQL ne montre et ne laisse modifier QUE ses
-- propres lignes, même si un contrôle venait à manquer dans le code.
--
-- À exécuter avec le super-utilisateur postgres (propriétaire de plusieurs tables) :
--   psql -U postgres -d eventsaas -f 20261011_row_level_security.sql
-- Le backend contenant RlsSessionInterceptor doit être déployé AVANT ce script, et les
-- migrations précédentes (dont 20261012_notchpay_payments.sql) déjà appliquées.
-- Idempotent : peut être relancé sans risque.
--
-- Pour consulter les données à la main avec app_admin après ce script :
--   SET app.rls_bypass = 'on';
-- =============================================================================

BEGIN;

-- --- Fonctions utilitaires ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.app_rls_bypass() RETURNS boolean
    LANGUAGE sql STABLE AS
$$ SELECT coalesce(current_setting('app.rls_bypass', true), '') = 'on' $$;

-- Vrai si le rôle courant peut modifier la table (propriétaire ou super-utilisateur) :
-- lancé avec app_admin, le script traite ses tables et signale les autres.
CREATE OR REPLACE FUNCTION pg_temp.can_alter(t text) RETURNS boolean
    LANGUAGE sql STABLE AS
$$ SELECT (SELECT rolsuper FROM pg_roles WHERE rolname = current_user)
       OR (SELECT tableowner FROM pg_tables WHERE schemaname = 'public' AND tablename = t) = current_user $$;

CREATE OR REPLACE FUNCTION public.app_current_organizer() RETURNS uuid
    LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('app.current_organizer_id', true), '')::uuid $$;

-- --- Anciennes politiques « accès total » de app_admin (rendaient la RLS inopérante)
--     et anciennes politiques de tenant (remplacées par celles ci-dessous).
DO $$
DECLARE p record;
BEGIN
    FOR p IN
        SELECT schemaname, tablename, policyname FROM pg_policies
        WHERE schemaname = 'public'
          AND (policyname LIKE 'admin_full_access%' OR policyname LIKE 'tenant_isolation%' OR policyname LIKE 'tbf_%')
          AND pg_temp.can_alter(tablename)
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename);
    END LOOP;
END $$;

-- --- Création des politiques --------------------------------------------------
DO $$
DECLARE
    t text;
    -- Tables rattachées directement à un organisateur.
    organizer_tables text[] := ARRAY[
        'events', 'external_logins', 'organizer_email_verifications', 'organizer_notification_settings',
        'organizer_subscriptions', 'plan_upgrade_requests', 'platform_reviews', 'notchpay_payments'];
    -- Tables rattachées à un événement.
    event_tables text[] := ARRAY[
        'conference_sessions', 'event_blocks', 'event_locations', 'event_reminders', 'event_stats_daily',
        'event_tables', 'gallery_photos', 'gift_items', 'guest_book_entries', 'guest_checkins', 'guest_groups',
        'guest_invitations', 'guests', 'message_campaigns', 'program_items', 'rsvp_responses',
        'seating_assignments', 'speakers', 'sponsors', 'ticket_sales', 'ticket_types'];
    -- Référentiels communs : lecture pour tous, écriture réservée aux accès globaux.
    shared_tables text[] := ARRAY['subscription_plans', 'event_categories'];
    all_tables text[];
BEGIN
    -- Tables pas encore créées (migration correspondante non jouée) : ignorées.
    organizer_tables := ARRAY(SELECT x FROM unnest(organizer_tables) x WHERE to_regclass('public.' || x) IS NOT NULL);
    event_tables := ARRAY(SELECT x FROM unnest(event_tables) x WHERE to_regclass('public.' || x) IS NOT NULL);

    all_tables := organizer_tables || event_tables || shared_tables
        || ARRAY['organizers', 'event_moderations', 'admin_accounts']
        -- Double authentification admin : accès global uniquement (si la table existe).
        || ARRAY(SELECT x FROM unnest(ARRAY['admin_mfa']) x WHERE to_regclass('public.' || x) IS NOT NULL);

    FOREACH t IN ARRAY all_tables LOOP
        IF NOT pg_temp.can_alter(t) THEN
            RAISE NOTICE 'Table % ignorée : à relancer avec le compte postgres.', t;
            CONTINUE;
        END IF;
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        -- Même le propriétaire de la table (app_admin pour certaines) y est soumis.
        EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', t);
        EXECUTE format(
            'CREATE POLICY tbf_bypass ON public.%I FOR ALL TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass())', t);
    END LOOP;

    FOREACH t IN ARRAY organizer_tables LOOP
        CONTINUE WHEN NOT pg_temp.can_alter(t);
        EXECUTE format(
            'CREATE POLICY tbf_tenant ON public.%I FOR ALL TO app_admin '
            'USING (organizer_id = public.app_current_organizer()) WITH CHECK (organizer_id = public.app_current_organizer())', t);
    END LOOP;

    FOREACH t IN ARRAY event_tables LOOP
        CONTINUE WHEN NOT pg_temp.can_alter(t);
        EXECUTE format(
            'CREATE POLICY tbf_tenant ON public.%I FOR ALL TO app_admin '
            'USING (event_id IN (SELECT e.id FROM public.events e WHERE e.organizer_id = public.app_current_organizer())) '
            'WITH CHECK (event_id IN (SELECT e.id FROM public.events e WHERE e.organizer_id = public.app_current_organizer()))', t);
    END LOOP;

    FOREACH t IN ARRAY shared_tables LOOP
        CONTINUE WHEN NOT pg_temp.can_alter(t);
        EXECUTE format('CREATE POLICY tbf_read ON public.%I FOR SELECT TO app_admin USING (true)', t);
    END LOOP;
END $$;

DO $$
BEGIN
    -- Son propre compte uniquement.
    IF pg_temp.can_alter('organizers') THEN
        CREATE POLICY tbf_tenant ON public.organizers FOR ALL TO app_admin
            USING (id = public.app_current_organizer()) WITH CHECK (id = public.app_current_organizer());
    END IF;
    -- Suspension d'un événement : l'organisateur la voit, seul l'admin la pose ou la lève.
    IF pg_temp.can_alter('event_moderations') THEN
        CREATE POLICY tbf_tenant ON public.event_moderations FOR SELECT TO app_admin
            USING (event_id IN (SELECT e.id FROM public.events e WHERE e.organizer_id = public.app_current_organizer()));
    END IF;
END $$;

-- admin_accounts : aucune politique de tenant, accès global (console admin) uniquement.

-- Inscription et connexion Google/Facebook (rôle app_signup) : ses droits SQL sont déjà
-- limités à SELECT/INSERT sur ces deux tables, la RLS ne doit pas les lui retirer.
DO $$
BEGIN
    IF pg_temp.can_alter('organizers') THEN
        CREATE POLICY tbf_signup ON public.organizers FOR ALL TO app_signup USING (true) WITH CHECK (true);
    END IF;
    IF pg_temp.can_alter('external_logins') THEN
        CREATE POLICY tbf_signup ON public.external_logins FOR ALL TO app_signup USING (true) WITH CHECK (true);
    END IF;
END $$;

COMMIT;

-- Vérification : toutes les tables doivent afficher rls = t et forcee = t.
SELECT c.relname AS "table", c.relrowsecurity AS rls, c.relforcerowsecurity AS forcee,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS politiques
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relrowsecurity, c.relname;
