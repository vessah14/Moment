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
