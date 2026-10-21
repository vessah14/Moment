-- 2026-10-21 — Nouveaux prix mensuels (alignés sur le prototype de la page Tarifs).
-- Premium 5 000, Business 15 000, Event Pro 30 000 FCFA. Prix en centimes de FCFA.
-- Les limites (features) ne changent pas. Exécutable par app_admin, rejouable sans risque.
BEGIN;

UPDATE subscription_plans SET price_cents = 500000  WHERE code = 'premium';
UPDATE subscription_plans SET price_cents = 1500000 WHERE code = 'business';
UPDATE subscription_plans SET price_cents = 3000000 WHERE code = 'eventpro';

COMMIT;
