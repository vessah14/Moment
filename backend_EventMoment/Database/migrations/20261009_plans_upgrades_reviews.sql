-- 2026-10-09 — Offres alignées sur la page Tarifs, demandes de passage à une offre
-- payante (activation par l'admin, paiement hors ligne) et avis des clients sur la
-- plateforme. Exécutable par app_admin, rejouable sans risque.
BEGIN;

-- Offres : limites dans features (null = illimité). Prix en centimes de FCFA.
INSERT INTO subscription_plans (code, label, price_cents, currency, billing, features, is_active)
VALUES
    ('free',     'Free',      0,       'XAF', 'gratuit', '{"maxEvents": 1, "maxGuests": 50}',       TRUE),
    ('premium',  'Premium',   990000,  'XAF', 'mensuel', '{"maxEvents": 5, "maxGuests": 500}',      TRUE),
    ('business', 'Business',  2490000, 'XAF', 'mensuel', '{"maxEvents": null, "maxGuests": 2000}',  TRUE),
    ('eventpro', 'Event Pro', 4990000, 'XAF', 'mensuel', '{"maxEvents": null, "maxGuests": null}',  TRUE)
ON CONFLICT (code) DO UPDATE
    SET label = EXCLUDED.label,
        price_cents = EXCLUDED.price_cents,
        billing = EXCLUDED.billing,
        features = EXCLUDED.features,
        is_active = TRUE;

-- Demande de passage à une offre payante. Une seule demande en attente par organisateur.
CREATE TABLE IF NOT EXISTS plan_upgrade_requests (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id  UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    plan_id       UUID NOT NULL REFERENCES subscription_plans(id),
    status        VARCHAR(20) NOT NULL DEFAULT 'EnAttente'
                  CHECK (status IN ('EnAttente', 'Approuvee', 'Refusee', 'Annulee')),
    phone         VARCHAR(30),
    message       VARCHAR(1000),
    admin_note    VARCHAR(500),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    handled_at    TIMESTAMPTZ,
    handled_by    UUID REFERENCES admin_accounts(id) ON DELETE SET NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_plan_upgrade_requests_pending
    ON plan_upgrade_requests(organizer_id) WHERE status = 'EnAttente';
CREATE INDEX IF NOT EXISTS idx_plan_upgrade_requests_status ON plan_upgrade_requests(status, created_at DESC);

-- Avis d'un client (organisateur) sur TBF Moment. Un avis par organisateur, publié sur
-- l'accueil seulement après validation par l'admin.
CREATE TABLE IF NOT EXISTS platform_reviews (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id  UUID NOT NULL UNIQUE REFERENCES organizers(id) ON DELETE CASCADE,
    rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       VARCHAR(1000) NOT NULL,
    display_name  VARCHAR(80) NOT NULL,
    context       VARCHAR(80),
    status        VARCHAR(20) NOT NULL DEFAULT 'EnAttente'
                  CHECK (status IN ('EnAttente', 'Publie', 'Refuse')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    moderated_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_platform_reviews_published ON platform_reviews(status, updated_at DESC);

COMMIT;
