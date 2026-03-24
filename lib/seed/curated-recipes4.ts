#!/usr/bin/env tsx
/**
 * Curated deconstructed recipes — classic dishes reimagined as bowls, salads, and skillets.
 * Safe to re-run; skips existing titles.
 *
 * Usage:  npm run seed:recipes4
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
    name: "Deconstructed Lasagna Skillet",
    description: "All the cheesy, meaty goodness of lasagna made in one skillet in 20 minutes — no layering or pre-boiling required. Broken lasagna sheets are scattered throughout.",
    chef: "Green AI",
    prep_time_mins: 5,
    cook_time_mins: 20,
    servings: 4,
    cuisine: "Italian",
    difficulty: "easy",
    ingredients: [
      "12 oz ground beef",
      "8 oz lasagna sheets (broken into rough pieces)",
      "1 cup ricotta cheese",
      "1.5 cups shredded mozzarella",
      "2 cups marinara sauce",
      "2 cloves garlic (minced)",
      "1 tsp Italian seasoning",
      "Salt and pepper to taste",
      "Fresh basil to garnish",
    ],
    steps: [
      "Brown ground beef in a large skillet over medium-high heat. Drain fat.",
      "Add garlic and Italian seasoning, cook 1 minute.",
      "Add marinara sauce and 2 cups water, bring to a boil.",
      "Break lasagna sheets into rough pieces and stir into skillet.",
      "Reduce heat, cover and simmer 15 minutes until pasta is tender.",
      "Drop spoonfuls of ricotta on top, sprinkle mozzarella.",
      "Cover and cook 3 more minutes until cheese melts.",
      "Garnish with fresh basil and serve.",
    ],
  },
  {
    name: "Deconstructed Egg Roll Bowl",
    description: "All the flavors of a classic egg roll — cabbage, ginger, sesame — served in a bowl without the wrapper. Fast, low-carb, and totally satisfying.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 15,
    servings: 4,
    cuisine: "Asian",
    difficulty: "easy",
    ingredients: [
      "1 lb ground pork",
      "4 cups shredded cabbage",
      "1 cup shredded carrots",
      "3 cloves garlic (minced)",
      "1 tbsp fresh ginger (grated)",
      "3 tbsp soy sauce",
      "1 tbsp sesame oil",
      "1 tbsp rice vinegar",
      "2 green onions (sliced)",
      "1 tsp chili garlic sauce",
      "Sesame seeds to garnish",
    ],
    steps: [
      "Brown ground pork in a large skillet, drain excess fat.",
      "Add garlic and ginger, cook 1 minute.",
      "Add cabbage and carrots, stir-fry 5 minutes until softened.",
      "Stir in soy sauce, sesame oil, rice vinegar, and chili garlic sauce.",
      "Cook 2 more minutes.",
      "Garnish with green onions and sesame seeds. Serve as-is or over rice.",
    ],
  },
  {
    name: "Deconstructed Sushi Bowl",
    description: "All your favorite sushi flavors in a simple rice bowl — no rolling, no special tools, no sushi-grade stress. Customize toppings to your liking.",
    chef: "Green AI",
    prep_time_mins: 15,
    cook_time_mins: 20,
    servings: 2,
    cuisine: "Japanese",
    difficulty: "easy",
    ingredients: [
      "1 cup sushi rice",
      "4 oz sushi-grade salmon or tuna (sliced)",
      "1 avocado (sliced)",
      "1 cucumber (sliced)",
      "1/2 cup shredded carrots",
      "2 tbsp soy sauce",
      "1 tbsp rice vinegar",
      "1 tsp sesame oil",
      "Spicy mayo (mayo + sriracha)",
      "Nori strips",
      "Sesame seeds",
      "Pickled ginger",
    ],
    steps: [
      "Cook sushi rice per package instructions. Season with rice vinegar, a pinch of sugar, and salt.",
      "Divide rice between two bowls.",
      "Arrange salmon or tuna, avocado, cucumber, and carrots over the rice.",
      "Drizzle with soy sauce and sesame oil.",
      "Top with spicy mayo, nori strips, sesame seeds, and pickled ginger. Serve immediately.",
    ],
  },
  {
    name: "Deconstructed Chicken Pot Pie",
    description: "All the cozy comfort of chicken pot pie served in a bowl with a flaky puff pastry lid on top — easier to make and even easier to eat.",
    chef: "Green AI",
    prep_time_mins: 15,
    cook_time_mins: 30,
    servings: 4,
    cuisine: "American",
    difficulty: "medium",
    ingredients: [
      "2 cups cooked chicken (shredded)",
      "1 cup peas",
      "1 cup carrots (diced)",
      "1 cup celery (diced)",
      "1 cup chicken broth",
      "1 cup whole milk",
      "3 tbsp butter",
      "3 tbsp flour",
      "1 sheet puff pastry (thawed)",
      "1 tsp thyme",
      "Salt and pepper to taste",
    ],
    steps: [
      "Preheat oven to 400°F. Cut puff pastry into rounds or squares and bake on a parchment-lined sheet 12-15 minutes until golden.",
      "Melt butter in a saucepan over medium heat. Whisk in flour and cook 1 minute.",
      "Gradually whisk in broth and milk. Cook until thickened, 5 minutes.",
      "Add chicken, peas, carrots, celery, and thyme. Simmer 10 minutes.",
      "Season with salt and pepper.",
      "Ladle soup into bowls and top each with a baked puff pastry round.",
    ],
  },
  {
    name: "Deconstructed Shepherd's Pie Bowl",
    description: "Tender lamb and veggies in a rich gravy topped with creamy mashed potatoes — all in a bowl, no oven required after the potatoes are made.",
    chef: "Green AI",
    prep_time_mins: 15,
    cook_time_mins: 30,
    servings: 4,
    cuisine: "British",
    difficulty: "medium",
    ingredients: [
      "1 lb ground lamb",
      "1 cup peas",
      "1 cup carrots (diced)",
      "1 cup beef broth",
      "2 tbsp tomato paste",
      "1 tbsp Worcestershire sauce",
      "1 tsp rosemary",
      "1 tsp thyme",
      "4 large potatoes (peeled and cubed)",
      "3 tbsp butter",
      "1/4 cup warm milk",
      "Salt and pepper to taste",
    ],
    steps: [
      "Boil potatoes until tender, drain and mash with butter, milk, salt and pepper. Set aside.",
      "Brown ground lamb in a skillet, drain fat.",
      "Add carrots, cook 5 minutes.",
      "Stir in tomato paste, Worcestershire, rosemary, and thyme.",
      "Add broth and peas, simmer 10 minutes until slightly thickened.",
      "Spoon lamb mixture into bowls and top generously with mashed potatoes.",
    ],
  },
  {
    name: "Deconstructed Burrito Bowl",
    description: "All the bold flavors of a burrito — seasoned beef, rice, beans, pico, guac — served open in a bowl so every bite is perfectly loaded.",
    chef: "Green AI",
    prep_time_mins: 15,
    cook_time_mins: 20,
    servings: 4,
    cuisine: "Mexican",
    difficulty: "easy",
    ingredients: [
      "1 lb ground beef",
      "1 packet taco seasoning",
      "1 cup Mexican rice (cooked)",
      "1 can black beans (drained)",
      "1 cup pico de gallo",
      "1 avocado (sliced or mashed)",
      "1/2 cup sour cream",
      "1/2 cup shredded cheddar",
      "Fresh cilantro",
      "Lime wedges",
      "Tortilla chips (optional)",
    ],
    steps: [
      "Brown ground beef in a skillet, drain fat.",
      "Add taco seasoning and a splash of water, stir and simmer 3 minutes.",
      "Warm black beans separately.",
      "Build bowls: start with rice, add seasoned beef, black beans, pico de gallo, and avocado.",
      "Top with sour cream, shredded cheese, and cilantro.",
      "Serve with lime wedges and optional tortilla chips.",
    ],
  },
  {
    name: "Deconstructed BLT Salad",
    description: "The beloved BLT sandwich reimagined as a hearty salad — all the same flavors of bacon, lettuce, and tomato with a creamy mayo dressing, no bread needed.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 10,
    servings: 2,
    cuisine: "American",
    difficulty: "easy",
    ingredients: [
      "6 strips bacon",
      "4 cups romaine lettuce (chopped)",
      "1 cup cherry tomatoes (halved)",
      "1/2 cup croutons",
      "3 tbsp mayonnaise",
      "1 tbsp lemon juice",
      "1 tsp Dijon mustard",
      "Salt and pepper to taste",
    ],
    steps: [
      "Cook bacon until crispy, let drain and cool, then crumble.",
      "Whisk together mayo, lemon juice, Dijon, salt and pepper to make dressing.",
      "Toss romaine with dressing.",
      "Top with cherry tomatoes, croutons, and crumbled bacon.",
      "Serve immediately.",
    ],
  },
  {
    name: "Deconstructed Beef Wellington",
    description: "A stunning restaurant-quality presentation: seared tenderloin, mushroom duxelles, and flaky puff pastry served separately — all the flavor, far less stress.",
    chef: "Green AI",
    prep_time_mins: 20,
    cook_time_mins: 35,
    servings: 4,
    cuisine: "British",
    difficulty: "hard",
    ingredients: [
      "4 beef tenderloin medallions (6 oz each)",
      "2 cups cremini mushrooms (finely chopped)",
      "2 shallots (minced)",
      "2 cloves garlic (minced)",
      "2 tbsp butter",
      "1 sheet puff pastry (thawed)",
      "1 egg (beaten)",
      "2 tbsp Dijon mustard",
      "2 tbsp fresh thyme",
      "Salt and pepper to taste",
      "Olive oil",
    ],
    steps: [
      "Preheat oven to 400°F. Cut puff pastry into rectangles, brush with egg wash, bake 15 min until golden.",
      "Season beef medallions with salt and pepper. Sear in hot oiled skillet 3 minutes per side for medium-rare. Rest 5 minutes.",
      "In same skillet, cook shallots and garlic in butter 2 minutes. Add mushrooms, thyme, and a pinch of salt. Cook until all moisture evaporates, about 10 minutes.",
      "Brush beef with Dijon mustard.",
      "Plate each medallion alongside mushroom duxelles and a puff pastry rectangle.",
    ],
  },
  {
    name: "Deconstructed Lox and Bagel Salad",
    description: "All the classic bagel-and-lox fixings — smoked salmon, cream cheese, red onion, cucumber — tossed into a fresh spinach salad with everything bagel seasoning.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 0,
    servings: 2,
    cuisine: "American",
    difficulty: "easy",
    ingredients: [
      "4 oz smoked salmon",
      "4 cups baby spinach",
      "1 cucumber (sliced)",
      "1/4 red onion (thinly sliced)",
      "4 tbsp cream cheese (dolloped)",
      "1/2 cup cherry tomatoes",
      "2 tsp everything bagel seasoning",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "Capers (optional)",
    ],
    steps: [
      "Arrange spinach on two plates.",
      "Top with smoked salmon, cucumber, red onion, cherry tomatoes, and dollops of cream cheese.",
      "Drizzle with olive oil and lemon juice.",
      "Sprinkle generously with everything bagel seasoning.",
      "Add capers if desired. Serve immediately.",
    ],
  },
  {
    name: "Deconstructed Stuffed Pepper Bowl",
    description: "All the hearty, colorful goodness of stuffed bell peppers — seasoned beef, rice, tomatoes — served in a bowl without the wrapping fuss.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 25,
    servings: 4,
    cuisine: "American",
    difficulty: "easy",
    ingredients: [
      "1 lb ground beef",
      "2 bell peppers (any color, diced)",
      "1 cup white rice (cooked)",
      "1 can diced tomatoes (14 oz)",
      "1 cup beef broth",
      "1 tsp garlic powder",
      "1 tsp onion powder",
      "1 tsp cumin",
      "1 cup shredded cheddar",
      "Salt and pepper to taste",
      "Fresh parsley",
    ],
    steps: [
      "Brown ground beef in a skillet, drain fat.",
      "Add diced bell peppers, cook 5 minutes.",
      "Stir in garlic powder, onion powder, and cumin.",
      "Add diced tomatoes and broth, simmer 10 minutes.",
      "Serve over cooked rice.",
      "Top with shredded cheddar and fresh parsley.",
    ],
  },
  {
    name: "Deconstructed Caprese Salad Stack",
    description: "Fresh mozzarella, ripe tomatoes, and fragrant basil presented as individual components with a balsamic glaze drizzle — elegant, effortless, and beautiful.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 0,
    servings: 4,
    cuisine: "Italian",
    difficulty: "easy",
    ingredients: [
      "8 oz fresh mozzarella (sliced)",
      "3 large ripe tomatoes (sliced)",
      "1/2 cup fresh basil leaves",
      "3 tbsp extra-virgin olive oil",
      "2 tbsp balsamic glaze",
      "Flaky sea salt",
      "Cracked black pepper",
    ],
    steps: [
      "Arrange tomato slices on a platter.",
      "Place mozzarella slices alongside or overlapping the tomatoes.",
      "Scatter fresh basil leaves across the plate.",
      "Drizzle olive oil and balsamic glaze generously over everything.",
      "Finish with flaky salt and cracked black pepper. Serve immediately.",
    ],
  },
  {
    name: "Deconstructed Chicken Tikka Masala",
    description: "Juicy spiced chicken and cauliflower florets served alongside a rich tikka masala sauce with basmati rice — all the flavor, assembled your way.",
    chef: "Green AI",
    prep_time_mins: 15,
    cook_time_mins: 30,
    servings: 4,
    cuisine: "Indian",
    difficulty: "medium",
    ingredients: [
      "1.5 lb chicken thighs (cubed)",
      "1 cup cauliflower florets",
      "1 can crushed tomatoes (14 oz)",
      "1 cup heavy cream",
      "1 onion (diced)",
      "4 cloves garlic (minced)",
      "1 tbsp ginger (grated)",
      "2 tbsp garam masala",
      "1 tsp cumin",
      "1 tsp turmeric",
      "2 tbsp butter",
      "2 cups basmati rice (cooked)",
      "Fresh cilantro",
    ],
    steps: [
      "Toss chicken with half the garam masala, cumin, and turmeric. Cook in butter over high heat until browned, about 6 minutes. Set aside.",
      "Sauté cauliflower in same pan until golden. Set aside.",
      "In same pan, cook onion until soft. Add garlic, ginger, remaining spices.",
      "Add crushed tomatoes, simmer 10 minutes. Stir in cream, simmer 5 more minutes.",
      "Serve rice in bowls with chicken and cauliflower arranged on top. Spoon tikka masala sauce alongside. Garnish with cilantro.",
    ],
  },
  {
    name: "Deconstructed Cabbage Roll Soup",
    description: "All the cozy, savory elements of classic cabbage rolls — ground beef, rice, cabbage, tomato — simmered into a hearty, no-fuss soup.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 35,
    servings: 6,
    cuisine: "Eastern European",
    difficulty: "easy",
    ingredients: [
      "1 lb ground beef",
      "1/2 head green cabbage (roughly chopped)",
      "1 cup white rice (uncooked)",
      "1 can diced tomatoes (14 oz)",
      "1 can tomato sauce (15 oz)",
      "4 cups beef broth",
      "1 onion (diced)",
      "3 cloves garlic (minced)",
      "1 tsp paprika",
      "1 tsp Italian seasoning",
      "Salt and pepper to taste",
      "Fresh parsley",
    ],
    steps: [
      "Brown ground beef with onion in a large pot, drain fat.",
      "Add garlic, paprika, and Italian seasoning, cook 1 minute.",
      "Add cabbage, diced tomatoes, tomato sauce, and broth.",
      "Bring to a boil, then stir in uncooked rice.",
      "Reduce heat, cover and simmer 20 minutes until rice is cooked and cabbage is tender.",
      "Season with salt and pepper. Garnish with fresh parsley.",
    ],
  },
  {
    name: "Deconstructed Apple Pie Bowl",
    description: "Warm cinnamon-spiced apples, creamy Greek yogurt, maple-roasted pecans, and crunchy oat crumble — all the flavors of apple pie, served as a gorgeous bowl.",
    chef: "Green AI",
    prep_time_mins: 10,
    cook_time_mins: 15,
    servings: 2,
    cuisine: "American",
    difficulty: "easy",
    ingredients: [
      "2 apples (peeled and sliced)",
      "2 tbsp butter",
      "2 tbsp brown sugar",
      "1 tsp cinnamon",
      "1/4 tsp nutmeg",
      "1/2 cup rolled oats",
      "2 tbsp maple syrup",
      "1/4 cup pecans (roughly chopped)",
      "1 cup Greek yogurt (or vanilla ice cream)",
    ],
    steps: [
      "Melt butter in a skillet over medium heat. Add apple slices, brown sugar, cinnamon, and nutmeg. Cook 8-10 minutes until apples are tender and caramelized.",
      "In a separate pan, toast oats, maple syrup, and pecans over medium heat for 5 minutes until golden.",
      "Spoon Greek yogurt (or ice cream) into bowls.",
      "Top with warm caramelized apples.",
      "Sprinkle maple pecan oat crumble on top. Serve immediately.",
    ],
  },
  {
    name: "Deconstructed Ice Cream Sandwich Milkshake",
    description: "The classic ice cream sandwich reimagined as a rich, creamy milkshake — chocolate cookie crumbles, vanilla ice cream, and a whipped cream finish.",
    chef: "Green AI",
    prep_time_mins: 5,
    cook_time_mins: 0,
    servings: 2,
    cuisine: "American",
    difficulty: "easy",
    ingredients: [
      "3 scoops vanilla ice cream",
      "1 cup whole milk",
      "4 chocolate sandwich cookies (crushed)",
      "1/2 tsp vanilla extract",
      "Whipped cream",
      "Extra cookie crumbles for garnish",
    ],
    steps: [
      "Add vanilla ice cream, whole milk, and vanilla extract to a blender.",
      "Blend until smooth.",
      "Stir in half the crushed cookies (don't blend — keep them chunky).",
      "Pour into tall glasses.",
      "Top with whipped cream and remaining cookie crumbles. Serve immediately with a wide straw.",
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
