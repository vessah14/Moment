-- Paiements Fapshi pour les abonnements en XAF. Exécutable par app_admin et rejouable.
BEGIN;

CREATE TABLE IF NOT EXISTS fapshi_payments (
    id             UUID PRIMARY KEY,
    organizer_id   UUID NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
    plan_id        UUID NOT NULL REFERENCES subscription_plans(id),
    external_id    VARCHAR(100) NOT NULL UNIQUE,
    transaction_id VARCHAR(100) UNIQUE,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('CREATED', 'PENDING', 'SUCCESSFUL', 'FAILED', 'EXPIRED')),
    amount         INTEGER NOT NULL CHECK (amount >= 100),
    checkout_url   VARCHAR(2048),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at        TIMESTAMPTZ
);

ALTER TABLE organizer_subscriptions
    ADD COLUMN IF NOT EXISTS fapshi_payment_id UUID
    REFERENCES fapshi_payments(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX IF NOT EXISTS uq_organizer_subscriptions_fapshi_payment
    ON organizer_subscriptions(fapshi_payment_id)
    WHERE fapshi_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fapshi_payments_organizer
    ON fapshi_payments(organizer_id, created_at DESC);

COMMIT;