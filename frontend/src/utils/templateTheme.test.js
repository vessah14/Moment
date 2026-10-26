import { describe, expect, it } from "vitest";
import { BLOCK_CONTENT_DEFAULTS } from "../data/blockDefaults";
import { TEMPLATE_DEMOS } from "../data/templateDemos";
import { TEMPLATES } from "../data/templates";
import {
  findTemplate,
  ensureRsvpBlock,
  missingEventPageBlocks,
  newEventPageBlocks,
  reconcileTemplateLayout,
  resolveSiteStyle,
  templateBlockHeading,
  templateBlocks,
  templateFromCustomFields,
  templatesForCategory,
} from "./templateTheme";

describe("templatesForCategory", () => {
  it.each([
    ["mariage", "Mariage et fiançailles", ["Noor", "Bloom", "Toghu Royal", "Ndop", "Éclat", "Ivoire", "Jardin"]],
    ["anniversaire", "Anniversaire", ["Fiesta", "Prestige", "Confetti", "Néon", "Tendresse"]],
    ["conference", "Conférence / séminaire / atelier", ["Summit", "Signal", "Forum"]],
    ["obseques", "Obsèques / commémoration / hommage", ["Mémoire", "Lumière"]],
    ["concert", "Concert / spectacle", ["Live", "Amplify", "Scène"]],
    ["evenement_entreprise", "Événement professionnel", ["Horizon", "Sobre"]],
    ["bapteme", "Baptême", ["Nuage", "Berceau", "Plume"]],
  ])("returns only the models of %s", (code, label, names) => {
    expect(
      templatesForCategory(code, label).map((template) => template.name),
    ).toEqual(names);
  });

  // Codes inconnus côté front : le libellé suffit à retrouver les bons modèles.
  it.each([
    ["Soirée privée", ["Velvet", "Velours", "Lounge"]],
    ["Événement scolaire ou universitaire", ["Campus", "Kermesse"]],
    ["Événement religieux", ["Grâce", "Sérénité", "Ferveur"]],
    ["Compétition sportive", ["Arena", "Arène", "Sprint"]],
    ["Événement familial", ["Racines", "Pique-nique"]],
    ["Événement personnalisé", ["Atelier", "Canvas", "Aube"]],
    ["Autre", ["Libre"]],
  ])("matches %s by its label", (label, names) => {
    expect(
      templatesForCategory("code_inconnu", label).map((template) => template.name),
    ).toEqual(names);
  });

  it("never mixes categories", () => {
    for (const template of TEMPLATES) {
      const matches = templatesForCategory(template.categoryCode, template.category);
      expect(matches.every((m) => m.category === template.category)).toBe(true);
    }
  });

  it("returns nothing for an unknown category", () => {
    expect(templatesForCategory("inconnu", "Catégorie inconnue")).toEqual([]);
  });
});

describe("resolveSiteStyle", () => {
  const eclat = findTemplate("Éclat");

  it("applies the template colours and font by default", () => {
    expect(resolveSiteStyle({ template: eclat, heroContent: { color: "#6549e8" } })).toMatchObject({
      accent: eclat.preview.accent,
      fontKey: "Playfair Display + Inter",
    });
  });

  it("lets an explicit Builder choice override the template", () => {
    expect(
      resolveSiteStyle({
        template: eclat,
        heroContent: { color: "#ff7a3d", font: "Inter + Inter", customStyle: true },
      }),
    ).toMatchObject({ accent: "#ff7a3d", fontKey: "Inter + Inter" });
  });

  it("ignores unsafe colours", () => {
    expect(
      resolveSiteStyle({ heroContent: { color: "red;}", customStyle: true }, themeColor: "#123456" }).accent,
    ).toBe("#123456");
  });
});

describe("templateFromCustomFields", () => {
  it("reads the template saved by the wizard", () => {
    expect(templateFromCustomFields('{"template":"Signal"}')?.name).toBe("Signal");
  });

  it("tolerates malformed data", () => {
    expect(templateFromCustomFields("{oops")).toBeNull();
  });
});

describe("templateBlockDefaults", () => {
  it("uses the template's section titles and module labels", async () => {
    const { templateBlockDefaults } = await import("./templateTheme");
    const nuage = templateBlockDefaults(findTemplate("Nuage"));
    expect(nuage.Familles).toMatchObject({ heading: "Parrain et marraine", a: { label: "La marraine" } });
    // Premium : titre sobre de la démo ; classique : titre par défaut du Builder.
    expect(nuage.Programme.heading).toBe("Programme");
    expect(templateBlockDefaults(findTemplate("Éclat")).Programme.heading).toBe(BLOCK_CONTENT_DEFAULTS.Programme.heading);
    expect(templateBlockDefaults(findTemplate("Live")).Intervenants.heading).toBe("Line-up");
  });
});

describe("TEMPLATES", () => {
  it("only uses block types the Builder knows", () => {
    const known = new Set(Object.keys(BLOCK_CONTENT_DEFAULTS));
    for (const template of TEMPLATES) {
      for (const block of templateBlocks(template)) expect(known).toContain(block);
    }
  });

  it("keeps premium model sections faithful to their source previews", () => {
    expect(templateBlocks(findTemplate("Noor"))).toEqual([
      "Invitation", "Histoire", "Programme", "Localisation", "Dress code", "Plan de table", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page",
    ]);
    expect(templateBlocks(findTemplate("Bloom"))).toEqual([
      "Invitation", "Histoire", "Programme", "Localisation", "Dress code", "Plan de table", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page",
    ]);
    expect(templateBlocks(findTemplate("Fiesta"))).toEqual([
      "Invitation", "Rebours", "Programme", "Localisation", "Dress code", "Galerie", "Cadeaux", "Livre d'or", "RSVP", "Pied de page",
    ]);
  });

  it("shows both venue stops in the Noor and Bloom previews", () => {
    for (const theme of ["noor", "bloom"]) {
      expect(TEMPLATE_DEMOS[theme].locationAddress).toBeTruthy();
      expect(TEMPLATE_DEMOS[theme].additionalVenues).toHaveLength(1);
      expect(TEMPLATE_DEMOS[theme].additionalVenues[0].address).toBeTruthy();
    }
  });

  it("includes all model sections plus a program, RSVP and contribution area on new sites", () => {
    for (const template of TEMPLATES) {
      const blocks = newEventPageBlocks(template);
      expect(blocks).toEqual(expect.arrayContaining(templateBlocks(template)));
      expect(blocks).toEqual(expect.arrayContaining(["Programme", "Cadeaux", "RSVP"]));
      expect(new Set(blocks).size, template.name).toBe(blocks.length);
      if (blocks.includes("Pied de page")) expect(blocks.at(-1), template.name).toBe("Pied de page");
    }
  });

  it("updates Builder sections and default headings when changing models", () => {
    const previousTemplate = findTemplate("Éclat");
    const nextTemplate = findTemplate("Live");
    const layout = reconcileTemplateLayout(nextTemplate, {
      previousTemplate,
      content: {
        Invitation: {
          heading: templateBlockHeading(previousTemplate, "Invitation"),
          body: "Texte personnalisé conservé.",
        },
        Programme: {
          heading: templateBlockHeading(previousTemplate, "Programme"),
        },
        Histoire: { heading: "Notre histoire", body: "À retirer avec ce modèle." },
      },
    });

    expect(layout.blocks).toEqual(newEventPageBlocks(nextTemplate));
    expect(layout.blocks).toContain("Intervenants");
    expect(layout.blocks).not.toContain("Histoire");
    expect(layout.content.Invitation).toMatchObject({
      heading: templateBlockHeading(nextTemplate, "Invitation"),
      body: "Texte personnalisé conservé.",
    });
    expect(layout.content.Programme.heading).toBe(
      templateBlockHeading(nextTemplate, "Programme"),
    );
    expect(layout.content.Intervenants.heading).toBe("Line-up");
  });

  it("keeps a section heading explicitly customized in the Builder", () => {
    const template = findTemplate("Live");
    const layout = reconcileTemplateLayout(template, {
      previousTemplate: findTemplate("Éclat"),
      content: {
        Programme: { heading: "Nos temps forts" },
      },
    });

    expect(layout.content.Programme.heading).toBe("Nos temps forts");
  });

  it("fills missing model sections even when a site already has blocks", () => {
    expect(missingEventPageBlocks(findTemplate("Noor"), ["Hero", "Histoire", "Rsvp"])).toEqual([
      "Invitation", "Programme", "Localisation", "Dress code", "Plan de table", "Galerie",
      "Cadeaux", "Livre d'or", "Pied de page",
    ]);
  });

  it("adds the RSVP section to older public sites before the footer", () => {
    expect(ensureRsvpBlock(["Invitation", "Pied de page"])).toEqual([
      "Invitation", "RSVP", "Pied de page",
    ]);
    expect(ensureRsvpBlock(["Invitation", "RSVP", "Pied de page"])).toEqual([
      "Invitation", "RSVP", "Pied de page",
    ]);
  });
});

describe("site upload paths", async () => {
  const { safeBlockImagePath, safeCoverPath } = await import("./sitePage");
  const id = "b856965d-ea29-4b76-adda-531078547945";
  // Le cloud configuré (VITE_CLOUDINARY_CLOUD_NAME) ; « demo » s'il n'y en a pas.
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";

  it("accepts our own upload paths only", () => {
    // Un autre compte Cloudinary est refusé dès qu'un cloud est configuré.
    if (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
      expect(safeCoverPath(`https://res.cloudinary.com/autre-cloud/image/upload/v1/tbf-moment/covers/${id}/${id}.jpg`)).toBeNull();
    expect(safeBlockImagePath(`/uploads/blocks/${id}/${id}.png`)).toBeTruthy();
    expect(safeBlockImagePath(`/uploads/covers/${id}/${id}.png`)).toBeNull();
    expect(safeCoverPath(`/uploads/covers/${id}/${id}.jpg`)).toBeTruthy();
    expect(safeCoverPath(`https://res.cloudinary.com/${cloud}/image/upload/v123/tbf-moment/covers/${id}/${id}.jpg`)).toBeTruthy();
    expect(safeBlockImagePath(`https://res.cloudinary.com/${cloud}/image/upload/v123/tbf-moment/blocks/${id}/${id}.webp`)).toBeTruthy();
    expect(safeCoverPath("https://evil.example/x.png")).toBeNull();
    expect(safeCoverPath(`http://res.cloudinary.com/${cloud}/image/upload/v123/tbf-moment/covers/${id}/${id}.jpg`)).toBeNull();
    expect(safeCoverPath(`/uploads/covers/${id}/${id}.png) , url(x`)).toBeNull();
  });
});

describe("mediaUrl", async () => {
  const { mediaUrl, API_ORIGIN } = await import("../api/client");
  const id = "b856965d-ea29-4b76-adda-531078547945";

  it("serves local uploads from the backend and Cloudinary images from the CDN", () => {
    expect(mediaUrl(`/uploads/gallery/${id}/${id}.png`)).toBe(`${API_ORIGIN}/uploads/gallery/${id}/${id}.png`);
    expect(mediaUrl(`https://res.cloudinary.com/demo/image/upload/v1/tbf-moment/gallery/${id}/${id}.png`)).toBe(
      `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/tbf-moment/gallery/${id}/${id}.png`,
    );
  });

  it("ignores anything else", () => {
    expect(mediaUrl("javascript:alert(1)")).toBe("");
    expect(mediaUrl("https://evil.example/x.png")).toBe("");
    expect(mediaUrl(null)).toBe("");
  });
});
