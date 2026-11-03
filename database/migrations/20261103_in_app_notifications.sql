BEGIN;

CREATE TABLE IF NOT EXISTS public.organizer_notifications (
    id           UUID PRIMARY KEY,
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    event_id     UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    type         VARCHAR(40) NOT NULL,
    title        VARCHAR(160) NOT NULL,
    message      VARCHAR(500) NOT NULL,
    link         VARCHAR(250) NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ix_organizer_notifications_organizer_id_created_at
    ON public.organizer_notifications (organizer_id, created_at DESC);

ALTER TABLE public.organizer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_notifications FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tbf_bypass ON public.organizer_notifications;
DROP POLICY IF EXISTS tbf_tenant ON public.organizer_notifications;
CREATE POLICY tbf_bypass ON public.organizer_notifications
    FOR ALL TO app_admin
    USING (public.app_rls_bypass())
    WITH CHECK (public.app_rls_bypass());
CREATE POLICY tbf_tenant ON public.organizer_notifications
    FOR ALL TO app_admin
    USING (
        organizer_id = public.app_current_organizer()
        AND event_id IN (
            SELECT e.id FROM public.events e
            WHERE e.organizer_id = public.app_current_organizer()
        )
    )
    WITH CHECK (
        organizer_id = public.app_current_organizer()
        AND event_id IN (
            SELECT e.id FROM public.events e
            WHERE e.organizer_id = public.app_current_organizer()
        )
    );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.organizer_notifications TO app_admin;

COMMIT;
