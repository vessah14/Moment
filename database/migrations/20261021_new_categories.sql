-- 2026-10-21 — Catégories des nouveaux modèles : baby shower (Douceur), retrait de deuil
-- (Souvenir) et fêtes et saisons (Étoile, Cœur, Hilal, Aurore, Unité, Maman).
-- Exécutable par app_admin (avec app.rls_bypass), rejouable sans risque.
BEGIN;

INSERT INTO event_categories (code, label, description, is_active)
VALUES
    ('baby_shower',   'Baby shower et naissance', 'Fêtez l''arrivée de bébé avec vos proches',               TRUE),
    ('retrait_deuil', 'Retrait de deuil',          'Levez le deuil et célébrez la vie d''un être cher',       TRUE),
    ('fetes_saisons', 'Fêtes et saisons',          'Noël, Saint-Valentin, Aïd, Pâques, 20 mai, fête des mères', TRUE)
ON CONFLICT (code) DO UPDATE
    SET label = EXCLUDED.label,
        description = EXCLUDED.description,
        is_active = TRUE;

COMMIT;
