-- 2026-09-29 — Arrivée des invités le jour J, distincte de la réponse RSVP.
-- guests.status = réponse de l'invité (en attente / présent / absent) ;
-- guest_checkins = l'invité est effectivement arrivé (scan ou validation manuelle).
BEGIN;

CREATE TABLE IF NOT EXISTS guest_checkins (
    guest_id       UUID PRIMARY KEY REFERENCES guests(id) ON DELETE CASCADE,
    event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    checked_in_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_guest_checkins_event ON guest_checkins(event_id);

COMMIT;
