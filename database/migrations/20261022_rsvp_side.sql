-- 2026-10-22 — Choix « côté » du formulaire de réponse (famille de la mariée ou du marié,
-- pronostic, département, branche de la famille…), réglé par modèle dans le bloc RSVP.
-- Le serveur n'enregistre qu'un des choix proposés par l'événement (RsvpSides.Validate).
-- DDL : à exécuter en tant que postgres (propriétaire des tables), AVANT de redémarrer
-- l'API : sans cette colonne, les réponses ne peuvent plus être lues ni enregistrées.
-- Rejouable sans risque.
BEGIN;

ALTER TABLE rsvp_responses
    ADD COLUMN IF NOT EXISTS side varchar(80) NULL;

COMMENT ON COLUMN rsvp_responses.side IS
    'Choix « côté » de l''invité, parmi ceux du bloc RSVP de l''événement (null si aucun).';

COMMIT;
