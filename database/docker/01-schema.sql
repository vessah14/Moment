--
-- PostgreSQL database dump
--

\restrict hsfGCo72aWb2RYWk5LMr9jJkONMxcXFyxUlMC5TeKLux0wpefGFgzeuOYKiYu9Y

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: admin_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.admin_role AS ENUM (
    'support',
    'superadmin'
);


--
-- Name: block_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.block_type AS ENUM (
    'hero',
    'presentation',
    'programme',
    'rsvp',
    'localisation'
);


--
-- Name: event_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_status AS ENUM (
    'brouillon',
    'publie',
    'archive'
);


--
-- Name: guest_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.guest_status AS ENUM (
    'present',
    'absent',
    'en_attente'
);


--
-- Name: plan_billing; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.plan_billing AS ENUM (
    'mensuel',
    'annuel',
    'gratuit'
);


--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_status AS ENUM (
    'actif',
    'expire',
    'annule',
    'essai'
);


--
-- Name: app_current_organizer(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.app_current_organizer() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$ SELECT nullif(current_setting('app.current_organizer_id', true), '')::uuid $$;


--
-- Name: app_rls_bypass(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.app_rls_bypass() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$ SELECT coalesce(current_setting('app.rls_bypass', true), '') = 'on' $$;


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email public.citext NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    role public.admin_role DEFAULT 'support'::public.admin_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.admin_accounts FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE admin_accounts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.admin_accounts IS 'Comptes back-office, entitÃ© distincte de organizers. CrÃ©Ã©s uniquement par un admin existant (pas de self-signup public).';


--
-- Name: admin_mfa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_mfa (
    admin_id uuid NOT NULL,
    secret_protected text NOT NULL,
    enabled_at timestamp with time zone,
    last_used_step bigint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.admin_mfa FORCE ROW LEVEL SECURITY;


--
-- Name: conference_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conference_sessions (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    speaker_id uuid,
    title text NOT NULL,
    room text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.conference_sessions FORCE ROW LEVEL SECURITY;


--
-- Name: event_blocks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_blocks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    block_type text NOT NULL,
    "position" smallint DEFAULT 0 NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.event_blocks FORCE ROW LEVEL SECURITY;


--
-- Name: event_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    description text,
    is_active boolean DEFAULT false NOT NULL,
    wave_introduced smallint DEFAULT 0 NOT NULL,
    field_schema jsonb DEFAULT '[]'::jsonb NOT NULL,
    block_schema jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.event_categories FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE event_categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.event_categories IS 'Catalogue des catÃ©gories d''Ã©vÃ©nement (Â§3). Ajout d''une catÃ©gorie = une ligne, sans migration.';


--
-- Name: COLUMN event_categories.field_schema; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.event_categories.field_schema IS 'SchÃ©ma JSON des champs propres Ã  la catÃ©gorie, consommÃ© par le front (pas de colonnes dÃ©diÃ©es par catÃ©gorie).';


--
-- Name: event_locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    label text NOT NULL,
    address text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    google_place_id text,
    "position" smallint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.event_locations FORCE ROW LEVEL SECURITY;


--
-- Name: event_moderations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_moderations (
    event_id uuid NOT NULL,
    reason character varying(500),
    suspended_by uuid,
    suspended_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.event_moderations FORCE ROW LEVEL SECURITY;


--
-- Name: event_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_reminders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    kind character varying(30) NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    last_sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT event_reminders_kind_check CHECK (((kind)::text = ANY ((ARRAY['non_respondents'::character varying, 'day_before'::character varying, 'thank_you'::character varying])::text[])))
);

ALTER TABLE ONLY public.event_reminders FORCE ROW LEVEL SECURITY;


--
-- Name: event_stats_daily; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_stats_daily (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    stat_date date NOT NULL,
    visits_count integer DEFAULT 0 NOT NULL,
    shares_count integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY public.event_stats_daily FORCE ROW LEVEL SECURITY;


--
-- Name: event_tables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_tables (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    label text NOT NULL,
    capacity smallint DEFAULT 8 NOT NULL,
    "position" smallint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.event_tables FORCE ROW LEVEL SECURITY;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    category_id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    status public.event_status DEFAULT 'brouillon'::public.event_status NOT NULL,
    event_date date,
    start_time time without time zone,
    cover_image_url text,
    theme_color text,
    theme_font text,
    custom_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.events FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.events IS 'EntitÃ© gÃ©nÃ©rique "Ã‰vÃ©nement", cÅ“ur du systÃ¨me (Â§1.2). En Vague 0-1, seule category = mariage est utilisable cÃ´tÃ© produit.';


--
-- Name: COLUMN events.custom_fields; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.events.custom_fields IS 'DonnÃ©es spÃ©cifiques Ã  la catÃ©gorie (ex: histoire du couple) â€” pas de colonnes par catÃ©gorie.';


--
-- Name: external_logins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_logins (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    provider character varying(20) NOT NULL,
    provider_user_id character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.external_logins FORCE ROW LEVEL SECURITY;


--
-- Name: gallery_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gallery_photos (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    url text NOT NULL,
    caption text,
    uploaded_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'EnAttente'::text NOT NULL
);

ALTER TABLE ONLY public.gallery_photos FORCE ROW LEVEL SECURITY;


--
-- Name: gift_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gift_items (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    price_cents integer DEFAULT 0 NOT NULL,
    image_url text,
    is_reserved boolean DEFAULT false NOT NULL,
    reserved_by_name text,
    reserved_by_email text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.gift_items FORCE ROW LEVEL SECURITY;


--
-- Name: guest_book_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_book_entries (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    author_name text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'EnAttente'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reply text
);

ALTER TABLE ONLY public.guest_book_entries FORCE ROW LEVEL SECURITY;


--
-- Name: guest_checkins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_checkins (
    guest_id uuid NOT NULL,
    event_id uuid NOT NULL,
    checked_in_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.guest_checkins FORCE ROW LEVEL SECURITY;


--
-- Name: guest_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    label text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.guest_groups FORCE ROW LEVEL SECURITY;


--
-- Name: guest_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guest_invitations (
    guest_id uuid NOT NULL,
    event_id uuid NOT NULL,
    queued_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone,
    attempts smallint DEFAULT 0 NOT NULL,
    last_error character varying(300)
);

ALTER TABLE ONLY public.guest_invitations FORCE ROW LEVEL SECURITY;


--
-- Name: guests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.guests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    group_id uuid,
    full_name text NOT NULL,
    phone text,
    email public.citext,
    status public.guest_status DEFAULT 'en_attente'::public.guest_status NOT NULL,
    import_batch_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.guests FORCE ROW LEVEL SECURITY;


--
-- Name: message_campaigns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_campaigns (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    channel text NOT NULL,
    subject text,
    body text NOT NULL,
    status text DEFAULT 'Brouillon'::text NOT NULL,
    recipient_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    sent_at timestamp with time zone,
    audience text DEFAULT 'Tous les invitÃ©s'::text NOT NULL
);

ALTER TABLE ONLY public.message_campaigns FORCE ROW LEVEL SECURITY;


--
-- Name: kpay_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.kpay_payments (
    id uuid NOT NULL,
    organizer_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    external_id character varying(100) NOT NULL,
    idempotency_key uuid,
    transaction_id character varying(100),
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    amount integer NOT NULL,
    checkout_url character varying(2048),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    paid_at timestamp with time zone,
    CONSTRAINT kpay_payments_amount_check CHECK ((amount >= 100)),
    CONSTRAINT kpay_payments_status_check CHECK (((status)::text = ANY ((ARRAY['CREATED'::character varying, 'PENDING'::character varying, 'SUCCESSFUL'::character varying, 'FAILED'::character varying, 'EXPIRED'::character varying])::text[])))
);

ALTER TABLE ONLY public.kpay_payments FORCE ROW LEVEL SECURITY;


--
-- Name: organizer_email_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizer_email_verifications (
    organizer_id uuid NOT NULL,
    verified_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.organizer_email_verifications FORCE ROW LEVEL SECURITY;


--
-- Name: organizer_notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizer_notification_settings (
    organizer_id uuid NOT NULL,
    new_rsvp boolean DEFAULT true NOT NULL,
    guestbook boolean DEFAULT true NOT NULL,
    payments boolean DEFAULT true NOT NULL,
    reminders boolean DEFAULT false NOT NULL,
    weekly_summary boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.organizer_notification_settings FORCE ROW LEVEL SECURITY;


--
-- Name: organizer_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizer_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status public.subscription_status DEFAULT 'actif'::public.subscription_status NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ends_at timestamp with time zone,
    kpay_payment_id uuid
);

ALTER TABLE ONLY public.organizer_subscriptions FORCE ROW LEVEL SECURITY;


--
-- Name: organizers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email public.citext NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.organizers FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE organizers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.organizers IS 'Comptes organisateurs (tenants). Un organisateur = un compte, potentiellement plusieurs Ã©vÃ©nements.';


--
-- Name: plan_upgrade_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plan_upgrade_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    plan_id uuid NOT NULL,
    status character varying(20) DEFAULT 'EnAttente'::character varying NOT NULL,
    phone character varying(30),
    message character varying(1000),
    admin_note character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    handled_at timestamp with time zone,
    handled_by uuid,
    CONSTRAINT plan_upgrade_requests_status_check CHECK (((status)::text = ANY ((ARRAY['EnAttente'::character varying, 'Approuvee'::character varying, 'Refusee'::character varying, 'Annulee'::character varying])::text[])))
);

ALTER TABLE ONLY public.plan_upgrade_requests FORCE ROW LEVEL SECURITY;


--
-- Name: platform_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organizer_id uuid NOT NULL,
    rating smallint NOT NULL,
    comment character varying(1000) NOT NULL,
    display_name character varying(80) NOT NULL,
    context character varying(80),
    status character varying(20) DEFAULT 'EnAttente'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    moderated_at timestamp with time zone,
    CONSTRAINT platform_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT platform_reviews_status_check CHECK (((status)::text = ANY ((ARRAY['EnAttente'::character varying, 'Publie'::character varying, 'Refuse'::character varying])::text[])))
);

ALTER TABLE ONLY public.platform_reviews FORCE ROW LEVEL SECURITY;


--
-- Name: program_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.program_items (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    speaker text,
    location text,
    start_time timestamp with time zone,
    duration_minutes integer DEFAULT 30 NOT NULL,
    notify boolean DEFAULT false NOT NULL,
    "position" smallint DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    capacity integer DEFAULT 50 NOT NULL
);

ALTER TABLE ONLY public.program_items FORCE ROW LEVEL SECURITY;


--
-- Name: rsvp_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rsvp_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    guest_id uuid NOT NULL,
    event_id uuid NOT NULL,
    confirmed boolean,
    accompanying_count smallint DEFAULT 0 NOT NULL,
    message text,
    responded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    side character varying(80)
);

ALTER TABLE ONLY public.rsvp_responses FORCE ROW LEVEL SECURITY;


--
-- Name: COLUMN rsvp_responses.side; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.rsvp_responses.side IS 'Choix Â« cÃ´tÃ© Â» de l''invitÃ©, parmi ceux du bloc RSVP de l''Ã©vÃ©nement (null si aucun).';


--
-- Name: seating_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seating_assignments (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    guest_id uuid NOT NULL,
    table_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.seating_assignments FORCE ROW LEVEL SECURITY;


--
-- Name: speakers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.speakers (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    full_name text NOT NULL,
    title text,
    bio text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.speakers FORCE ROW LEVEL SECURITY;


--
-- Name: sponsors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sponsors (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    name text NOT NULL,
    tier text DEFAULT 'Standard'::text NOT NULL,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.sponsors FORCE ROW LEVEL SECURITY;


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    label text NOT NULL,
    price_cents integer DEFAULT 0 NOT NULL,
    currency text DEFAULT 'XAF'::text NOT NULL,
    billing public.plan_billing DEFAULT 'gratuit'::public.plan_billing NOT NULL,
    features jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.subscription_plans FORCE ROW LEVEL SECURITY;


--
-- Name: ticket_sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_sales (
    id uuid NOT NULL,
    ticket_type_id uuid NOT NULL,
    event_id uuid NOT NULL,
    buyer_name text NOT NULL,
    buyer_email text NOT NULL,
    status text DEFAULT 'EnAttente'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.ticket_sales FORCE ROW LEVEL SECURITY;


--
-- Name: ticket_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_types (
    id uuid NOT NULL,
    event_id uuid NOT NULL,
    name text NOT NULL,
    price_cents integer DEFAULT 0 NOT NULL,
    quota integer DEFAULT 0 NOT NULL,
    sold_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.ticket_types FORCE ROW LEVEL SECURITY;


--
-- Name: admin_accounts admin_accounts_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_email_key UNIQUE (email);


--
-- Name: admin_accounts admin_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_pkey PRIMARY KEY (id);


--
-- Name: admin_mfa admin_mfa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_mfa
    ADD CONSTRAINT admin_mfa_pkey PRIMARY KEY (admin_id);


--
-- Name: conference_sessions conference_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conference_sessions
    ADD CONSTRAINT conference_sessions_pkey PRIMARY KEY (id);


--
-- Name: event_blocks event_blocks_event_id_position_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_blocks
    ADD CONSTRAINT event_blocks_event_id_position_key UNIQUE (event_id, "position");


--
-- Name: event_blocks event_blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_blocks
    ADD CONSTRAINT event_blocks_pkey PRIMARY KEY (id);


--
-- Name: event_categories event_categories_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_categories
    ADD CONSTRAINT event_categories_code_key UNIQUE (code);


--
-- Name: event_categories event_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_categories
    ADD CONSTRAINT event_categories_pkey PRIMARY KEY (id);


--
-- Name: event_locations event_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_locations
    ADD CONSTRAINT event_locations_pkey PRIMARY KEY (id);


--
-- Name: event_moderations event_moderations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_moderations
    ADD CONSTRAINT event_moderations_pkey PRIMARY KEY (event_id);


--
-- Name: event_reminders event_reminders_event_id_kind_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_reminders
    ADD CONSTRAINT event_reminders_event_id_kind_key UNIQUE (event_id, kind);


--
-- Name: event_reminders event_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_reminders
    ADD CONSTRAINT event_reminders_pkey PRIMARY KEY (id);


--
-- Name: event_stats_daily event_stats_daily_event_id_stat_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_stats_daily
    ADD CONSTRAINT event_stats_daily_event_id_stat_date_key UNIQUE (event_id, stat_date);


--
-- Name: event_stats_daily event_stats_daily_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_stats_daily
    ADD CONSTRAINT event_stats_daily_pkey PRIMARY KEY (id);


--
-- Name: event_tables event_tables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_tables
    ADD CONSTRAINT event_tables_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);


--
-- Name: external_logins external_logins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_logins
    ADD CONSTRAINT external_logins_pkey PRIMARY KEY (id);


--
-- Name: external_logins external_logins_provider_provider_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_logins
    ADD CONSTRAINT external_logins_provider_provider_user_id_key UNIQUE (provider, provider_user_id);


--
-- Name: gallery_photos gallery_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_photos
    ADD CONSTRAINT gallery_photos_pkey PRIMARY KEY (id);


--
-- Name: gift_items gift_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_items
    ADD CONSTRAINT gift_items_pkey PRIMARY KEY (id);


--
-- Name: guest_book_entries guest_book_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_book_entries
    ADD CONSTRAINT guest_book_entries_pkey PRIMARY KEY (id);


--
-- Name: guest_checkins guest_checkins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_checkins
    ADD CONSTRAINT guest_checkins_pkey PRIMARY KEY (guest_id);


--
-- Name: guest_groups guest_groups_event_id_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_groups
    ADD CONSTRAINT guest_groups_event_id_label_key UNIQUE (event_id, label);


--
-- Name: guest_groups guest_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_groups
    ADD CONSTRAINT guest_groups_pkey PRIMARY KEY (id);


--
-- Name: guest_invitations guest_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_invitations
    ADD CONSTRAINT guest_invitations_pkey PRIMARY KEY (guest_id);


--
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- Name: message_campaigns message_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_campaigns
    ADD CONSTRAINT message_campaigns_pkey PRIMARY KEY (id);


--
-- Name: kpay_payments kpay_payments_external_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kpay_payments
    ADD CONSTRAINT kpay_payments_external_id_key UNIQUE (external_id);


--
-- Name: kpay_payments kpay_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kpay_payments
    ADD CONSTRAINT kpay_payments_pkey PRIMARY KEY (id);


--
-- Name: kpay_payments kpay_payments_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kpay_payments
    ADD CONSTRAINT kpay_payments_transaction_id_key UNIQUE (transaction_id);


--
-- Name: organizer_email_verifications organizer_email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizer_email_verifications
    ADD CONSTRAINT organizer_email_verifications_pkey PRIMARY KEY (organizer_id);


--
-- Name: organizer_notification_settings organizer_notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizer_notification_settings
    ADD CONSTRAINT organizer_notification_settings_pkey PRIMARY KEY (organizer_id);


--
-- Name: organizer_subscriptions organizer_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizer_subscriptions
    ADD CONSTRAINT organizer_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: organizers organizers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizers
    ADD CONSTRAINT organizers_email_key UNIQUE (email);


--
-- Name: organizers organizers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizers
    ADD CONSTRAINT organizers_pkey PRIMARY KEY (id);


--
-- Name: plan_upgrade_requests plan_upgrade_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_upgrade_requests
    ADD CONSTRAINT plan_upgrade_requests_pkey PRIMARY KEY (id);


--
-- Name: platform_reviews platform_reviews_organizer_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_reviews
    ADD CONSTRAINT platform_reviews_organizer_id_key UNIQUE (organizer_id);


--
-- Name: platform_reviews platform_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_reviews
    ADD CONSTRAINT platform_reviews_pkey PRIMARY KEY (id);


--
-- Name: program_items program_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_items
    ADD CONSTRAINT program_items_pkey PRIMARY KEY (id);


--
-- Name: rsvp_responses rsvp_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvp_responses
    ADD CONSTRAINT rsvp_responses_pkey PRIMARY KEY (id);


--
-- Name: seating_assignments seating_assignments_guest_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_assignments
    ADD CONSTRAINT seating_assignments_guest_id_key UNIQUE (guest_id);


--
-- Name: seating_assignments seating_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_assignments
    ADD CONSTRAINT seating_assignments_pkey PRIMARY KEY (id);


--
-- Name: speakers speakers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speakers
    ADD CONSTRAINT speakers_pkey PRIMARY KEY (id);


--
-- Name: sponsors sponsors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_code_key UNIQUE (code);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: ticket_sales ticket_sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_sales
    ADD CONSTRAINT ticket_sales_pkey PRIMARY KEY (id);


--
-- Name: ticket_types ticket_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT ticket_types_pkey PRIMARY KEY (id);


--
-- Name: idx_event_blocks_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_blocks_event_id ON public.event_blocks USING btree (event_id);


--
-- Name: idx_event_locations_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_locations_event_id ON public.event_locations USING btree (event_id);


--
-- Name: idx_event_reminders_enabled; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_reminders_enabled ON public.event_reminders USING btree (enabled) WHERE enabled;


--
-- Name: idx_events_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_category_id ON public.events USING btree (category_id);


--
-- Name: idx_events_organizer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_organizer_id ON public.events USING btree (organizer_id);


--
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- Name: idx_external_logins_organizer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_external_logins_organizer ON public.external_logins USING btree (organizer_id);


--
-- Name: idx_guest_checkins_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_checkins_event ON public.guest_checkins USING btree (event_id);


--
-- Name: idx_guest_invitations_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guest_invitations_pending ON public.guest_invitations USING btree (event_id) WHERE (sent_at IS NULL);


--
-- Name: idx_guests_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_event_id ON public.guests USING btree (event_id);


--
-- Name: idx_guests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_guests_status ON public.guests USING btree (status);


--
-- Name: idx_kpay_payments_organizer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kpay_payments_organizer ON public.kpay_payments USING btree (organizer_id, created_at DESC);

CREATE UNIQUE INDEX uq_kpay_payments_idempotency
    ON public.kpay_payments USING btree (organizer_id, idempotency_key)
    WHERE (idempotency_key IS NOT NULL);


--
-- Name: idx_org_subscriptions_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_subscriptions_org_id ON public.organizer_subscriptions USING btree (organizer_id);


--
-- Name: idx_plan_upgrade_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_plan_upgrade_requests_status ON public.plan_upgrade_requests USING btree (status, created_at DESC);


--
-- Name: idx_platform_reviews_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_reviews_published ON public.platform_reviews USING btree (status, updated_at DESC);


--
-- Name: idx_rsvp_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rsvp_event_id ON public.rsvp_responses USING btree (event_id);


--
-- Name: idx_rsvp_guest_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rsvp_guest_id ON public.rsvp_responses USING btree (guest_id);


--
-- Name: ix_conference_sessions_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_conference_sessions_event_id ON public.conference_sessions USING btree (event_id);


--
-- Name: ix_event_tables_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_event_tables_event_id ON public.event_tables USING btree (event_id);


--
-- Name: ix_gallery_photos_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_gallery_photos_event_id ON public.gallery_photos USING btree (event_id);


--
-- Name: ix_gift_items_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_gift_items_event_id ON public.gift_items USING btree (event_id);


--
-- Name: ix_guest_book_entries_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_guest_book_entries_event_id ON public.guest_book_entries USING btree (event_id);


--
-- Name: ix_message_campaigns_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_message_campaigns_event_id ON public.message_campaigns USING btree (event_id);


--
-- Name: ix_program_items_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_program_items_event_id ON public.program_items USING btree (event_id);


--
-- Name: ix_seating_assignments_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_seating_assignments_event_id ON public.seating_assignments USING btree (event_id);


--
-- Name: ix_seating_assignments_table_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_seating_assignments_table_id ON public.seating_assignments USING btree (table_id);


--
-- Name: ix_speakers_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_speakers_event_id ON public.speakers USING btree (event_id);


--
-- Name: ix_sponsors_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_sponsors_event_id ON public.sponsors USING btree (event_id);


--
-- Name: ix_ticket_sales_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_ticket_sales_event_id ON public.ticket_sales USING btree (event_id);


--
-- Name: ix_ticket_sales_ticket_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_ticket_sales_ticket_type_id ON public.ticket_sales USING btree (ticket_type_id);


--
-- Name: ix_ticket_types_event_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_ticket_types_event_id ON public.ticket_types USING btree (event_id);


--
-- Name: uq_organizer_subscriptions_kpay_payment; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_organizer_subscriptions_kpay_payment ON public.organizer_subscriptions USING btree (kpay_payment_id) WHERE (kpay_payment_id IS NOT NULL);


--
-- Name: uq_plan_upgrade_requests_pending; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_plan_upgrade_requests_pending ON public.plan_upgrade_requests USING btree (organizer_id) WHERE ((status)::text = 'EnAttente'::text);


--
-- Name: admin_accounts trg_admin_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_admin_accounts_updated_at BEFORE UPDATE ON public.admin_accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: event_blocks trg_event_blocks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_event_blocks_updated_at BEFORE UPDATE ON public.event_blocks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: event_categories trg_event_categories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_event_categories_updated_at BEFORE UPDATE ON public.event_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: events trg_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: guests trg_guests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: organizers trg_organizers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_organizers_updated_at BEFORE UPDATE ON public.organizers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: admin_accounts admin_accounts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_accounts
    ADD CONSTRAINT admin_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.admin_accounts(id);


--
-- Name: admin_mfa admin_mfa_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_mfa
    ADD CONSTRAINT admin_mfa_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_accounts(id) ON DELETE CASCADE;


--
-- Name: conference_sessions conference_sessions_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conference_sessions
    ADD CONSTRAINT conference_sessions_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: conference_sessions conference_sessions_speaker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conference_sessions
    ADD CONSTRAINT conference_sessions_speaker_id_fkey FOREIGN KEY (speaker_id) REFERENCES public.speakers(id) ON DELETE SET NULL;


--
-- Name: event_blocks event_blocks_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_blocks
    ADD CONSTRAINT event_blocks_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_locations event_locations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_locations
    ADD CONSTRAINT event_locations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_moderations event_moderations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_moderations
    ADD CONSTRAINT event_moderations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_moderations event_moderations_suspended_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_moderations
    ADD CONSTRAINT event_moderations_suspended_by_fkey FOREIGN KEY (suspended_by) REFERENCES public.admin_accounts(id) ON DELETE SET NULL;


--
-- Name: event_reminders event_reminders_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_reminders
    ADD CONSTRAINT event_reminders_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_stats_daily event_stats_daily_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_stats_daily
    ADD CONSTRAINT event_stats_daily_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_tables event_tables_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_tables
    ADD CONSTRAINT event_tables_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: events events_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.event_categories(id);


--
-- Name: events events_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(id) ON DELETE CASCADE;


--
-- Name: external_logins external_logins_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_logins
    ADD CONSTRAINT external_logins_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(id) ON DELETE CASCADE;


--
-- Name: gallery_photos gallery_photos_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gallery_photos
    ADD CONSTRAINT gallery_photos_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: gift_items gift_items_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_items
    ADD CONSTRAINT gift_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: guest_book_entries guest_book_entries_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_book_entries
    ADD CONSTRAINT guest_book_entries_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: guest_checkins guest_checkins_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_checkins
    ADD CONSTRAINT guest_checkins_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: guest_checkins guest_checkins_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_checkins
    ADD CONSTRAINT guest_checkins_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: guest_groups guest_groups_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_groups
    ADD CONSTRAINT guest_groups_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: guest_invitations guest_invitations_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_invitations
    ADD CONSTRAINT guest_invitations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: guest_invitations guest_invitations_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guest_invitations
    ADD CONSTRAINT guest_invitations_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: guests guests_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: guests guests_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.guest_groups(id) ON DELETE SET NULL;


--
-- Name: message_campaigns message_campaigns_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_campaigns
    ADD CONSTRAINT message_campaigns_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: kpay_payments kpay_payments_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kpay_payments
    ADD CONSTRAINT kpay_payments_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(id) ON DELETE CASCADE;


--
-- Name: kpay_payments kpay_payments_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kpay_payments
    ADD CONSTRAINT kpay_payments_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: organizer_email_verifications organizer_email_verifications_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizer_email_verifications
    ADD CONSTRAINT organizer_email_verifications_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(id) ON DELETE CASCADE;


--
-- Name: organizer_notification_settings organizer_notification_settings_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizer_notification_settings
    ADD CONSTRAINT organizer_notification_settings_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(id) ON DELETE CASCADE;


--
-- Name: organizer_subscriptions organizer_subscriptions_kpay_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizer_subscriptions
    ADD CONSTRAINT organizer_subscriptions_kpay_payment_id_fkey FOREIGN KEY (kpay_payment_id) REFERENCES public.kpay_payments(id) ON DELETE RESTRICT;


--
-- Name: organizer_subscriptions organizer_subscriptions_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizer_subscriptions
    ADD CONSTRAINT organizer_subscriptions_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(id) ON DELETE CASCADE;


--
-- Name: organizer_subscriptions organizer_subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizer_subscriptions
    ADD CONSTRAINT organizer_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: plan_upgrade_requests plan_upgrade_requests_handled_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_upgrade_requests
    ADD CONSTRAINT plan_upgrade_requests_handled_by_fkey FOREIGN KEY (handled_by) REFERENCES public.admin_accounts(id) ON DELETE SET NULL;


--
-- Name: plan_upgrade_requests plan_upgrade_requests_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_upgrade_requests
    ADD CONSTRAINT plan_upgrade_requests_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(id) ON DELETE CASCADE;


--
-- Name: plan_upgrade_requests plan_upgrade_requests_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plan_upgrade_requests
    ADD CONSTRAINT plan_upgrade_requests_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id);


--
-- Name: platform_reviews platform_reviews_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_reviews
    ADD CONSTRAINT platform_reviews_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizers(id) ON DELETE CASCADE;


--
-- Name: program_items program_items_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.program_items
    ADD CONSTRAINT program_items_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: rsvp_responses rsvp_responses_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvp_responses
    ADD CONSTRAINT rsvp_responses_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: rsvp_responses rsvp_responses_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rsvp_responses
    ADD CONSTRAINT rsvp_responses_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: seating_assignments seating_assignments_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_assignments
    ADD CONSTRAINT seating_assignments_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: seating_assignments seating_assignments_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_assignments
    ADD CONSTRAINT seating_assignments_guest_id_fkey FOREIGN KEY (guest_id) REFERENCES public.guests(id) ON DELETE CASCADE;


--
-- Name: seating_assignments seating_assignments_table_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seating_assignments
    ADD CONSTRAINT seating_assignments_table_id_fkey FOREIGN KEY (table_id) REFERENCES public.event_tables(id) ON DELETE CASCADE;


--
-- Name: speakers speakers_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.speakers
    ADD CONSTRAINT speakers_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: sponsors sponsors_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sponsors
    ADD CONSTRAINT sponsors_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: ticket_sales ticket_sales_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_sales
    ADD CONSTRAINT ticket_sales_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: ticket_sales ticket_sales_ticket_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_sales
    ADD CONSTRAINT ticket_sales_ticket_type_id_fkey FOREIGN KEY (ticket_type_id) REFERENCES public.ticket_types(id) ON DELETE CASCADE;


--
-- Name: ticket_types ticket_types_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_types
    ADD CONSTRAINT ticket_types_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: admin_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_mfa; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_mfa ENABLE ROW LEVEL SECURITY;

--
-- Name: event_categories client_reads_active_categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY client_reads_active_categories ON public.event_categories FOR SELECT TO app_client USING ((is_active = true));


--
-- Name: subscription_plans client_reads_active_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY client_reads_active_plans ON public.subscription_plans FOR SELECT TO app_client USING ((is_active = true));


--
-- Name: conference_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conference_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: event_blocks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_blocks ENABLE ROW LEVEL SECURITY;

--
-- Name: event_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: event_locations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_locations ENABLE ROW LEVEL SECURITY;

--
-- Name: event_moderations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_moderations ENABLE ROW LEVEL SECURITY;

--
-- Name: event_reminders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

--
-- Name: event_stats_daily; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_stats_daily ENABLE ROW LEVEL SECURITY;

--
-- Name: event_tables; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.event_tables ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: external_logins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.external_logins ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: gift_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gift_items ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_book_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_book_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_checkins; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_checkins ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: guest_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guest_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: guests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

--
-- Name: message_campaigns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_campaigns ENABLE ROW LEVEL SECURITY;

--
-- Name: kpay_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.kpay_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: organizer_email_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizer_email_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: organizer_notification_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizer_notification_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: organizer_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizer_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: organizers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

--
-- Name: plan_upgrade_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plan_upgrade_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_reviews; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: program_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.program_items ENABLE ROW LEVEL SECURITY;

--
-- Name: rsvp_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: seating_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.seating_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: speakers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;

--
-- Name: sponsors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_accounts tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.admin_accounts TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: admin_mfa tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.admin_mfa TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: conference_sessions tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.conference_sessions TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: event_blocks tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.event_blocks TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: event_categories tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.event_categories TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: event_locations tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.event_locations TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: event_moderations tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.event_moderations TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: event_reminders tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.event_reminders TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: event_stats_daily tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.event_stats_daily TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: event_tables tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.event_tables TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: events tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.events TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: external_logins tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.external_logins TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: gallery_photos tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.gallery_photos TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: gift_items tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.gift_items TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: guest_book_entries tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.guest_book_entries TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: guest_checkins tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.guest_checkins TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: guest_groups tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.guest_groups TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: guest_invitations tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.guest_invitations TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: guests tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.guests TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: message_campaigns tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.message_campaigns TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: kpay_payments tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.kpay_payments TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: organizer_email_verifications tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.organizer_email_verifications TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: organizer_notification_settings tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.organizer_notification_settings TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: organizer_subscriptions tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.organizer_subscriptions TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: organizers tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.organizers TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: plan_upgrade_requests tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.plan_upgrade_requests TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: platform_reviews tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.platform_reviews TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: program_items tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.program_items TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: rsvp_responses tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.rsvp_responses TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: seating_assignments tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.seating_assignments TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: speakers tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.speakers TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: sponsors tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.sponsors TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: subscription_plans tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.subscription_plans TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: ticket_sales tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.ticket_sales TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: ticket_types tbf_bypass; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_bypass ON public.ticket_types TO app_admin USING (public.app_rls_bypass()) WITH CHECK (public.app_rls_bypass());


--
-- Name: event_categories tbf_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_read ON public.event_categories FOR SELECT TO app_admin USING (true);


--
-- Name: subscription_plans tbf_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_read ON public.subscription_plans FOR SELECT TO app_admin USING (true);


--
-- Name: external_logins tbf_signup; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_signup ON public.external_logins TO app_signup USING (true) WITH CHECK (true);


--
-- Name: organizers tbf_signup; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_signup ON public.organizers TO app_signup USING (true) WITH CHECK (true);


--
-- Name: conference_sessions tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.conference_sessions TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: event_blocks tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.event_blocks TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: event_locations tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.event_locations TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: event_moderations tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.event_moderations FOR SELECT TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: event_reminders tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.event_reminders TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: event_stats_daily tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.event_stats_daily TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: event_tables tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.event_tables TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: events tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.events TO app_admin USING ((organizer_id = public.app_current_organizer())) WITH CHECK ((organizer_id = public.app_current_organizer()));


--
-- Name: external_logins tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.external_logins TO app_admin USING ((organizer_id = public.app_current_organizer())) WITH CHECK ((organizer_id = public.app_current_organizer()));


--
-- Name: gallery_photos tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.gallery_photos TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: gift_items tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.gift_items TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: guest_book_entries tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.guest_book_entries TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: guest_checkins tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.guest_checkins TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: guest_groups tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.guest_groups TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: guest_invitations tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.guest_invitations TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: guests tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.guests TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: message_campaigns tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.message_campaigns TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: kpay_payments tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.kpay_payments TO app_admin USING ((organizer_id = public.app_current_organizer())) WITH CHECK ((organizer_id = public.app_current_organizer()));


--
-- Name: organizer_email_verifications tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.organizer_email_verifications TO app_admin USING ((organizer_id = public.app_current_organizer())) WITH CHECK ((organizer_id = public.app_current_organizer()));


--
-- Name: organizer_notification_settings tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.organizer_notification_settings TO app_admin USING ((organizer_id = public.app_current_organizer())) WITH CHECK ((organizer_id = public.app_current_organizer()));


--
-- Name: organizer_subscriptions tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.organizer_subscriptions TO app_admin USING ((organizer_id = public.app_current_organizer())) WITH CHECK ((organizer_id = public.app_current_organizer()));


--
-- Name: organizers tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.organizers TO app_admin USING ((id = public.app_current_organizer())) WITH CHECK ((id = public.app_current_organizer()));


--
-- Name: plan_upgrade_requests tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.plan_upgrade_requests TO app_admin USING ((organizer_id = public.app_current_organizer())) WITH CHECK ((organizer_id = public.app_current_organizer()));


--
-- Name: platform_reviews tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.platform_reviews TO app_admin USING ((organizer_id = public.app_current_organizer())) WITH CHECK ((organizer_id = public.app_current_organizer()));


--
-- Name: program_items tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.program_items TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: rsvp_responses tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.rsvp_responses TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: seating_assignments tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.seating_assignments TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: speakers tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.speakers TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: sponsors tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.sponsors TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: ticket_sales tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.ticket_sales TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: ticket_types tbf_tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY tbf_tenant ON public.ticket_types TO app_admin USING ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer())))) WITH CHECK ((event_id IN ( SELECT e.id
   FROM public.events e
  WHERE (e.organizer_id = public.app_current_organizer()))));


--
-- Name: ticket_sales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_sales ENABLE ROW LEVEL SECURITY;

--
-- Name: ticket_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA public TO app_client;
GRANT USAGE ON SCHEMA public TO app_admin;
GRANT USAGE ON SCHEMA public TO app_signup;


--
-- Name: FUNCTION citextin(cstring); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citextin(cstring) TO app_admin;


--
-- Name: FUNCTION citextout(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citextout(public.citext) TO app_admin;


--
-- Name: FUNCTION citextrecv(internal); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citextrecv(internal) TO app_admin;


--
-- Name: FUNCTION citextsend(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citextsend(public.citext) TO app_admin;


--
-- Name: FUNCTION citext(boolean); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext(boolean) TO app_admin;


--
-- Name: FUNCTION citext(character); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext(character) TO app_admin;


--
-- Name: FUNCTION citext(inet); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext(inet) TO app_admin;


--
-- Name: FUNCTION app_current_organizer(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.app_current_organizer() TO app_admin;


--
-- Name: FUNCTION app_rls_bypass(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.app_rls_bypass() TO app_admin;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.armor(bytea) TO app_admin;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.armor(bytea, text[], text[]) TO app_admin;


--
-- Name: FUNCTION citext_cmp(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_cmp(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_eq(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_eq(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_ge(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_ge(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_gt(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_gt(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_hash(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_hash(public.citext) TO app_admin;


--
-- Name: FUNCTION citext_hash_extended(public.citext, bigint); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_hash_extended(public.citext, bigint) TO app_admin;


--
-- Name: FUNCTION citext_larger(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_larger(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_le(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_le(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_lt(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_lt(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_ne(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_ne(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_pattern_cmp(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_cmp(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_pattern_ge(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_ge(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_pattern_gt(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_gt(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_pattern_le(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_le(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_pattern_lt(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_pattern_lt(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION citext_smaller(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.citext_smaller(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.crypt(text, text) TO app_admin;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.dearmor(text) TO app_admin;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO app_admin;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO app_admin;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.digest(bytea, text) TO app_admin;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.digest(text, text) TO app_admin;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO app_admin;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO app_admin;


--
-- Name: FUNCTION fips_mode(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.fips_mode() TO app_admin;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.gen_random_bytes(integer) TO app_admin;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.gen_random_uuid() TO app_admin;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.gen_salt(text) TO app_admin;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.gen_salt(text, integer) TO app_admin;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO app_admin;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.hmac(text, text, text) TO app_admin;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text) TO app_admin;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO app_admin;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO app_admin;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO app_admin;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO app_admin;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO app_admin;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO app_admin;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO app_admin;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO app_admin;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO app_admin;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO app_admin;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO app_admin;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO app_admin;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO app_admin;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO app_admin;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO app_admin;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO app_admin;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO app_admin;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO app_admin;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO app_admin;


--
-- Name: FUNCTION regexp_match(string public.citext, pattern public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_match(string public.citext, pattern public.citext) TO app_admin;


--
-- Name: FUNCTION regexp_match(string public.citext, pattern public.citext, flags text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_match(string public.citext, pattern public.citext, flags text) TO app_admin;


--
-- Name: FUNCTION regexp_matches(string public.citext, pattern public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_matches(string public.citext, pattern public.citext) TO app_admin;


--
-- Name: FUNCTION regexp_matches(string public.citext, pattern public.citext, flags text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_matches(string public.citext, pattern public.citext, flags text) TO app_admin;


--
-- Name: FUNCTION regexp_replace(string public.citext, pattern public.citext, replacement text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_replace(string public.citext, pattern public.citext, replacement text) TO app_admin;


--
-- Name: FUNCTION regexp_replace(string public.citext, pattern public.citext, replacement text, flags text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_replace(string public.citext, pattern public.citext, replacement text, flags text) TO app_admin;


--
-- Name: FUNCTION regexp_split_to_array(string public.citext, pattern public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_split_to_array(string public.citext, pattern public.citext) TO app_admin;


--
-- Name: FUNCTION regexp_split_to_array(string public.citext, pattern public.citext, flags text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_split_to_array(string public.citext, pattern public.citext, flags text) TO app_admin;


--
-- Name: FUNCTION regexp_split_to_table(string public.citext, pattern public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_split_to_table(string public.citext, pattern public.citext) TO app_admin;


--
-- Name: FUNCTION regexp_split_to_table(string public.citext, pattern public.citext, flags text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.regexp_split_to_table(string public.citext, pattern public.citext, flags text) TO app_admin;


--
-- Name: FUNCTION replace(public.citext, public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.replace(public.citext, public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.set_updated_at() TO app_admin;


--
-- Name: FUNCTION split_part(public.citext, public.citext, integer); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.split_part(public.citext, public.citext, integer) TO app_admin;


--
-- Name: FUNCTION strpos(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.strpos(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION texticlike(public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticlike(public.citext, text) TO app_admin;


--
-- Name: FUNCTION texticlike(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticlike(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION texticnlike(public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticnlike(public.citext, text) TO app_admin;


--
-- Name: FUNCTION texticnlike(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticnlike(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION texticregexeq(public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticregexeq(public.citext, text) TO app_admin;


--
-- Name: FUNCTION texticregexeq(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticregexeq(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION texticregexne(public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticregexne(public.citext, text) TO app_admin;


--
-- Name: FUNCTION texticregexne(public.citext, public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.texticregexne(public.citext, public.citext) TO app_admin;


--
-- Name: FUNCTION translate(public.citext, public.citext, text); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.translate(public.citext, public.citext, text) TO app_admin;


--
-- Name: FUNCTION max(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.max(public.citext) TO app_admin;


--
-- Name: FUNCTION min(public.citext); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION public.min(public.citext) TO app_admin;


--
-- Name: TABLE admin_accounts; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.admin_accounts TO app_admin;


--
-- Name: TABLE admin_mfa; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.admin_mfa TO app_admin;


--
-- Name: TABLE conference_sessions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.conference_sessions TO app_admin;


--
-- Name: TABLE event_blocks; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_blocks TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_blocks TO app_admin;


--
-- Name: TABLE event_categories; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.event_categories TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_categories TO app_admin;


--
-- Name: TABLE event_locations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_locations TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_locations TO app_admin;


--
-- Name: TABLE event_moderations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_moderations TO app_admin;


--
-- Name: TABLE event_reminders; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_reminders TO app_admin;


--
-- Name: TABLE event_stats_daily; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.event_stats_daily TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_stats_daily TO app_admin;


--
-- Name: TABLE event_tables; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.event_tables TO app_admin;


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.events TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.events TO app_admin;


--
-- Name: TABLE external_logins; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT ON TABLE public.external_logins TO app_signup;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.external_logins TO app_admin;


--
-- Name: TABLE gallery_photos; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.gallery_photos TO app_admin;


--
-- Name: TABLE gift_items; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.gift_items TO app_admin;


--
-- Name: TABLE guest_book_entries; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guest_book_entries TO app_admin;


--
-- Name: TABLE guest_checkins; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guest_checkins TO app_admin;


--
-- Name: TABLE guest_groups; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guest_groups TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guest_groups TO app_admin;


--
-- Name: TABLE guest_invitations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guest_invitations TO app_admin;


--
-- Name: TABLE guests; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guests TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.guests TO app_admin;


--
-- Name: TABLE message_campaigns; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.message_campaigns TO app_admin;


--
-- Name: TABLE kpay_payments; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.kpay_payments TO app_admin;


--
-- Name: TABLE organizer_email_verifications; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.organizer_email_verifications TO app_admin;


--
-- Name: TABLE organizer_notification_settings; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.organizer_notification_settings TO app_admin;


--
-- Name: TABLE organizer_subscriptions; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.organizer_subscriptions TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.organizer_subscriptions TO app_admin;


--
-- Name: TABLE organizers; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT ON TABLE public.organizers TO app_signup;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.organizers TO app_admin;


--
-- Name: COLUMN organizers.email; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(email) ON TABLE public.organizers TO app_signup;


--
-- Name: COLUMN organizers.password_hash; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(password_hash) ON TABLE public.organizers TO app_signup;


--
-- Name: COLUMN organizers.full_name; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(full_name) ON TABLE public.organizers TO app_signup;


--
-- Name: COLUMN organizers.phone; Type: ACL; Schema: public; Owner: -
--

GRANT INSERT(phone) ON TABLE public.organizers TO app_signup;


--
-- Name: TABLE plan_upgrade_requests; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.plan_upgrade_requests TO app_admin;


--
-- Name: TABLE platform_reviews; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.platform_reviews TO app_admin;


--
-- Name: TABLE program_items; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.program_items TO app_admin;


--
-- Name: TABLE rsvp_responses; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.rsvp_responses TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.rsvp_responses TO app_admin;


--
-- Name: TABLE seating_assignments; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.seating_assignments TO app_admin;


--
-- Name: TABLE speakers; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.speakers TO app_admin;


--
-- Name: TABLE sponsors; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.sponsors TO app_admin;


--
-- Name: TABLE subscription_plans; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.subscription_plans TO app_client;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.subscription_plans TO app_admin;


--
-- Name: TABLE ticket_sales; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.ticket_sales TO app_admin;


--
-- Name: TABLE ticket_types; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.ticket_types TO app_admin;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO app_admin;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO app_admin;


--
-- PostgreSQL database dump complete
--

\unrestrict hsfGCo72aWb2RYWk5LMr9jJkONMxcXFyxUlMC5TeKLux0wpefGFgzeuOYKiYu9Y
