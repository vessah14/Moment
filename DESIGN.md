---
name: TBF MOMENT
description: Event sites, invitations and the organiser dashboard, set in a festive night.
colors:
  night: "#0b1020"
  night-surface: "#12172a"
  night-surface-raised: "#1a2036"
  night-panel: "#1e2540"
  night-border: "#2c3352"
  night-border-soft: "#232a45"
  soft-white: "#f8f9fc"
  mist: "#9ba3c2"
  dusk: "#7883a8"
  electric-purple: "#6c4bf4"
  deep-indigo: "#5636d6"
  festive-magenta: "#d946ef"
  champagne-gold: "#d6b36a"
  sunset-orange: "#ff7a3d"
  party-pink: "#ec4ec2"
  success-mint: "#34d399"
  danger-coral: "#f4574c"
  day: "#f6f7fb"
  day-surface: "#ffffff"
  day-surface-raised: "#eef0f6"
  day-border: "#dde1ec"
  day-ink: "#12172a"
  day-muted: "#4b5170"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.33
  title:
    fontFamily: "Plus Jakarta Sans, Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.55
  body:
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  eyebrow:
    fontFamily: "Inter, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    letterSpacing: "0.2em"
  premium-display:
    fontFamily: "Playfair Display, Plus Jakarta Sans, serif"
    fontWeight: 600
rounded:
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "32px"
components:
  button-gradient:
    backgroundColor: "{colors.sunset-orange}"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    typography: "{typography.body}"
  button-solid:
    backgroundColor: "{colors.deep-indigo}"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-solid-hover:
    backgroundColor: "{colors.electric-purple}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.night-surface-raised}"
  card:
    backgroundColor: "{colors.night-surface}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  input:
    backgroundColor: "{colors.night-surface}"
    textColor: "{colors.soft-white}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  nav-item:
    textColor: "{colors.mist}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  nav-item-active:
    backgroundColor: "{colors.deep-indigo}"
    textColor: "{colors.soft-white}"
  chip-count:
    backgroundColor: "{colors.electric-purple}"
    textColor: "{colors.electric-purple}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  dialog:
    backgroundColor: "{colors.night}"
    rounded: "{rounded.2xl}"
    padding: "24px"
---

# Design System: TBF MOMENT

## Overview

**Creative North Star: "La nuit de fête"**

TBF MOMENT is a reception hall at night. The ground is a deep navy night (`night`), layered surfaces are the tables and stages of the room, and colour arrives the way party lights do: electric purple marks what is selected or in focus, and a warm orange-to-pink gradient lights up the one action that moves the event forward. Champagne gold is the jewellery: rare, reserved for premium and VIP moments.

The interface takes part in the celebration. Buttons are soft pills, cards have generous rounded corners, and small movements (a card that lifts on hover, a logo that draws itself, a "M" that traces across the home page) keep it alive. That liveliness never costs clarity: the organiser dashboard stays calm and scannable, and every animation has a `prefers-reduced-motion` fallback. Event sites themselves use a separate theme system (`components/site/themes/`) with their own fonts and palettes; this document covers the platform around them (marketing pages, auth, dashboard).

The system ships dark by default, with a light theme (`[data-theme="light"]`) that swaps only surface and text tokens; brand colours stay the same.

**Key Characteristics:**
- Dark night ground with tonal layering; borders, not shadows, separate surfaces.
- One warm gradient for the primary action; electric purple for selection, focus and links.
- Pill buttons, 16px card corners, 8px field corners.
- Plus Jakarta Sans headings over Inter body text, compact sizes (body at 14px).
- Festive motion, always with a reduced-motion fallback.

## Colors

A night palette lit by electric purple and a sunset gradient, with champagne gold kept for special moments.

### Primary
- **Electric Purple** (`electric-purple`): the brand's working accent. Focus borders on every field, links, eyebrows above headings, count badges in the sidebar, selected states. The most-used brand colour.
- **Deep Indigo** (`deep-indigo`): the darker partner of Electric Purple. Active sidebar item, solid buttons, the start of purple gradients (indigo → purple on selected date pills).

### Secondary
- **Sunset Orange** (`sunset-orange`) and **Party Pink** (`party-pink`): always used together as the 92° gradient (`.bg-brand-gradient`, `.text-brand-gradient`). The primary call to action, highlighted words in marketing headlines, the "recommended" plan ribbon.
- **Festive Magenta** (`festive-magenta`): an official brand accent for decorative touches; rarely used in the UI.

### Tertiary
- **Champagne Gold** (`champagne-gold`): premium and VIP only (gold VIP tickets, premium badges, the loader's dot uses a warmer `#f5c451`).

### Neutral
- **Night** (`night`): page background, dialogs, sidebar.
- **Night Surface** (`night-surface`): cards, inputs, selects.
- **Night Surface Raised** (`night-surface-raised`): hover backgrounds, secondary panels, ghost-button hover.
- **Night Panel** (`night-panel`): occasional raised panels.
- **Night Border** (`night-border`) and **Night Border Soft** (`night-border-soft`): field borders and card borders respectively.
- **Soft White** (`soft-white`): main text on dark.
- **Mist** (`mist`): secondary text, inactive nav items.
- **Dusk** (`dusk`): tertiary text, labels, empty states; lightened to keep 4.5:1 on the night background.
- **Day** palette (`day`, `day-surface`, `day-surface-raised`, `day-border`, `day-ink`, `day-muted`): the same roles in the light theme. Success and danger darken in light mode (`#047857`, `#dc2626`) to stay AA.

### Semantic
- **Success Mint** (`success-mint`) and **Danger Coral** (`danger-coral`): confirmations and errors. Errors are shown as a tinted box: `danger` text on `danger/10` with a `danger/30` border.
- Charts use their own five-colour set (`--color-chart-*`), tuned for contrast.

### Named Rules
**The One Gradient Rule.** The orange-to-pink gradient marks the single primary action of a view (or a highlighted word in a marketing headline). Two gradient buttons side by side means one of them is wrong.

**The Purple Means Here Rule.** Electric Purple signals focus, selection and "you are here". Don't use it as decoration.

**The Gold Is Jewellery Rule.** Champagne Gold appears only on premium or VIP elements. It never becomes a general accent.

## Typography

**Display Font:** Plus Jakarta Sans (with Inter, system-ui)
**Body Font:** Inter (with system-ui, Segoe UI, Roboto)
**Premium Display:** Playfair Display, for premium touches only. Montserrat is loaded for specific brand pieces.

**Character:** A friendly geometric sans for headings, bold and slightly tight, paired with a neutral, highly legible Inter for everything you read or fill in.

### Hierarchy
- **Display** (800, 3rem on desktop, from 1.875rem on phone, line-height 1, tight tracking): marketing hero and section titles. Often carries a gradient-text word.
- **Headline** (700, 1.5rem): dashboard page titles ("Programme — Mariage d'Awa").
- **Title** (700, 1.125rem): dialog titles, card titles.
- **Body** (400, 0.875rem, line-height 1.5): almost all interface text, fields and buttons. Marketing paragraphs step up to 1rem with relaxed leading and a ~36rem max width.
- **Label** (600, 0.6875rem, uppercase, wide tracking, `dusk`): sidebar section headers and small table headers. Field labels use 0.75rem, 500 weight, in `soft-white`.
- **Eyebrow** (600, 0.875rem, uppercase, 0.2em tracking, `electric-purple`): the line above marketing section titles.

### Named Rules
**The Compact Body Rule.** Interface text is 14px. Don't inflate dashboard copy to 16px; hierarchy comes from weight and the heading font, not size jumps.

## Layout

- **Containers:** marketing pages use a centred `max-w-7xl` (80rem) container with 24px side padding; the onboarding dashboard uses `max-w-5xl`. Header height is 64px on phone, 80px from `sm`.
- **Dashboard:** a 256px sticky sidebar from `lg` (collapsible to icons), turning into a slide-in drawer with a dark overlay below `lg`. Content padding is 16px on phone and 32px from `sm`.
- **Two-column tools:** list plus side panel (`1fr 320px`) from `lg`, with the side panel sticky.
- **Rhythm:** 4px base. Common gaps are 8, 12, 16, 24 and 32px; card padding is 20 or 24px; sections on marketing pages use 80px vertical padding.
- **Responsive guards:** grid and flex children may shrink (`min-width: 0`), selects are capped to the viewport, long headings wrap. Dialogs become bottom sheets on phone.

## Elevation & Depth

Flat by default, layered by tone. Surfaces rise by getting slightly lighter (night → surface → surface raised) and are outlined by a 1px soft border. Shadows exist only where something truly floats: the primary gradient button (a soft pink glow), dialogs, the hero phone mock-ups and toasts. Overlays dim the page with `black/50` and a light backdrop blur.

### Shadow Vocabulary
- **Gradient glow** (`box-shadow: 0 10px 15px -3px rgb(236 78 194 / 0.2)`): under the gradient button only.
- **Dialog lift** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): dialogs and floating menus.
- **Hero device** (`box-shadow: 0 40px 80px -30px rgba(0,0,0,0.7)`): home page phone mock-ups.

### Named Rules
**The Tone Before Shadow Rule.** Separate surfaces with a lighter tone and a soft border first. Reach for a shadow only when an element floats above the page (dialog, menu, toast) or is the primary action.

## Shapes

Generously rounded, never sharp. Pill shape (`rounded.full`) for buttons, chips, filter pills and badges. 16px (`rounded.2xl`) for cards, dialogs and empty-state boxes. 12px (`rounded.xl`) for secondary buttons inside dialogs and medium tiles. 8px (`rounded.lg`) for inputs, selects, sidebar items and icon buttons. Borders are 1px; empty states use a dashed soft border.

## Components

### Buttons
Festive and alive: pills with clear weight.
- **Shape:** full pill (`rounded.full`), 12px × 24px padding, 14px semibold text, icon gap of 8px.
- **Gradient (primary):** orange-to-pink gradient, white text, pink glow; hover lowers opacity to 90%.
- **Solid:** deep indigo, hover to electric purple.
- **Outline:** 1px `night-border`, text in `soft-white`; hover brightens the border to `dusk`.
- **Ghost:** text only; hover fills with `night-surface-raised`.
- **White:** white background with purple text, for use on gradient or image backgrounds.
- **Disabled / busy:** label switches to a present participle ("Ajout…", "Suppression…") and the button is disabled.

### Chips
- **Count badge:** pill, `electric-purple` at 20% opacity background with purple text, 12px semibold.
- **Filter / date pills:** pill with a 1px border and muted text; selected becomes the indigo → purple gradient with white text.

### Cards / Containers
- **Corner Style:** 16px.
- **Background:** `night-surface`.
- **Shadow Strategy:** none at rest (see The Tone Before Shadow Rule).
- **Border:** 1px `night-border-soft`; interactive cards turn the border `electric-purple` on hover.
- **Internal Padding:** 20px, or 24px for larger panels.
- **Hover:** grid cards on marketing pages lift by 4px.

### Inputs / Fields
- **Style:** 1px `night-border`, `night-surface` background, 8px corners, 10px × 12px padding, 14px text.
- **Focus:** border shifts to `electric-purple`; no glow.
- **Label:** 12px medium label above, 6px gap.
- **Error:** message in a tinted danger box below the fields; the form keeps what was typed.

### Navigation
- **Public header:** sticky, translucent night (`bg/80`) with blur and a soft bottom border; links are 14px `mist`, hover to `soft-white`.
- **Dashboard sidebar:** grouped items under uppercase labels; items are 14px medium with a 16px icon, 8px corners. Active item is solid deep indigo with white text; hover fills with `night-surface-raised`.

### Dialog
- Centred window on desktop, bottom sheet on phone (rounded top corners only), max height 92svh with scroll. Night background, soft border, 24px padding, bold title with a close button. Escape or a click on the overlay closes it; focus moves inside and returns on close. Destructive confirmation uses a coral solid button.

### Brand Loader (signature)
The TBF mark draws itself in the gradient stroke, a gold dot pops in, then the wordmark rises with wide tracking (0.32em). Under reduced motion, everything appears at once.

## Do's and Don'ts

### Do:
- **Do** keep the night (`night`) as the ground and lift surfaces with `night-surface` / `night-surface-raised` plus a 1px soft border.
- **Do** give each view one gradient primary action; use solid, outline or ghost buttons for the rest.
- **Do** use `electric-purple` for focus borders, links, selected states and eyebrows.
- **Do** use pill buttons, 16px cards and 8px fields.
- **Do** add life with small, purposeful motion (lift on hover, staged entrances), each with a `prefers-reduced-motion` fallback.
- **Do** define any new colour as a token in `@theme` and its light-theme value under `:root[data-theme="light"]`.

### Don't:
- **Don't** put champagne gold on ordinary UI; it is for premium and VIP only.
- **Don't** stack shadows on cards at rest; use tone and borders.
- **Don't** use the orange-to-pink gradient as a background for large areas or for more than one action in a view.
- **Don't** hard-code hex colours in components; use the tokens so both themes work.
- **Don't** use `dusk` or `mist` text for anything smaller than 11px or below AA contrast.
