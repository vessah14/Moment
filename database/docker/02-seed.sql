--
-- PostgreSQL database dump
--

\restrict tXPkaKCem8Nza9cJFcWUXsc0rGHNB0IhhIKHwngrqyOSdvaAsOzDFb10MirtSVx

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
SET row_security = on;

--
-- Data for Name: event_categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('119cd5ba-539d-4b51-9d2c-4db7e6c6efe2', 'autre', 'Autre', 'Un autre type d''événement', true, 0, '[]', '[]', '2026-08-31 10:49:36.764079+02', '2026-09-18 20:15:47.975658+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('4578ef1d-44a9-4c65-be33-9cc5aaf03913', 'baby_shower', 'Baby shower et naissance', 'Fêtez l''arrivée de bébé avec vos proches', true, 0, '[]', '[]', '2026-10-21 08:26:02.378093+02', '2026-10-22 09:44:08.538508+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('fb7f3c2d-3519-47f7-ad3f-6b2b4f738fd7', 'retrait_deuil', 'Retrait de deuil', 'Levez le deuil et célébrez la vie d''un être cher', true, 0, '[]', '[]', '2026-10-21 08:26:02.378093+02', '2026-10-22 09:44:08.538508+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('2c8dcdf4-031f-45d6-ae8c-81a80f7fbee3', 'fetes_saisons', 'Fêtes et saisons', 'Noël, Saint-Valentin, Aïd, Pâques, 20 mai, fête des mères', true, 0, '[]', '[]', '2026-10-21 08:26:02.378093+02', '2026-10-22 09:44:08.538508+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('45bc3b84-fdff-4f21-835e-a42709b4f526', 'anniversaire', 'Anniversaire et célébration', 'Fêtez un nouvel an avec vos proches', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.60875+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('4fa3ab0a-c368-40b9-8be7-c1c6e0aa0803', 'bapteme', 'Baptême et cérémonie familiale', 'Célébrez une nouvelle naissance en famille', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.637224+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('7634c293-8f33-48ea-b3c9-daa43352b67d', 'competition_sportive', 'Compétition et événement sportif', 'Tournois, matchs et classements', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.637772+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('e4ef74cc-365a-4b48-aa01-d349f589cef5', 'concert', 'Concert et spectacle', 'Programmez artistes et billetterie', true, 3, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.638167+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('2daf705e-29ad-4f35-a19c-2417caaee36c', 'conference', 'Conférence, séminaire et atelier', 'Speakers, sessions et sponsors', true, 3, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.638574+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('4b07b619-2fe1-4a14-a332-ee1d4bf969b1', 'evenement_entreprise', 'Événement d''entreprise', 'Lancements et séminaires d''entreprise', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.638957+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('2ff09ca0-e877-4f79-ad75-5c35628a4526', 'personnalise', 'Événement personnalisé', 'Créez un événement qui vous ressemble', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.639294+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('4831d4fe-7ad0-41fd-b8d0-67cb4901a996', 'evenement_religieux', 'Événement religieux', 'Cérémonies et rassemblements spirituels', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.63965+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('1f1a5a61-32e5-4877-9b2d-57f3d74c89f1', 'evenement_scolaire', 'Événement scolaire ou universitaire', 'Remises de diplômes, portes ouvertes', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.639962+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('51be82d8-6bdd-4e96-b8e8-59b8e93a9fe4', 'graduation', 'Graduation et remise de diplômes', 'Célébrez un diplôme ou une réussite', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.640252+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('71321d0e-a221-49e0-9ab0-ef58faaba5bc', 'mariage', 'Mariage et fiançailles', 'Cérémonie, réception et liste de mariage', true, 0, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.640525+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('3a5ba2cf-a704-4b13-ac3c-86849e733d8e', 'obseques', 'Obsèques, commémoration et hommage', 'Honorez la mémoire d''un être cher', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.640818+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('c204745a-c81e-4189-b263-60220a87e9a1', 'reunion_familiale', 'Réunion familiale', 'Réunissez petits et grands', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.641088+02');
INSERT INTO public.event_categories (id, code, label, description, is_active, wave_introduced, field_schema, block_schema, created_at, updated_at) VALUES ('4d95029e-a00e-422a-bf8c-6b23d16c2e8b', 'soiree_privee', 'Soirée et événement privé', 'Une soirée entre amis ou en famille', true, 2, '[]', '[]', '2026-08-28 16:35:26.940113+02', '2026-09-18 20:25:51.641359+02');


--
-- Data for Name: subscription_plans; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.subscription_plans (id, code, label, price_cents, currency, billing, features, is_active, created_at) VALUES ('c85ee316-851a-4ae3-8b61-23950bacad85', 'free', 'Free', 0, 'XAF', 'gratuit', '{"checkin": true, "seating": false, "branding": false, "maxEvents": 3, "maxGuests": 50, "maxPhotos": 20, "ticketing": false, "autoReminders": false, "premiumTemplates": false}', true, '2026-10-09 10:39:09.579274+02');
INSERT INTO public.subscription_plans (id, code, label, price_cents, currency, billing, features, is_active, created_at) VALUES ('0da52183-ae8f-47e8-be44-3f87e704d4d5', 'premium', 'Premium', 500000, 'XAF', 'mensuel', '{"checkin": true, "seating": true, "branding": false, "maxEvents": 3, "maxGuests": 500, "maxPhotos": 200, "ticketing": false, "autoReminders": false, "premiumTemplates": true}', true, '2026-08-31 11:07:22.922797+02');
INSERT INTO public.subscription_plans (id, code, label, price_cents, currency, billing, features, is_active, created_at) VALUES ('23f95c4d-79bc-4615-accf-b27777bb0e74', 'business', 'Business', 1500000, 'XAF', 'mensuel', '{"checkin": true, "seating": true, "branding": true, "maxEvents": null, "maxGuests": 2000, "maxPhotos": 1000, "ticketing": true, "autoReminders": false, "premiumTemplates": true}', true, '2026-10-09 10:39:09.579274+02');
INSERT INTO public.subscription_plans (id, code, label, price_cents, currency, billing, features, is_active, created_at) VALUES ('3f2c2356-240a-4244-b6ec-a79aee25a13f', 'eventpro', 'Event Pro', 3000000, 'XAF', 'mensuel', '{"checkin": true, "seating": true, "branding": true, "maxEvents": null, "maxGuests": null, "maxPhotos": 5000, "ticketing": true, "autoReminders": true, "premiumTemplates": true}', true, '2026-10-09 10:39:09.579274+02');


--
-- PostgreSQL database dump complete
--

\unrestrict tXPkaKCem8Nza9cJFcWUXsc0rGHNB0IhhIKHwngrqyOSdvaAsOzDFb10MirtSVx
