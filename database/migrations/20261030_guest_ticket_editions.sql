-- Persistent ticket edition numbers and VIP treatment.
BEGIN;

ALTER TABLE public.guests
    ADD COLUMN IF NOT EXISTS edition_number integer,
    ADD COLUMN IF NOT EXISTS is_vip boolean NOT NULL DEFAULT false;

WITH existing_max AS (
    SELECT event_id, max(edition_number) AS highest
    FROM public.guests
    WHERE edition_number IS NOT NULL
    GROUP BY event_id
), numbered AS (
    SELECT guest.id,
           coalesce(existing_max.highest, 0)
             + row_number() OVER (PARTITION BY guest.event_id ORDER BY guest.created_at, guest.id)::integer AS edition_number
    FROM public.guests
         AS guest
    LEFT JOIN existing_max ON existing_max.event_id = guest.event_id
    WHERE guest.edition_number IS NULL
)
UPDATE public.guests AS guest
SET edition_number = numbered.edition_number
FROM numbered
WHERE guest.id = numbered.id;

ALTER TABLE public.guests
    ALTER COLUMN edition_number SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'guests_edition_number_positive'
          AND conrelid = 'public.guests'::regclass
    ) THEN
        ALTER TABLE public.guests
            ADD CONSTRAINT guests_edition_number_positive CHECK (edition_number > 0);
    END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_guests_event_edition_number
    ON public.guests USING btree (event_id, edition_number);

COMMENT ON COLUMN public.guests.edition_number IS
    'Numéro d’édition permanent du billet au sein de l’événement.';
COMMENT ON COLUMN public.guests.is_vip IS
    'Billet VIP, présenté avec un habillage doré.';

COMMIT;
