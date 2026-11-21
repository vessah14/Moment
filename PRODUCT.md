# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

TBF Moment serves four audiences, all confirmed:

- **Private individuals and families** organising a wedding (civil or religious), a baptism, a birthday or another family celebration. They are often on a phone and are not event professionals.
- **Event professionals**: wedding planners and agencies running several events for their clients.
- **Organisations**: associations, schools, companies and institutions running conferences, cultural days or ticketed events, sometimes needing an invoice in the organisation's name.
- **Guests**: the people who receive the invitation link, usually on a phone and often from WhatsApp. They open the event site, reply (RSVP), sign the guestbook, share photos, reserve a gift or buy a ticket. They never create an account.

Organisers work in the dashboard (Operate). Guests only see the public event pages.

## Product Purpose

An organiser creates an event site in minutes and runs the whole event from one dashboard: invitations and RSVPs, guest list and groups, seating plan, programme, QR passes and check-in on the day, gallery, guestbook, gift registry, ticketing, messages to guests and statistics. Success means guests reply and show up, the organiser always knows who is coming, and the day runs without separate tools or spreadsheets.

## Positioning

- **All-in-one**: event site, invitations, RSVP, seating plan, gallery, guestbook, gift registry and ticketing in one place, with no tools to stitch together.
- **Local payment**: Mobile Money through SasPay, prices in FCFA, monthly plans you can stop after the event ("payez un mois, arrêtez après la fête").
- **Local culture**: templates and flows built for West African ceremonies and the extended family (religious ceremony, baptism, programme shared with the family, contributions).
- **Memorable for guests**: animated openings, music, particles and gold VIP tickets make the invitation itself an event.

## Operating Context

- Organisers prepare the event over weeks in the dashboard, often on a phone.
- Guests receive the link through WhatsApp, SMS or e-mail and open it on a phone.
- On the day, hosts scan QR passes at the entrance (check-in, up to 5 stations on Business), and guests can share their photos and mark themselves "en route".
- Every dashboard notification is also sent to the organiser by e-mail (Brevo), subject to their notification preferences.
- An admin console (`admin/`) handles moderation, including customer reviews before they are published.

## Capabilities and Constraints

- **Plans**: Free, Premium (up to 500 guests, seating plan, QR passes, scanner), Business (no TBF Moment mention, 5 check-in stations, ticketing at 5% commission, invoice for the organisation), Event Pro (unlimited events and guests, 5,000 photos, automatic e-mail reminders, ticketing at 3%) and Enterprise (custom template, negotiated commission, dedicated contact). Limits apply per event.
- **Payments**: SasPay (Mobile Money). The `kpay_payments` table is a historical name.
- **Stack**: React 19, Vite and Tailwind 4 frontend (`frontend/`), separate React admin console (`admin/`), .NET 8 API, PostgreSQL with row-level security (each organiser sees only their own data).
- **Event-site themes**: a theme system in `frontend/src/components/site/themes/` (for example `envol`, `minuit`) plus a site builder.
- **Analytics**: Google Analytics 4 loads only after cookie consent. The CSP is defined in `frontend/csp.build.js` and `vercel.json` and must allow any new external origin.
- **Mobile first**: guest pages are opened on phones first, then the dashboard.
- **Slow networks**: pages must stay light and usable on 3G or limited data plans. Heavy effects (music, particles, animations) must not block content or the RSVP.
- **Languages**: French by default and English for the whole site, including the dashboard (`frontend/src/i18n/`). Guest pages (`/e/`, `/invitation/`, `/cadeaux/`) stay in the organiser's language.

## Brand Commitments

- Name: **TBF MOMENT** (also written TBF Moment).
- Logos and source files are in `brand/logos/`.
- Voice: warm, direct, tutoiement-free French ("vous"). Avoid jargon and speak to someone celebrating, not to an IT manager.

## Evidence on Hand

- **Customer reviews**: real reviews only, submitted by organisers (`/dashboard/avis`) and published after admin moderation. The home page Testimonials section hides itself when none are published. Never invent testimonials, customer names, figures or logos.
- **Pricing and plan limits**: in the code (`Pricing.jsx`, `PLAN_EVENT_LIMITS`). These are the source of truth for any price or limit shown.
- **Not available**: no customer statistics, press coverage, partner logos or case studies have been supplied. Do not fabricate them.

## Product Principles

1. **The guest's phone comes first**: an invitation that is slow or confusing on a phone opened from WhatsApp has failed, however beautiful it is.
2. **Emotion on the guest side, clarity on the organiser side**: event pages may surprise and delight; the dashboard must be calm, scannable and predictable.
3. **One place for the whole event**: a new feature joins the existing flows (guests, programme, notifications) instead of becoming a separate tool.
4. **Pay for what you need, when you need it**: limits and upgrades are stated plainly, in FCFA, without traps.
5. **Real proof only**: social proof, numbers and claims come from real data or are left out.

## Accessibility & Inclusion

- Accessibility is a confirmed requirement. The exact standard is not yet stated; work to **WCAG 2.1 AA** until the team confirms otherwise.
- Readable on small screens and in bright outdoor light (contrast, text size, touch targets).
- Animations and music must be optional and respect `prefers-reduced-motion`. Sound never starts without an action from the guest.
- Many users are not technical: labels in plain language, clear error messages, no meaning carried by colour alone.
