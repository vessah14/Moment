// SEO au build et en dev (plugin Vite) :
//  - robots.txt et sitemap.xml avec la vraie adresse du site (VITE_SITE_URL) ;
//  - une page HTML par route publique (dist/tarifs/index.html…) avec son titre, sa
//    description, son URL canonique, ses balises de partage et ses données structurées :
//    lisibles par les robots qui n'exécutent pas le JavaScript (aperçus WhatsApp,
//    Facebook, LinkedIn, premier passage de Google) ;
//  - balises de vérification Google Search Console / Bing si elles sont configurées.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { PUBLIC_ROUTES } from "./src/data/seoRoutes.js";
import { buildSeoTags, serializeJsonLd } from "./src/utils/seoTags.js";

// Espaces privés ou personnels : jamais explorés (ils portent aussi un "noindex").
const DISALLOWED = [
  "/dashboard",
  "/builder/",
  "/invitation/",
  "/cadeaux/",
  "/connexion",
  "/bienvenue",
  "/mot-de-passe-oublie",
  "/reinitialiser-mot-de-passe",
  "/verifier-email",
  "/auth/",
  "/loading",
  "/chargement",
];

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Remplace les balises SEO par défaut de index.html par celles de la route.
export function renderRouteHtml(html, route, site) {
  const tags = buildSeoTags(
    { title: route.title, description: route.description, path: route.path, jsonLd: route.jsonLd?.(site) ?? null },
    site,
    route.path,
  );
  const cleaned = html
    .replace(/<title>[\s\S]*?<\/title>\s*/i, "")
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[\w:]+|twitter:[\w:]+)"[\s\S]*?\/?>\s*/gi, "")
    .replace(/<link\s+rel="canonical"[\s\S]*?\/?>\s*/gi, "")
    .replace(/<script type="application\/ld\+json"[\s\S]*?<\/script>\s*/gi, "");
  const head = [
    `<title>${escapeAttr(tags.title)}</title>`,
    ...tags.meta.map(([attr, key, content]) => `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`),
    `<link rel="canonical" href="${escapeAttr(tags.canonical)}" />`,
    // id seo-jsonld : useSeo remplace ensuite ce bloc au lieu d'en ajouter un second.
    tags.jsonLd ? `<script type="application/ld+json" id="seo-jsonld">${serializeJsonLd(tags.jsonLd)}</script>` : "",
  ]
    .filter(Boolean)
    .join("\n    ");
  return cleaned.replace("</head>", `    ${head}\n  </head>`);
}

export default function seoPlugin(env) {
  const site = (env.VITE_SITE_URL || "http://localhost:5173").replace(/\/+$/, "");
  const apiOrigin = (env.VITE_API_URL || "").replace(/\/api\/?$/, "");
  const sitemaps = [`${site}/sitemap.xml`];
  if (apiOrigin) sitemaps.push(`${apiOrigin}/sitemap-events.xml`);

  const robots = [
    "User-agent: *",
    "Allow: /",
    ...DISALLOWED.map((path) => `Disallow: ${path}`),
    "",
    ...sitemaps.map((url) => `Sitemap: ${url}`),
    "",
  ].join("\n");

  const today = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_ROUTES.map(
  (page) => `  <url>
    <loc>${site}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
).join("\n")}
</urlset>
`;

  // Vérification de propriété (Search Console, Bing Webmaster Tools), si configurée.
  const verification = [
    ["google-site-verification", env.VITE_GOOGLE_SITE_VERIFICATION],
    ["msvalidate.01", env.VITE_BING_SITE_VERIFICATION],
  ]
    .filter(([, value]) => value && /^[\w-]+$/.test(value))
    .map(([name, value]) => `<meta name="${name}" content="${value}" />`);

  const files = { "robots.txt": robots, "sitemap.xml": sitemap };
  let outDir = "dist";

  return {
    name: "tbf-seo",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    transformIndexHtml(html) {
      return verification.length ? html.replace("</head>", `    ${verification.join("\n    ")}\n  </head>`) : html;
    },
    // En dev : servis à la volée.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const name = req.url?.slice(1);
        if (!files[name]) return next();
        res.setHeader("Content-Type", name.endsWith(".xml") ? "application/xml; charset=utf-8" : "text/plain; charset=utf-8");
        res.end(files[name]);
      });
    },
    generateBundle() {
      for (const [fileName, source] of Object.entries(files)) this.emitFile({ type: "asset", fileName, source });
    },
    // Après l'écriture de dist/index.html : une copie par route publique, avec ses balises.
    async writeBundle() {
      const root = join(process.cwd(), outDir);
      const template = await readFile(join(root, "index.html"), "utf8");
      for (const route of PUBLIC_ROUTES) {
        const file = route.path === "/" ? join(root, "index.html") : join(root, route.path.slice(1), "index.html");
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, renderRouteHtml(template, route, site));
      }
    },
  };
}
