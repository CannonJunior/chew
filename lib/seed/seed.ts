import { db } from '@/lib/db/client';
import { wikiIngredients, wikiNutrition, wikiRelationships, socialSources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import ingredientsData from './usda-ingredients.json';

// Social source defaults
const DEFAULT_SOURCES = [
  { name: 'r/food', type: 'reddit_rss', url: 'https://www.reddit.com/r/food.rss' },
  { name: 'r/recipes', type: 'reddit_rss', url: 'https://www.reddit.com/r/recipes.rss' },
  { name: 'r/Cooking', type: 'reddit_rss', url: 'https://www.reddit.com/r/Cooking.rss' },
  { name: 'r/MealPrepSunday', type: 'reddit_rss', url: 'https://www.reddit.com/r/MealPrepSunday.rss' },
  { name: 'r/GifRecipes', type: 'reddit_rss', url: 'https://www.reddit.com/r/GifRecipes.rss' },
  { name: 'Food52', type: 'rss', url: 'https://food52.com/feed' },
  { name: 'Serious Eats', type: 'rss', url: 'https://www.seriouseats.com/feeds/all.xml' },
  { name: 'The Kitchn', type: 'rss', url: 'https://www.thekitchn.com/main/atom.xml' },
];

// Flavor pairing relationships from culinary tradition
const RELATIONSHIPS = [
  { a: 'Tomato', b: 'Basil', rel: 'flavor_pairing', strength: 0.95 },
  { a: 'Tomato', b: 'Garlic', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Tomato', b: 'Olive Oil', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Garlic', b: 'Olive Oil', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Garlic', b: 'Onion', rel: 'same_family', strength: 0.8 },
  { a: 'Lemon', b: 'Garlic', rel: 'flavor_pairing', strength: 0.8 },
  { a: 'Lemon', b: 'Salmon', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Lemon', b: 'Butter', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Butter', b: 'Garlic', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Parmesan Cheese', b: 'Pasta', rel: 'cultural_pairing', strength: 0.95 },
  { a: 'Parmesan Cheese', b: 'Egg', rel: 'cultural_pairing', strength: 0.8 },
  { a: 'Parmesan Cheese', b: 'Black Pepper', rel: 'cultural_pairing', strength: 0.85 },
  { a: 'Egg', b: 'Butter', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Onion', b: 'Carrot', rel: 'complementary', strength: 0.8 },
  { a: 'Onion', b: 'Celery', rel: 'complementary', strength: 0.85 },
  { a: 'Carrot', b: 'Celery', rel: 'complementary', strength: 0.8 },
  { a: 'Ginger', b: 'Garlic', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Ginger', b: 'Soy Sauce', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Ginger', b: 'Coconut Milk', rel: 'flavor_pairing', strength: 0.8 },
  { a: 'Soy Sauce', b: 'Garlic', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Basil', b: 'Parmesan Cheese', rel: 'cultural_pairing', strength: 0.9 },
  { a: 'Basil', b: 'Olive Oil', rel: 'cultural_pairing', strength: 0.9 },
  { a: 'Rosemary', b: 'Thyme', rel: 'same_family', strength: 0.85 },
  { a: 'Rosemary', b: 'Garlic', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Thyme', b: 'Onion', rel: 'flavor_pairing', strength: 0.8 },
  { a: 'Cumin', b: 'Coriander', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Cumin', b: 'Chili Pepper', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Chili Pepper', b: 'Lime', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Chili Pepper', b: 'Avocado', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Avocado', b: 'Lime', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Salmon', b: 'Dill', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Mushroom', b: 'Thyme', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Mushroom', b: 'Garlic', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Broccoli', b: 'Garlic', rel: 'flavor_pairing', strength: 0.8 },
  { a: 'Spinach', b: 'Garlic', rel: 'flavor_pairing', strength: 0.8 },
  { a: 'Chicken Breast', b: 'Lemon', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Chicken Breast', b: 'Garlic', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Chicken Breast', b: 'Rosemary', rel: 'flavor_pairing', strength: 0.8 },
  { a: 'Beef', b: 'Rosemary', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Beef', b: 'Mushroom', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Lamb', b: 'Rosemary', rel: 'flavor_pairing', strength: 0.95 },
  { a: 'Lamb', b: 'Garlic', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Shrimp', b: 'Garlic', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Shrimp', b: 'Butter', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Shrimp', b: 'Lime', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Coconut Milk', b: 'Lime', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Honey', b: 'Lemon', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Honey', b: 'Ginger', rel: 'flavor_pairing', strength: 0.8 },
  { a: 'Chocolate', b: 'Vanilla', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Apple', b: 'Cinnamon', rel: 'flavor_pairing', strength: 0.95 },
  { a: 'Cheddar Cheese', b: 'Apple', rel: 'flavor_pairing', strength: 0.8 },
  { a: 'Olive Oil', b: 'Lemon', rel: 'flavor_pairing', strength: 0.9 },
  { a: 'Rice', b: 'Soy Sauce', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Pasta', b: 'Olive Oil', rel: 'cultural_pairing', strength: 0.9 },
  { a: 'Tomato', b: 'Eggplant', rel: 'same_family', strength: 0.6 },
  { a: 'Tomato', b: 'Bell Pepper', rel: 'same_family', strength: 0.6 },
  { a: 'Broccoli', b: 'Kale', rel: 'same_family', strength: 0.7 },
  { a: 'Flour', b: 'Egg', rel: 'complementary', strength: 0.85 },
  { a: 'Flour', b: 'Butter', rel: 'complementary', strength: 0.85 },
  { a: 'Chickpea', b: 'Cumin', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Chickpea', b: 'Lemon', rel: 'flavor_pairing', strength: 0.85 },
  { a: 'Paprika', b: 'Cumin', rel: 'flavor_pairing', strength: 0.8 },
];

type IngredientData = {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  origin: string;
  seasons: string[];
  flavorProfile: Record<string, number>;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  usdaFdcId?: string;
};

export async function seedDatabase() {
  console.log('Seeding database...');

  // Seed wiki ingredients
  const data = ingredientsData as IngredientData[];
  const nameToId: Record<string, string> = {};

  for (const ing of data) {
    const existing = db.select().from(wikiIngredients).where(
      eq(wikiIngredients.name, ing.name)
    ).get();

    if (existing) {
      nameToId[ing.name] = existing.id;
      continue;
    }

    const id = newId();
    nameToId[ing.name] = id;
    const ts = now();

    db.insert(wikiIngredients).values({
      id,
      name: ing.name,
      description: ing.description,
      category: ing.category,
      subcategory: ing.subcategory,
      origin: ing.origin,
      seasons: JSON.stringify(ing.seasons),
      flavorProfile: JSON.stringify(ing.flavorProfile),
      usdaFdcId: ing.usdaFdcId ?? null,
      createdAt: ts,
      updatedAt: ts,
    }).run();

    db.insert(wikiNutrition).values({
      ingredientId: id,
      calories: ing.calories,
      proteinG: ing.protein,
      carbsG: ing.carbs,
      fatG: ing.fat,
      fiberG: ing.fiber,
      sugarG: ing.sugar,
      sodiumMg: ing.sodium,
      servingSizeG: 100,
      source: 'usda',
    }).run();
  }

  // Seed relationships
  for (const rel of RELATIONSHIPS) {
    const aId = nameToId[rel.a];
    const bId = nameToId[rel.b];
    if (!aId || !bId) continue;

    try {
      db.insert(wikiRelationships).values({
        id: newId(),
        ingredientAId: aId,
        ingredientBId: bId,
        relationship: rel.rel,
        strength: rel.strength,
      }).run();
    } catch {
      // Ignore duplicate relationship errors
    }
  }

  // Seed social sources
  for (const source of DEFAULT_SOURCES) {
    const existing = db.select().from(socialSources).where(
      eq(socialSources.url, source.url)
    ).get();
    if (!existing) {
      db.insert(socialSources).values({
        id: newId(),
        name: source.name,
        type: source.type,
        url: source.url,
        active: 1,
        createdAt: now(),
      }).run();
    }
  }

  console.log(`Seeded ${data.length} ingredients, ${RELATIONSHIPS.length} relationships, ${DEFAULT_SOURCES.length} social sources`);
}
