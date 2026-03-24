#!/usr/bin/env tsx
/**
 * Curated deconstructed dessert recipes — classic sweets reimagined as individual servings.
 * Safe to re-run; skips existing titles.
 *
 * Usage:  npm run seed:recipes5
 */
import Database from 'better-sqlite3';
import path from 'path';
import { ulid } from 'ulid';

const DB_PATH = path.join(process.cwd(), 'chew.db');

type Recipe = {
  name: string;
  description: string;
  chef: string;
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  cuisine?: string;
  difficulty?: string;
  ingredients: string[];
  steps: string[];
  source_url?: string;
  image_url?: string;
};

const RECIPES: Recipe[] = [
  {
    name: "Deconstructed Banoffee Pie",
    description: "All the soul of a classic British banoffee pie — buttery digestive crumble, silky homemade toffee sauce, fresh banana slices, and billowy whipped cream — layered in individual glasses for a stunning no-bake dessert ready in under 20 minutes.",
    chef: "Green AI",
    prep_time_mins: 20,
    cook_time_mins: 5,
    servings: 4,
    cuisine: "British",
    difficulty: "easy",
    ingredients: [
      "200g digestive biscuits (about 14 biscuits)",
      "60g unsalted butter, melted",
      "1 pinch fine sea salt",
      "397g can dulce de leche (or thick caramel sauce)",
      "1 tsp flaky sea salt (e.g. Maldon), plus extra to finish",
      "3 ripe but firm bananas",
      "1 tbsp fresh lemon juice",
      "300ml heavy whipping cream (cold)",
      "2 tbsp powdered sugar",
      "1 tsp vanilla extract",
      "Dark chocolate (40g), finely grated or shaved, for garnish",
    ],
    steps: [
      "Crush the digestive biscuits into a coarse rubble — a mix of fine crumbs and pea-sized chunks gives the best texture. Combine with melted butter and a pinch of fine sea salt, then spread on a plate and refrigerate for 10 minutes to firm up.",
      "Gently warm the dulce de leche in a small saucepan over low heat, stirring until pourable. Stir in the flaky sea salt. Remove from heat and allow to cool for 5 minutes — it should be fluid but not hot.",
      "Slice the bananas on the diagonal into 1 cm coins and toss immediately with lemon juice to prevent browning.",
      "In a chilled bowl, whip the heavy cream with powdered sugar and vanilla extract to soft, pillowy peaks. Do not overwhip — you want it to hold shape but stay airy.",
      "To assemble: spoon a generous layer of biscuit crumble into the base of each glass. Press lightly so it holds together.",
      "Spoon over 2–3 tablespoons of warm toffee sauce, letting it seep into the crumble at the edges.",
      "Arrange 5–6 banana slices in a single layer over the toffee.",
      "Add a large dollop of whipped cream, then repeat with a second, lighter layer of crumble scattered on top for texture.",
      "Finish with a drizzle of extra toffee sauce, a pinch of flaky sea salt, and a generous shower of grated dark chocolate.",
      "Serve immediately for crunchy crumble, or chill for up to 1 hour for a softer, more set dessert.",
    ],
    image_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Banoffeepie.jpg/1024px-Banoffeepie.jpg",
  },
];

async function main() {
  const sqlite = new Database(DB_PATH);

  const existingRows = sqlite.prepare('SELECT title FROM recipes').all() as { title: string }[];
  const existingTitles = new Set(existingRows.map((r) => r.title));

  const insertRecipe = sqlite.prepare(`
    INSERT INTO recipes (id, title, description, cuisine, difficulty, prep_time_min, cook_time_min, servings, tags, source_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertIngredient = sqlite.prepare(`
    INSERT INTO recipe_ingredients (id, recipe_id, wiki_id, name_override, amount, unit, notes, optional, step_order)
    VALUES (?, ?, NULL, ?, NULL, NULL, NULL, 0, ?)
  `);
  const insertStep = sqlite.prepare(`
    INSERT INTO recipe_steps (id, recipe_id, step_number, instruction, duration_min, tip, image_path)
    VALUES (?, ?, ?, ?, NULL, NULL, NULL)
  `);
  const insertMedia = sqlite.prepare(`
    INSERT OR IGNORE INTO recipe_media (id, recipe_id, type, url_or_path, caption, is_primary, sort_order)
    VALUES (?, ?, 'image', ?, 'Primary recipe photo', 1, 0)
  `);

  let inserted = 0;
  let skipped = 0;
  const ts = Math.floor(Date.now() / 1000);

  const seedAll = sqlite.transaction(() => {
    for (const recipe of RECIPES) {
      if (existingTitles.has(recipe.name)) { skipped++; continue; }

      const id = ulid();
      insertRecipe.run(
        id,
        recipe.name,
        `[${recipe.chef}] ${recipe.description}`,
        recipe.cuisine ?? null,
        recipe.difficulty ?? 'medium',
        recipe.prep_time_mins,
        recipe.cook_time_mins,
        recipe.servings,
        JSON.stringify([recipe.chef]),
        recipe.source_url ?? null,
        ts,
        ts,
      );

      recipe.ingredients.forEach((ing: string, i: number) => {
        insertIngredient.run(ulid(), id, ing, i + 1);
      });

      recipe.steps.forEach((step: string, i: number) => {
        const instruction = step.replace(/^\d+\.\s*/, '');
        insertStep.run(ulid(), id, i + 1, instruction);
      });

      if (recipe.image_url) {
        insertMedia.run(ulid(), id, recipe.image_url);
      }

      existingTitles.add(recipe.name);
      inserted++;
    }
  });

  seedAll();
  sqlite.close();

  console.log(`✅ Recipe seed complete — ${inserted} inserted, ${skipped} already existed`);
}

main().catch((err) => { console.error(err); process.exit(1); });
