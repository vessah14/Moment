-- Les offres Free et Premium autorisent trois événements actifs.
-- Préserve les autres quotas et fonctions de chaque offre.
BEGIN;

UPDATE public.subscription_plans
SET features = jsonb_set(features, '{maxEvents}', '3'::jsonb, true)
WHERE code = 'free'
  AND features->'maxEvents' IS DISTINCT FROM '3'::jsonb;

UPDATE public.subscription_plans
SET features = jsonb_set(features, '{maxEvents}', '3'::jsonb, true)
WHERE code = 'premium'
  AND features->'maxEvents' IS DISTINCT FROM '3'::jsonb;

COMMIT;
