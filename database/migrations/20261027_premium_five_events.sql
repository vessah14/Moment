-- 2026-10-27 — Premium passe à cinq événements actifs (Free reste à trois) : l'offre payante
-- apporte enfin plus d'événements que l'offre gratuite. L'API applique déjà cette limite
-- (PlanService.DefaultPremiumMaxEvents) ; la base est alignée pour l'affichage et l'admin.
-- Données seulement : peut être jouée avant ou après le redémarrage de l'API.
BEGIN;

UPDATE public.subscription_plans
SET features = jsonb_set(features, '{maxEvents}', '5'::jsonb, true)
WHERE code = 'premium'
  AND features->'maxEvents' IS DISTINCT FROM '5'::jsonb;

COMMIT;
