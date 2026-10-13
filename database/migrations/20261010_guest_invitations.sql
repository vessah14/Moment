-- 2026-10-10 — Envoi automatique du lien d'invitation (confirmation de présence) à chaque
-- invité ajouté avec une adresse e-mail. Une ligne par invité : sent_at NULL = à envoyer
-- (dès que l'événement est publié), rempli une fois l'e-mail remis à Brevo / SMTP.
-- Exécutable par app_admin, rejouable sans risque.
BEGIN;

CREATE TABLE IF NOT EXISTS guest_invitations (
    guest_id      UUID PRIMARY KEY REFERENCES guests(id) ON DELETE CASCADE,
    event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    queued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    sent_at       TIMESTAMPTZ,
    attempts      SMALLINT NOT NULL DEFAULT 0,
    last_error    VARCHAR(300)
);
CREATE INDEX IF NOT EXISTS idx_guest_invitations_pending
    ON guest_invitations(event_id) WHERE sent_at IS NULL;

COMMIT;
