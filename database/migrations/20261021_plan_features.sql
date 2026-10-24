-- Fonctions et limites par offre, lues par PlanService (subscription_plans.features).
-- Nombre null = illimité ; fonction à false = refusée par le serveur avec un message
-- qui indique l'offre à prendre. Mêmes valeurs que le tableau « Tout comparer » de /tarifs.
-- Rejouable : remplace seulement la colonne features des quatre offres.
BEGIN;

UPDATE subscription_plans SET features = '{"maxEvents": 1, "maxGuests": 50, "maxPhotos": 20,
  "premiumTemplates": false, "seating": false, "checkin": false, "ticketing": false,
  "branding": false, "autoReminders": false}'::jsonb
WHERE code = 'free';

UPDATE subscription_plans SET features = '{"maxEvents": 5, "maxGuests": 500, "maxPhotos": 200,
  "premiumTemplates": true, "seating": true, "checkin": true, "ticketing": false,
  "branding": false, "autoReminders": false}'::jsonb
WHERE code = 'premium';

UPDATE subscription_plans SET features = '{"maxEvents": null, "maxGuests": 2000, "maxPhotos": 1000,
  "premiumTemplates": true, "seating": true, "checkin": true, "ticketing": true,
  "branding": true, "autoReminders": false}'::jsonb
WHERE code = 'business';

UPDATE subscription_plans SET features = '{"maxEvents": null, "maxGuests": null, "maxPhotos": 5000,
  "premiumTemplates": true, "seating": true, "checkin": true, "ticketing": true,
  "branding": true, "autoReminders": true}'::jsonb
WHERE code = 'eventpro';

COMMIT;
