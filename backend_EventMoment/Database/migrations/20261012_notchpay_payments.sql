-- Migre les paiements Fapshi existants ou crée le stockage Notch Pay si Fapshi
-- n'a jamais été activé. Les données historiques sont conservées.
BEGIN;
SET LOCAL app.rls_bypass = 'on';

DO $$
BEGIN
    IF to_regclass('public.fapshi_payments') IS NOT NULL
       AND to_regclass('public.notchpay_payments') IS NULL THEN
        UPDATE public.fapshi_payments
        SET status = 'FAILED', updated_at = now()
        WHERE status IN ('CREATED', 'PENDING');
        ALTER TABLE public.fapshi_payments RENAME TO notchpay_payments;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'organizer_subscriptions'
          AND column_name = 'fapshi_payment_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'organizer_subscriptions'
          AND column_name = 'notchpay_payment_id'
    ) THEN
        ALTER TABLE public.organizer_subscriptions
            RENAME COLUMN fapshi_payment_id TO notchpay_payment_id;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.notchpay_payments (
    id             UUID PRIMARY KEY,
    organizer_id   UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
    plan_id        UUID NOT NULL REFERENCES public.subscription_plans(id),
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

ALTER TABLE public.organizer_subscriptions
    ADD COLUMN IF NOT EXISTS notchpay_payment_id UUID
    REFERENCES public.notchpay_payments(id) ON DELETE RESTRICT;

DO $$
BEGIN
    IF to_regclass('public.uq_organizer_subscriptions_fapshi_payment') IS NOT NULL
       AND to_regclass('public.uq_organizer_subscriptions_notchpay_payment') IS NULL THEN
        ALTER INDEX public.uq_organizer_subscriptions_fapshi_payment
            RENAME TO uq_organizer_subscriptions_notchpay_payment;
    END IF;

    IF to_regclass('public.idx_fapshi_payments_organizer') IS NOT NULL
       AND to_regclass('public.idx_notchpay_payments_organizer') IS NULL THEN
        ALTER INDEX public.idx_fapshi_payments_organizer
            RENAME TO idx_notchpay_payments_organizer;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_organizer_subscriptions_notchpay_payment
    ON public.organizer_subscriptions(notchpay_payment_id)
    WHERE notchpay_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notchpay_payments_organizer
    ON public.notchpay_payments(organizer_id, created_at DESC);

ALTER TABLE public.notchpay_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notchpay_payments FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tbf_bypass ON public.notchpay_payments;
CREATE POLICY tbf_bypass ON public.notchpay_payments FOR ALL TO app_admin
    USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());
DROP POLICY IF EXISTS tbf_tenant ON public.notchpay_payments;
CREATE POLICY tbf_tenant ON public.notchpay_payments FOR ALL TO app_admin
    USING (organizer_id = public.app_current_organizer())
    WITH CHECK (organizer_id = public.app_current_organizer());

COMMIT;