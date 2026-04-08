#!/usr/bin/env tsx
/**
 * Tokyo Pizza seed — adds one recipe.
 * Safe to re-run; skips if title already exists.
 *
 * Usage:  npx tsx lib/seed/tokyo-pizza.ts
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
  cuisine: string;
  difficulty: string;
  tags: string[];
  source_url: string;
  ingredients: string[];
  steps: string[];
  image_urls: string[];
};

const RECIPE: Recipe = {
  name: "Tokyo Teriyaki Chicken Pizza",
  chef: "Green AI",
  cuisine: "Japanese-Italian",
  difficulty: "medium",
  prep_time_mins: 90,
  cook_time_mins: 12,
  servings: 2,
  tags: ["Green AI", "Japanese", "pizza", "teriyaki", "fusion"],
  source_url: "https://www.stadlermade.com/how-to-pizza-dough/how-to-make-a-tokyo-style-pizza/",
  description: `Tokyo's pizza scene is quietly one of the world's best. Since the 1980s, Japanese pizzaiolos — trained in Naples but working with local obsession and craft — have elevated Neapolitan technique into something distinctly their own. The key differentiators: slow cold-fermented doughs pushed beyond 70% hydration, wood fires stoked with low-oil sakura and nara oak for clean heat, and a "salt punch" delivered directly onto the stone before the dough lands on it. The result is a crust with dramatic leopard-spotted char, a featherlight open crumb, and edges that shatter before they chew.

This recipe pairs that Tokyo-Neapolitan base with Japan's most beloved pizza topping — teriyaki chicken — finished with sweet corn, baby spinach, and the essential Kewpie mayonnaise lattice. It is the dish that Domino's Japan popularised in 1987 and that generations of Japanese home cooks have refined ever since.`,
  ingredients: [
    // Dough
    "300g (2½ cups) 00 flour, plus more for dusting",
    "210ml (¾ cup + 2 tbsp) cold water",
    "6g (1 tsp) fine sea salt",
    "1g (¼ tsp) instant dry yeast",
    // Teriyaki chicken
    "2 boneless, skin-on chicken thighs (about 300g total)",
    "3 tbsp soy sauce",
    "2 tbsp mirin",
    "2 tbsp sake",
    "1 tbsp light brown sugar",
    "1 tsp honey",
    "1 tsp neutral oil",
    // Toppings
    "120g (1 cup) low-moisture mozzarella, grated",
    "4 tbsp canned or fresh sweet corn kernels, drained",
    "Small handful baby spinach (about 30g)",
    "3 tbsp Kewpie mayonnaise (in a squeeze bottle)",
    "1 spring onion, thinly sliced on the diagonal",
    "1 tsp toasted sesame seeds",
    "Pinch of shichimi tōgarashi (Japanese seven-spice), optional",
    // Sauce
    "4 tbsp passata or crushed San Marzano tomatoes",
    "½ tsp fine sea salt",
    "½ tsp dried oregano",
  ],
  steps: [
    "Make the dough (day before): combine flour, salt, and yeast in a large bowl. Add cold water and mix with a fork until a shaggy dough forms — no dry patches. Turn out and knead for 8–10 minutes until smooth and elastic. The dough will feel wetter than a standard pizza dough; resist adding flour. Cover tightly and refrigerate for 24–72 hours (longer = more flavour and open crumb).",
    "Prepare the teriyaki sauce: whisk soy sauce, mirin, sake, brown sugar, and honey together in a small bowl until sugar dissolves. Set aside.",
    "Cook the teriyaki chicken: heat oil in a small frying pan over medium-high heat. Pat chicken thighs dry and add skin-side down. Cook for 5–6 minutes until skin is crispy and golden. Flip and cook 3 minutes more. Pour off excess fat, then add the teriyaki sauce to the pan. Simmer over medium heat, turning the chicken to coat, for 2–3 minutes until the sauce thickens to a glaze and the chicken is cooked through. Rest for 5 minutes, then slice into bite-sized pieces.",
    "Bring the dough to room temperature: remove from the refrigerator 2 hours before baking. Divide into two equal balls (if making two 28 cm pizzas), flour lightly, cover with a damp cloth, and leave to rest at room temperature.",
    "Heat your oven to maximum (typically 260–300°C / 500–575°F) with a baking steel or heavy cast-iron pan on the top rack for at least 45 minutes. The stone must be as hot as possible — this is non-negotiable.",
    "Make the sauce: stir passata with salt and oregano. Keep simple — the teriyaki is the star.",
    "Stretch the dough: on a lightly floured surface, press one dough ball flat with your fingertips — do not use a rolling pin. Work from the centre outward, leaving a thicker border. Lift and drape over your knuckles, rotating gently to stretch to about 28 cm. The dough should be nearly translucent in places. Lay on a floured pizza peel or the back of a baking sheet.",
    "The 'salt punch': immediately before launching the pizza, lightly scatter a pinch of fine sea salt directly onto the hot baking steel. Lower the pizza onto the stone — the salt crisps the underside and amplifies umami across the whole pie.",
    "Assemble: spread sauce thinly across the base, leaving a 1.5 cm border. Scatter half the mozzarella. Distribute teriyaki chicken pieces evenly, then add corn and spinach. Top with the remaining mozzarella.",
    "Bake for 6–8 minutes until the crust has bold leopard-spot charring and the cheese is melted and bubbling with golden patches. Rotate once halfway through if your oven has hot spots.",
    "Finish tableside: as soon as the pizza comes out of the oven, pipe Kewpie mayo in a thin lattice across the surface. Scatter spring onion, sesame seeds, and a pinch of shichimi tōgarashi if using. Slice and serve immediately.",
  ],
  image_urls: [
    // Primary: Wikimedia Commons — Japanese teriyaki chicken pizza
    "https://upload.wikimedia.org/wikipedia/commons/a/ae/Japanese_teriyaki_chicken_pizza.jpg",
    // Secondary: mayo-corn pizza at a Japanese café (Gusto chain)
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Mayo-corn_Pizza%2C_at_Caf%C3%A9_Restaurant_Gusto_%282015-04-28%29.JPG/960px-Mayo-corn_Pizza%2C_at_Caf%C3%A9_Restaurant_Gusto_%282015-04-28%29.JPG",
    // Tertiary: Japanese bakery-style pizza (pannya pizza, Tokyo)
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/%E3%83%91%E3%83%B3%E5%B1%8B%E3%81%AE%E3%83%94%E3%82%B6_10%E3%82%A4%E3%83%B3%E3%83%81%E3%83%94%E3%82%B6_2014_%2814524640355%29.jpg/960px-%E3%83%91%E3%83%B3%E5%B1%8B%E3%81%AE%E3%83%94%E3%82%B6_10%E3%82%A4%E3%83%B3%E3%83%81%E3%83%94%E3%82%B6_2014_%2814524640355%29.jpg",
  ],
};

async function main() {
  const sqlite = new Database(DB_PATH);

  const existing = sqlite
    .prepare("SELECT title FROM recipes WHERE title = ?")
    .get(RECIPE.name);

  if (existing) {
    console.log(`⚠️  "${RECIPE.name}" already exists — skipping.`);
    sqlite.close();
    return;
  }

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
    VALUES (?, ?, 'image', ?, ?, ?, ?)
  `);

  const ts = Math.floor(Date.now() / 1000);

  const seed = sqlite.transaction(() => {
    const id = ulid();

    insertRecipe.run(
      id,
      RECIPE.name,
      `[${RECIPE.chef}] ${RECIPE.description}`,
      RECIPE.cuisine,
      RECIPE.difficulty,
      RECIPE.prep_time_mins,
      RECIPE.cook_time_mins,
      RECIPE.servings,
      JSON.stringify(RECIPE.tags),
      RECIPE.source_url,
      ts,
      ts,
    );

    RECIPE.ingredients.forEach((ing, i) => {
      insertIngredient.run(ulid(), id, ing, i + 1);
    });

    RECIPE.steps.forEach((step, i) => {
      insertStep.run(ulid(), id, i + 1, step);
    });

    RECIPE.image_urls.forEach((url, i) => {
      const captions = [
        "Tokyo teriyaki chicken pizza with Kewpie mayo lattice",
        "Japanese mayo-corn pizza — a beloved Tokyo café staple",
        "Japanese-style pizza fresh from a Tokyo bakery",
      ];
      insertMedia.run(ulid(), id, url, captions[i] ?? "Tokyo pizza", i === 0 ? 1 : 0, i);
    });

    return id;
  });

  const recipeId = seed();
  sqlite.close();

  console.log(`✅ Inserted "${RECIPE.name}" (id: ${recipeId}) with ${RECIPE.image_urls.length} images.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
