#!/usr/bin/env tsx
/**
 * Curated appetizer recipes — crowd-pleasing starters.
 * Safe to re-run; skips existing titles.
 *
 * Usage:  npm run seed:recipes3
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
};

const RECIPES: Recipe[] = [
  {
    name: "Classic Baked Brie",
    description: "A warm, gooey baked brie that looks fancy but comes together in minutes. Perfect for any party or gathering.",
    chef: "Green AI",
    prep_time_mins: 5,
    cook_time_mins: 18,
    servings: 8,
    cuisine: "American",
    difficulty: "easy",
    source_url: "https://greenai.com/recipes/classic-baked-brie",
    ingredients: [
      "1 wheel of brie cheese (8 oz)",
      "2 tablespoons honey",
      "1/4 cup chopped walnuts or pecans",
      "1/4 cup dried cranberries (optional)",
      "Fresh rosemary sprigs, for garnish (optional)",
      "Crackers, baguette slices, or apple slices, for serving",
    ],
    steps: [
      "Preheat oven to 375°F (190°C).",
      "Place the brie wheel in a small oven-safe dish or on a parchment-lined baking sheet.",
      "Score the top of the brie in a crosshatch pattern with a sharp knife.",
      "Drizzle honey over the top, then scatter chopped nuts and cranberries on top.",
      "Bake for 15–20 minutes, until the brie is soft and gooey and the top is lightly golden.",
      "Remove from oven and garnish with fresh rosemary if using.",
      "Serve immediately with crackers, baguette slices, or apple slices.",
    ],
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

      existingTitles.add(recipe.name);
      inserted++;
    }
  });

  seedAll();
  sqlite.close();

  console.log(`✅ Recipe seed complete — ${inserted} inserted, ${skipped} already existed`);
}

main().catch((err) => { console.error(err); process.exit(1); });
