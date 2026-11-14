
import { createHash } from "node:crypto";

// Politique de sécurité du contenu (CSP) injectée dans chaque page HTML au build.
export default function cspPlugin(env) {
  const apiOrigin = (() => {
    try {
      return new URL(
        env.VITE_API_URL || "http://localhost:5146/api"
      ).origin;
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

  const r2 = "https://pub-257afd578b1248d788d7302dfdb7c4ef.r2.dev";
  const cloudinary = "https://res.cloudinary.com";

  return {
    name: "tbf-csp",
    apply: "build",

    transformIndexHtml: {
      order: "post",

      handler(html) {
        // Calcul des empreintes SHA-256 des scripts inline exécutables.
        const hashes = [
          ...html.matchAll(
            /<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi
          ),
        ].map(([, body]) => {
          const normalizedBody = body.replace(/\r\n?/g, "\n");

          return `'sha256-${createHash("sha256")
            .update(normalizedBody, "utf8")
            .digest("base64")}'`;
        });

        const policy = [
          // Sources par défaut
          "default-src 'self'",

          // Scripts
          `script-src 'self' ${hashes.join(" ")} ${[
            ...google,
            ...translate,
          ].join(" ")}`,

          // Styles
          `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ${[
            ...google,
            ...translate,
          ].join(" ")}`,

          // Polices
          "font-src 'self' data: https://fonts.gstatic.com",

          // Images
          `img-src 'self' data: blob: https: ${apiOrigin}`,

          // Audio et vidéos
          `media-src 'self' blob: ${r2} ${cloudinary}`,

          // Connexions API et services externes
          `connect-src 'self' ${apiOrigin} https://fonts.googleapis.com https://fonts.gstatic.com ${[
            ...google,
            ...translate,
          ].join(" ")}`,

          // Iframes
          `frame-src 'self' https://www.youtube-nocookie.com https://www.google.com https://maps.google.com ${[
            ...google,
            ...translate,
          ].join(" ")}`,

          // Sécurité complémentaire
          "object-src 'none'",
          "base-uri 'self'",
        ].join("; ");

        // Injection de la CSP dans le document HTML.
        return html.replace(
          /<meta charset="UTF-8"\s*\/?>/i,
          (charset) =>
            `${charset}\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`
        );
      },
    },
  };
}
