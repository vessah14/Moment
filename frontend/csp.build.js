import { createHash } from "node:crypto";

// Politique de sécurité du contenu (CSP), ajoutée au build dans chaque page HTML.
// Seuls s'exécutent les scripts du site, le petit script en ligne du thème (autorisé par
// son empreinte SHA-256) et ceux des services utilisés (Google Sign-In, Google
// Traduction) : un script injecté par une faille XSS serait bloqué et ne pourrait pas
// voler la session. Sert sur tout hébergeur (balise <meta>) ; le .htaccess ajoute
// frame-ancestors, qu'une balise <meta> ne peut pas porter.
export default function cspPlugin(env) {
  const apiOrigin = (() => {
    try {
      return new URL(env.VITE_API_URL || "http://localhost:5146/api").origin;
    } catch {
      return "";
    }
  })();

  const google = ["https://accounts.google.com"];
  const translate = [
    "https://translate.google.com",
    "https://translate.googleapis.com",
    "https://translate-pa.googleapis.com",
    "https://www.gstatic.com",
  ];

  return {
    name: "tbf-csp",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        // Empreinte de chaque script en ligne exécutable (pas les données JSON-LD).
        const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi)]
          // Le navigateur normalise les fins de ligne (CRLF → LF) avant de calculer l'empreinte.
          .map(([, body]) => `'sha256-${createHash("sha256").update(body.replace(/\r\n?/g, "\n"), "utf8").digest("base64")}'`);

        const policy = [
          "default-src 'self'",
          `script-src 'self' ${hashes.join(" ")} ${[...google, ...translate].join(" ")}`,
          // Styles en ligne : React (style={…}) et thèmes des sites d'événements.
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${google.join(" ")} ${translate.join(" ")}`,
          "font-src 'self' data: https://fonts.gstatic.com",
          // Couvertures (API, Cloudinary), photos Google, cartes : images https uniquement.
          "img-src 'self' data: blob: https:",
          // fonts.* : la capture des billets (PDF, image) intègre les polices des modèles.
          `connect-src 'self' ${apiOrigin} https://fonts.googleapis.com https://fonts.gstatic.com ${google.join(" ")} ${translate.join(" ")}`,
          `frame-src 'self' https://www.google.com https://maps.google.com ${google.join(" ")} https://translate.google.com`,
          "object-src 'none'",
          "base-uri 'self'",
        ].join("; ");

        return html.replace(
          /<meta charset="UTF-8"\s*\/?>/i,
          (charset) => `${charset}\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`,
        );
      },
    },
  };
}
