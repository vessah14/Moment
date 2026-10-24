-- Retire les anciens noms Notch Pay du schéma actif en préservant toutes les données.
-- Les anciennes migrations restent dans l'historique pour les bases déjà initialisées.
-- À exécuter avec le compte postgres. Rejouable sans risque.
BEGIN;
SET LOCAL app.rls_bypass = 'on';

DO $$
BEGIN
    IF to_regclass('public.notchpay_payments') IS NOT NULL
       AND to_regclass('public.kpay_payments') IS NULL THEN
        ALTER TABLE public.notchpay_payments RENAME TO kpay_payments;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'organizer_subscriptions'
          AND column_name = 'notchpay_payment_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'organizer_subscriptions'
          AND column_name = 'kpay_payment_id'
    ) THEN
        ALTER TABLE public.organizer_subscriptions
            RENAME COLUMN notchpay_payment_id TO kpay_payment_id;
    END IF;

    IF to_regclass('public.idx_notchpay_payments_organizer') IS NOT NULL
       AND to_regclass('public.idx_kpay_payments_organizer') IS NULL THEN
        ALTER INDEX public.idx_notchpay_payments_organizer
            RENAME TO idx_kpay_payments_organizer;
    END IF;
    IF to_regclass('public.uq_notchpay_payments_idempotency') IS NOT NULL
       AND to_regclass('public.uq_kpay_payments_idempotency') IS NULL THEN
        ALTER INDEX public.uq_notchpay_payments_idempotency
            RENAME TO uq_kpay_payments_idempotency;
    END IF;
    IF to_regclass('public.uq_organizer_subscriptions_notchpay_payment') IS NOT NULL
       AND to_regclass('public.uq_organizer_subscriptions_kpay_payment') IS NULL THEN
        ALTER INDEX public.uq_organizer_subscriptions_notchpay_payment
            RENAME TO uq_organizer_subscriptions_kpay_payment;
    END IF;

    IF to_regclass('public.kpay_payments') IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.kpay_payments'::regclass AND conname = 'notchpay_payments_pkey') THEN
            ALTER TABLE public.kpay_payments RENAME CONSTRAINT notchpay_payments_pkey TO kpay_payments_pkey;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.kpay_payments'::regclass AND conname = 'notchpay_payments_external_id_key') THEN
            ALTER TABLE public.kpay_payments RENAME CONSTRAINT notchpay_payments_external_id_key TO kpay_payments_external_id_key;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.kpay_payments'::regclass AND conname = 'notchpay_payments_transaction_id_key') THEN
            ALTER TABLE public.kpay_payments RENAME CONSTRAINT notchpay_payments_transaction_id_key TO kpay_payments_transaction_id_key;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.kpay_payments'::regclass AND conname = 'notchpay_payments_organizer_id_fkey') THEN
            ALTER TABLE public.kpay_payments RENAME CONSTRAINT notchpay_payments_organizer_id_fkey TO kpay_payments_organizer_id_fkey;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.kpay_payments'::regclass AND conname = 'notchpay_payments_plan_id_fkey') THEN
            ALTER TABLE public.kpay_payments RENAME CONSTRAINT notchpay_payments_plan_id_fkey TO kpay_payments_plan_id_fkey;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.kpay_payments'::regclass AND conname = 'notchpay_payments_amount_check') THEN
            ALTER TABLE public.kpay_payments RENAME CONSTRAINT notchpay_payments_amount_check TO kpay_payments_amount_check;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.kpay_payments'::regclass AND conname = 'notchpay_payments_status_check') THEN
            ALTER TABLE public.kpay_payments RENAME CONSTRAINT notchpay_payments_status_check TO kpay_payments_status_check;
        END IF;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.organizer_subscriptions'::regclass
          AND conname = 'organizer_subscriptions_notchpay_payment_id_fkey'
    ) THEN
        ALTER TABLE public.organizer_subscriptions
            RENAME CONSTRAINT organizer_subscriptions_notchpay_payment_id_fkey
            TO organizer_subscriptions_kpay_payment_id_fkey;
    END IF;
END $$;

COMMIT;
