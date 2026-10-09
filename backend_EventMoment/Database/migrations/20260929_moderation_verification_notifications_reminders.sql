-- 2026-09-29 — Modèles ajoutés après l'audit de sécurité.
-- Tables séparées (aucune modification des tables existantes) : exécutable par app_admin.
BEGIN;

-- Suspension d'un événement par la modération. La présence d'une ligne = événement suspendu.
-- Séparée de events.status pour que l'organisateur ne puisse pas lever la suspension lui-même.
CREATE TABLE IF NOT EXISTS event_moderations (
    event_id      UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
    reason        VARCHAR(500),
    suspended_by  UUID REFERENCES admin_accounts(id) ON DELETE SET NULL,
    suspended_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vérification de l'adresse e-mail d'un organisateur. La présence d'une ligne = e-mail vérifié.
CREATE TABLE IF NOT EXISTS organizer_email_verifications (
    organizer_id  UUID PRIMARY KEY REFERENCES organizers(id) ON DELETE CASCADE,
    verified_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Préférences de notification de l'organisateur (absence de ligne = valeurs par défaut).
CREATE TABLE IF NOT EXISTS organizer_notification_settings (
    organizer_id    UUID PRIMARY KEY REFERENCES organizers(id) ON DELETE CASCADE,
    new_rsvp        BOOLEAN NOT NULL DEFAULT TRUE,
    guestbook       BOOLEAN NOT NULL DEFAULT TRUE,
    payments        BOOLEAN NOT NULL DEFAULT TRUE,
    reminders       BOOLEAN NOT NULL DEFAULT FALSE,
    weekly_summary  BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rappels automatiques par événement, exécutés par ReminderDispatcher.
CREATE TABLE IF NOT EXISTS event_reminders (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    kind          VARCHAR(30) NOT NULL CHECK (kind IN ('non_respondents', 'day_before', 'thank_you')),
    enabled       BOOLEAN NOT NULL DEFAULT FALSE,
    last_sent_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (event_id, kind)
);
CREATE INDEX IF NOT EXISTS idx_event_reminders_enabled ON event_reminders(enabled) WHERE enabled;

COMMIT;
