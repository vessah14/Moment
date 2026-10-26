import { BLOCK_CONTENT_DEFAULTS } from "../data/blockDefaults";
import { EVENT_TYPES } from "../data/eventTypes";
import { TEMPLATES } from "../data/templates";

export function findTemplate(name) {
  if (!name) return null;
  return TEMPLATES.find((tpl) => tpl.name === name) ?? null;
}

function normalizeCategory(value) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function templateMatchesCategory(template, categoryCode, categoryLabel) {
  if (!template) return false;

  const categoryCodes = [normalizeCategory(categoryCode)];
  const templateCodes = [normalizeCategory(template.categoryCode)];
  if (categoryCodes.some((code) => code && templateCodes.includes(code))) {
    return true;
  }

  const normalizedLabel = normalizeCategory(categoryLabel);
  const normalizedTemplateCategory = normalizeCategory(template.category);
  return Boolean(
    normalizedLabel &&
      normalizedTemplateCategory &&
      normalizedLabel.includes(normalizedTemplateCategory),
  );
}

export function templatesForCategory(categoryCode, categoryLabel) {
  return TEMPLATES.filter((template) =>
    templateMatchesCategory(template, categoryCode, categoryLabel),
  );
}

export function templatesForEventType(typeId, categoryCode, categoryLabel) {
  const type = EVENT_TYPES.find((candidate) => candidate.id === typeId);
  if (!type) return templatesForCategory(categoryCode, categoryLabel);

  const designed = type.templates
    .map((theme) => TEMPLATES.find((template) => template.theme === theme))
    .filter(Boolean);
  const free = templatesForCategory(type.categoryCode).filter(
    (template) => !template.premium && !designed.includes(template),
  );
  return [...designed, ...free];
}

function parseHex(hex) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Mélange deux couleurs hexadécimales : ratio 0 = a, 1 = b.
function mix(a, b, ratio) {
  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);
  const channel = (x, y) =>
    Math.round(x + (y - x) * ratio)
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r1, r2)}${channel(g1, g2)}${channel(b1, b2)}`;
}

// Police des titres du mini-site. Les clés correspondent aux choix du panneau de
// style du Builder (heroContent.font).
export const HEADING_FONT_STACKS = {
  "Plus Jakarta Sans + DM Sans": "var(--font-heading)",
  "Inter + Inter": "var(--font-sans)",
  "Playfair Display + Inter": "var(--font-display-premium)",
};

export function defaultFontForTemplate(template) {
  return template?.preview?.serif
    ? "Playfair Display + Inter"
    : "Plus Jakarta Sans + DM Sans";
}

export const DEFAULT_ACCENT = "#6c4bf4";

// Les couleurs finissent dans le CSS de la page : on n'accepte qu'un hex à 6 chiffres.
export function safeHexColor(value) {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : null;
}

// Le modèle choisi dans l'assistant est rangé dans event.customFields (JSON).
export function templateFromCustomFields(raw) {
  try {
    const parsed = JSON.parse(raw || "{}");
    return findTemplate(typeof parsed?.template === "string" ? parsed.template : null);
  } catch {
    return null;
  }
}

// Couleur d'accent et police des titres du site d'un événement. Le modèle donne les
// valeurs par défaut ; un choix explicite fait dans le Builder (heroContent.customStyle)
// passe devant. Sans modèle, on retombe sur le Hero puis sur la couleur de l'événement.
export function resolveSiteStyle({ template, heroContent = {}, themeColor } = {}) {
  const heroColor = safeHexColor(heroContent.color);
  const heroFont = HEADING_FONT_STACKS[heroContent.font] ? heroContent.font : null;
  const custom = Boolean(heroContent.customStyle);

  const accent =
    (custom && heroColor) ||
    template?.preview?.accent ||
    heroColor ||
    safeHexColor(themeColor) ||
    DEFAULT_ACCENT;
  const fontKey =
    (custom && heroFont) ||
    (template && defaultFontForTemplate(template)) ||
    heroFont ||
    "Playfair Display + Inter";

  return { accent, fontKey, headingFont: HEADING_FONT_STACKS[fontKey] };
}

// Variables CSS complètes d'une page publique : couleurs du modèle, accent, police des
// titres et arrondi des sections. À poser sur l'élément racine de la page.
export function siteRootStyle(template, { accent, headingFont }) {
  return {
    ...siteThemeStyle(template, accent),
    "--site-heading-font": headingFont,
    "--site-panel-radius": template?.presentation?.panelRadius ?? "1.75rem",
    fontFamily:
      template?.categoryCode === "mariage"
        ? "var(--font-montserrat)"
        : "var(--font-sans)",
  };
}

// Composition de blocs (hors Hero) proposée par un modèle.
export function templateBlocks(template) {
  return Array.isArray(template?.blocks) ? template.blocks : [];
}

// Composition minimale d'un nouveau site : sections du modèle, programme, RSVP et
// contributions. Les sections ajoutées restent avant le pied de page.
export function newEventPageBlocks(template) {
  const blocks = [...templateBlocks(template)];
  const additions = ["Programme", "Cadeaux", "RSVP"].filter(
    (type) => !blocks.includes(type),
  );
  const footer = blocks.indexOf("Pied de page");
  blocks.splice(footer < 0 ? blocks.length : footer, 0, ...additions);
  return blocks;
}

export function missingEventPageBlocks(template, existingBlocks = []) {
  const existing = new Set(
    existingBlocks.map((block) =>
      normalizeBlockType(typeof block === "string" ? block : block?.blockType),
    ),
  );
  return newEventPageBlocks(template).filter((type) => !existing.has(type));
}

export function ensureRsvpBlock(blocks) {
  if (blocks.includes("RSVP")) return [...blocks];
  const result = [...blocks];
  const footer = result.indexOf("Pied de page");
  result.splice(footer < 0 ? result.length : footer, 0, "RSVP");
  return result;
}

// Titre de section proposé par un modèle (« Line-up » pour un concert, « Registre de
// condoléances » pour un hommage…), sinon le titre par défaut du bloc.
export function templateBlockHeading(template, type) {
  const heading = template?.headings?.[type];
  if (typeof heading === "string") return heading;
  // Modèles premium : titres sobres de leurs démos plutôt que les titres par défaut du
  // Builder, pensés pour un mariage (« Le Programme de la Journée »…).
  if (template?.theme && PREMIUM_HEADINGS[type]) return PREMIUM_HEADINGS[type];
  return BLOCK_CONTENT_DEFAULTS[type]?.heading ?? "";
}

const PREMIUM_HEADINGS = {
  Invitation: "Invitation",
  Histoire: "Notre histoire",
  Programme: "Programme",
  Localisation: "Le lieu",
  Galerie: "Galerie",
  "Livre d'or": "Livre d'or",
  RSVP: "Serez-vous des nôtres ?",
  Billetterie: "Billetterie",
  FAQ: "Questions fréquentes",
  "Plan de table": "Trouver ma place",
};

// Contenu propre à un modèle pour un bloc (ex. « La marraine » / « Le parrain » au lieu
// des deux familles d'un mariage), sans exemple de contenu.
export function templateBlockContent(template, type) {
  const content = template?.content?.[type];
  return content && typeof content === "object" ? content : {};
}

// Contenu initial des blocs d'un modèle (titres de section du modèle), pour une page
// encore vide.
export function templateBlockDefaults(template) {
  return Object.fromEntries(
    templateBlocks(template).map((type) => [
      type,
      {
        ...BLOCK_CONTENT_DEFAULTS[type],
        ...templateBlockContent(template, type),
        heading: templateBlockHeading(template, type),
      },
    ]),
  );
}

// Anciennes données : l'assistant créait un bloc "Rsvp", le Builder utilise "RSVP".
export function normalizeBlockType(type) {
  return type === "Rsvp" ? "RSVP" : type;
}

// Redéfinit les variables de couleur de l'interface (--color-bg, --color-ink...) à
// l'échelle du mini-site : toutes les classes Tailwind qui s'appuient dessus (bg-bg,
// text-ink, border-border-soft, text-brand-purple...) prennent alors les couleurs du
// modèle, sans dépendre du thème clair/sombre choisi par le visiteur sur TBF Moment.
export function siteThemeStyle(template, accentOverride) {
  const preview = template?.preview;
  if (!preview)
    return accentOverride ? { "--color-brand-purple": accentOverride } : {};

  const { bg, ink } = preview;
  const accent = accentOverride || preview.accent;
  return {
    "--color-bg": bg,
    "--color-surface": mix(bg, ink, 0.04),
    "--color-surface-2": mix(bg, ink, 0.08),
    "--color-panel": mix(bg, ink, 0.06),
    "--color-border": mix(bg, ink, 0.2),
    "--color-border-soft": mix(bg, ink, 0.12),
    "--color-ink": ink,
    "--color-muted": mix(ink, bg, 0.3),
    "--color-faint": mix(ink, bg, 0.45),
    "--color-brand-purple": accent,
    backgroundColor: bg,
    color: ink,
  };
}
