import { describe, it, expect } from "vitest";
import { buildSeedData, addToPlanInData, moveMealInData } from "./App.jsx";

describe("buildSeedData", () => {
  it("produces a catalogue with recipes, tags and ingredients", () => {
    const data = buildSeedData();
    expect(data.recipes.length).toBeGreaterThan(0);
    expect(data.tags.length).toBeGreaterThan(0);
    expect(data.ingredients.length).toBeGreaterThan(0);
    expect(data.weeklyPlan).toEqual([]);
  });

  it("resolves every recipe tag to a real tag id (catches a tag missing from TAG_NAMES)", () => {
    // Régression : "épicé" était référencé par plusieurs recettes sans figurer dans TAG_NAMES,
    // ce qui faisait disparaître le tag silencieusement (filter(Boolean) dans buildSeedData).
    const data = buildSeedData();
    const knownTagIds = new Set(data.tags.map((t) => t.id));
    for (const recipe of data.recipes) {
      for (const tagId of recipe.tag_ids) {
        expect(knownTagIds.has(tagId), `tag_id ${tagId} on "${recipe.titre}" is not a known tag`).toBe(true);
      }
    }
  });

  it("gives every recipe an empty custom_category_ids list", () => {
    const data = buildSeedData();
    for (const recipe of data.recipes) {
      expect(Array.isArray(recipe.custom_category_ids)).toBe(true);
      expect(recipe.custom_category_ids).toEqual([]);
    }
  });
});

describe("addToPlanInData", () => {
  it("plans a recipe into an empty slot", () => {
    const data = buildSeedData();
    const recipe = data.recipes[0];
    addToPlanInData(data, "2026-09-23", "midi", recipe.id);
    expect(data.weeklyPlan).toHaveLength(1);
    expect(data.weeklyPlan[0]).toMatchObject({ date: "2026-09-23", moment: "midi", recipe_id: recipe.id });
  });

  it("replaces, rather than duplicates, an existing entry for the same slot", () => {
    const data = buildSeedData();
    const [r1, r2] = data.recipes;
    addToPlanInData(data, "2026-09-23", "midi", r1.id);
    addToPlanInData(data, "2026-09-23", "midi", r2.id);
    expect(data.weeklyPlan).toHaveLength(1);
    expect(data.weeklyPlan[0].recipe_id).toBe(r2.id);
  });

  it("un-likes the recipe once it is planned, so it returns to the discovery deck", () => {
    const data = buildSeedData();
    const recipe = data.recipes[0];
    recipe.liked = true;
    addToPlanInData(data, "2026-09-23", "soir", recipe.id);
    expect(data.recipes.find((r) => r.id === recipe.id).liked).toBe(false);
  });
});

describe("moveMealInData", () => {
  it("moves a meal into an empty slot", () => {
    const data = buildSeedData();
    const recipe = data.recipes[0];
    addToPlanInData(data, "2026-09-23", "midi", recipe.id);
    const planId = data.weeklyPlan[0].id;
    moveMealInData(data, planId, "2026-09-24", "soir");
    expect(data.weeklyPlan).toHaveLength(1);
    expect(data.weeklyPlan[0]).toMatchObject({ date: "2026-09-24", moment: "soir" });
  });

  it("swaps two meals when the target slot is already occupied", () => {
    // Régression : un bug de refs DOM périmées faisait cibler le mauvais jour lors d'un
    // glisser-déposer vers un créneau déjà occupé (vue Jour du Planning).
    const data = buildSeedData();
    const [r1, r2] = data.recipes;
    addToPlanInData(data, "2026-09-23", "midi", r1.id);
    addToPlanInData(data, "2026-09-23", "soir", r2.id);
    const [midiPlan, soirPlan] = data.weeklyPlan;
    moveMealInData(data, midiPlan.id, "2026-09-23", "soir");
    const byId = Object.fromEntries(data.weeklyPlan.map((p) => [p.id, p]));
    expect(byId[midiPlan.id]).toMatchObject({ date: "2026-09-23", moment: "soir" });
    expect(byId[soirPlan.id]).toMatchObject({ date: "2026-09-23", moment: "midi" });
    expect(data.weeklyPlan).toHaveLength(2);
  });

  it("does nothing when dropped back onto its own slot", () => {
    const data = buildSeedData();
    const recipe = data.recipes[0];
    addToPlanInData(data, "2026-09-23", "midi", recipe.id);
    const before = JSON.stringify(data.weeklyPlan);
    moveMealInData(data, data.weeklyPlan[0].id, "2026-09-23", "midi");
    expect(JSON.stringify(data.weeklyPlan)).toBe(before);
  });

  it("does nothing when the plan id no longer exists", () => {
    const data = buildSeedData();
    const before = JSON.stringify(data.weeklyPlan);
    moveMealInData(data, "plan-does-not-exist", "2026-09-23", "midi");
    expect(JSON.stringify(data.weeklyPlan)).toBe(before);
  });
});
