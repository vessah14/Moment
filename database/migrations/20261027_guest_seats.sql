-- 2026-10-27 — Places par invitation (« Famille Ngo — 2 places »), invité compris.
-- NULL : la règle du formulaire de réponse de l'événement (maxCompanions) s'applique.
-- DDL : à exécuter en tant que postgres (propriétaire des tables), AVANT de redémarrer
-- l'API : sans cette colonne, les invités ne peuvent plus être lus ni enregistrés.
BEGIN;

ALTER TABLE public.guests
    ADD COLUMN IF NOT EXISTS seats smallint NULL;

ALTER TABLE public.guests
    DROP CONSTRAINT IF EXISTS guests_seats_range;
ALTER TABLE public.guests
    ADD CONSTRAINT guests_seats_range CHECK (seats IS NULL OR seats BETWEEN 1 AND 50);

COMMIT;
