-- Ajoute une clé d'idempotence aux nouvelles tentatives KPay sans modifier
-- les paiements historiques. À exécuter avec un rôle administrateur PostgreSQL.
BEGIN;
SET LOCAL app.rls_bypass = 'on';

ALTER TABLE public.notchpay_payments
    ADD COLUMN IF NOT EXISTS idempotency_key UUID;

CREATE UNIQUE INDEX IF NOT EXISTS uq_notchpay_payments_idempotency
    ON public.notchpay_payments(organizer_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;

COMMIT;
