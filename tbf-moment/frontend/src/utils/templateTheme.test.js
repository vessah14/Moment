import { describe, expect, it } from "vitest";
import { templatesForCategory } from "./templateTheme";

describe("templatesForCategory", () => {
  it.each([
    ["mariage", "Mariage et fiançailles", "Éclat"],
    ["conference", "Conférence / séminaire / atelier", "Signal"],
    ["obseques", "Obsèques / commémoration / hommage", "Mémoire"],
    ["concert", "Concert / spectacle", "Amplify"],
    ["evenement_entreprise", "Événement professionnel", "Sobre"],
  ])("returns the model related to %s", (code, label, name) => {
    expect(
      templatesForCategory(code, label).map((template) => template.name),
    ).toEqual([name]);
  });

  it("returns no unrelated models when the category has no dedicated template", () => {
    expect(templatesForCategory("bapteme", "Baptême")).toEqual([]);
  });
});
