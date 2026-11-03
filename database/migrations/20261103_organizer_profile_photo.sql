-- Photo de profil facultative des organisateurs.
BEGIN;

ALTER TABLE public.organizers
    ADD COLUMN IF NOT EXISTS photo_url text NULL;

COMMIT;
