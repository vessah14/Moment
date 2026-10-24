-- Le check-in est disponible pour tous les organisateurs, quelle que soit leur offre.
-- Met à jour les offres existantes sans modifier leurs autres limites ou fonctions.
BEGIN;

UPDATE public.subscription_plans
SET features = jsonb_set(features, '{checkin}', 'true'::jsonb, true)
WHERE features->'checkin' IS DISTINCT FROM 'true'::jsonb;

COMMIT;
