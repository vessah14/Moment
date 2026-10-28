-- 2026-10-28 — Modèle Envol (cérémonie de présentation des vœux).
--  * guest_book_entries.service : service ou filière de l'auteur d'un vœu (mur des vœux,
--    écran de projection), parmi les choix du bloc RSVP de l'événement.
--  * guests.invitation_opened_at : première ouverture du lien personnel (statut « Vue »).
--  * guests.invitation_shared_at : invitation partagée par WhatsApp ou SMS depuis l'espace
--    organisateur (statut « Envoyée », visible sur tous les appareils de l'organisateur).
--  * rsvp_responses.extra : case « Je reste pour le cocktail » du formulaire de réponse
--    (null si l'événement ne la propose pas).
-- DDL : à exécuter en tant que postgres (propriétaire des tables), AVANT de redémarrer
-- l'API : sans ces colonnes, les invités, réponses et vœux ne peuvent plus être lus.
-- Rejouable sans risque. Pas de nouvelle table : les politiques RLS existantes s'appliquent.
BEGIN;

ALTER TABLE public.guest_book_entries
    ADD COLUMN IF NOT EXISTS service varchar(80) NULL;

ALTER TABLE public.guests
    ADD COLUMN IF NOT EXISTS invitation_opened_at timestamptz NULL,
    ADD COLUMN IF NOT EXISTS invitation_shared_at timestamptz NULL;

ALTER TABLE public.rsvp_responses
    ADD COLUMN IF NOT EXISTS extra boolean NULL;

COMMENT ON COLUMN public.guest_book_entries.service IS
    'Service ou filière de l''auteur du vœu, parmi les choix du bloc RSVP (null si aucun).';
COMMENT ON COLUMN public.guests.invitation_opened_at IS
    'Première ouverture du lien d''invitation personnel par l''invité.';
COMMENT ON COLUMN public.guests.invitation_shared_at IS
    'Dernier partage de l''invitation par WhatsApp ou SMS depuis l''espace organisateur.';
COMMENT ON COLUMN public.rsvp_responses.extra IS
    'Réponse à la case optionnelle du formulaire (ex. « Je reste pour le cocktail »).';

COMMIT;
