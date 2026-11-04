-- Day-of guest signal: when a confirmed guest tells the organizer they are on the way.
-- Re-runnable; the existing guests table and row-level policies are unchanged.
BEGIN;

ALTER TABLE public.guests
    ADD COLUMN IF NOT EXISTS en_route_at timestamptz NULL;

COMMENT ON COLUMN public.guests.en_route_at IS
    'Moment où l’invité a signalé qu’il était en route le jour de l’événement.';

COMMIT;
