-- Inscription publique d'un invité : consentement WhatsApp explicite et daté.
BEGIN;

ALTER TABLE public.guests
    ADD COLUMN IF NOT EXISTS whatsapp_reminders_consented boolean NOT NULL DEFAULT false;

ALTER TABLE public.guests
    ADD COLUMN IF NOT EXISTS whatsapp_reminders_consented_at timestamp with time zone NULL;

COMMIT;
