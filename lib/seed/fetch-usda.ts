#!/usr/bin/env tsx
/**
 * USDA FoodData Central — Wiki Seeder
 *
 * Fetches Foundation Foods and SR Legacy foods from the USDA FDC API
 * and inserts them into the wiki_ingredients + wiki_nutrition tables.
 *
 * Usage:
 *   npm run seed:wiki
 *
 * Options (env vars):
 *   USDA_API_KEY   Your FDC API key (free at https://fdc.nal.usda.gov/api-key-signup)
 *                  Defaults to DEMO_KEY (30 req/hour – fine for one-time seeding)
 *   USDA_DATASETS  Comma-separated list of datasets to fetch (default: "Foundation,SR Legacy")
 *   USDA_MAX_PAGES Max pages per dataset (default: 50; 200 foods/page)
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import path from 'path';
import { wikiIngredients, wikiNutrition } from '../db/schema';
import { ulid } from 'ulid';
import { inferCategory } from './categories';

// ── Config ───────────────────────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), 'chew.db');
const API_KEY = process.env.USDA_API_KEY ?? 'DEMO_KEY';
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const PAGE_SIZE = 200;
const MAX_PAGES = parseInt(process.env.USDA_MAX_PAGES ?? '50', 10);
const DATASETS = (process.env.USDA_DATASETS ?? 'Foundation,SR Legacy').split(',').map((s) => s.trim());

// Nutrient number → field name mapping (USDA nutrient IDs)
const NUTRIENT_MAP: Record<string, keyof NutrientRow> = {
  '208': 'calories',   // Energy (kcal)
  '1008': 'calories',  // Energy (kcal) — alt id
  '203': 'proteinG',   // Protein
  '1003': 'proteinG',
  '204': 'fatG',       // Total lipid (fat)
  '1004': 'fatG',
  '205': 'carbsG',     // Carbohydrate, by difference
  '1005': 'carbsG',
  '291': 'fiberG',     // Fiber, total dietary
  '1079': 'fiberG',
  '269': 'sugarG',     // Sugars, total
  '2000': 'sugarG',
  '307': 'sodiumMg',   // Sodium, Na
  '1093': 'sodiumMg',
};

type NutrientRow = {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  sugarG: number | null;
  sodiumMg: number | null;
};

// ── Category mapping ─────────────────────────────────────────────────────────

// SR Legacy food category → our schema category (overrides keyword inference when available)
const CATEGORY_MAP: Record<string, string> = {
  'Vegetables and Vegetable Products': 'produce',
  'Fruits and Fruit Juices': 'produce',
  'Beef Products': 'meat',
  'Pork Products': 'meat',
  'Lamb, Veal, and Game Products': 'meat',
  'Sausages and Luncheon Meats': 'meat',
  'Poultry Products': 'meat',
  'Finfish and Shellfish Products': 'seafood',
  'Dairy and Egg Products': 'dairy',
  'Legumes and Legume Products': 'pantry',
  'Cereal Grains and Pasta': 'pantry',
  'Fats and Oils': 'pantry',
  'Spices and Herbs': 'pantry',
  'Nut and Seed Products': 'pantry',
  'Baked Products': 'pantry',
  'Sweets': 'pantry',
  'Soups, Sauces, and Gravies': 'pantry',
  'Beverages': 'beverage',
  'Alcoholic Beverages': 'beverage',
  'Snacks': 'pantry',
};

// ── Name normalisation ────────────────────────────────────────────────────────

/**
 * USDA descriptions are verbose ("Tomatoes, red, ripe, raw, year round average").
 * For Foundation Foods, names are already clean ("Tomatoes").
 * For SR Legacy, strip qualifiers after the first comma to get a clean primary name,
 * but keep the full description as the record's description field.
 */
function primaryName(description: string, dataType: string): string {
  if (dataType === 'Foundation') return description.trim();
  // SR Legacy: "Chicken, broilers or fryers, breast…" → "Chicken"
  const first = description.split(',')[0].trim();
  return first.charAt(0).toUpperCase() + first.slice(1);
}

// ── USDA API types ───────────────────────────────────────────────────────────

type FdcNutrient = { number: string; name: string; amount: number; unitName: string };
type FdcFoodCategory = { description: string };
type FdcFood = {
  fdcId: number;
  description: string;
  dataType: string;
  foodNutrients: FdcNutrient[];
  foodCategory?: FdcFoodCategory | string;
};

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function fetchPage(dataType: string, page: number): Promise<FdcFood[]> {
  const url =
    `${BASE_URL}/foods/list` +
    `?dataType=${encodeURIComponent(dataType)}` +
    `&pageSize=${PAGE_SIZE}` +
    `&pageNumber=${page}` +
    `&nutrients=208,203,204,205,291,269,307,1008,1003,1004,1005,1079,2000,1093` +
    `&api_key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 429) throw new Error('Rate limited — wait 1 hour or set USDA_API_KEY');
    throw new Error(`USDA API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<FdcFood[]>;
}

function extractNutrients(foodNutrients: FdcNutrient[]): NutrientRow {
  const row: NutrientRow = {
    calories: null, proteinG: null, carbsG: null, fatG: null,
    fiberG: null, sugarG: null, sodiumMg: null,
  };
  for (const n of foodNutrients) {
    const field = NUTRIENT_MAP[n.number];
    if (field && row[field] === null) {
      row[field] = n.amount ?? null;
    }
  }
  return row;
}

function extractCategoryFromFood(food: FdcFood): string {
  if (food.foodCategory) {
    const cat = typeof food.foodCategory === 'string'
      ? food.foodCategory
      : food.foodCategory.description;
    return CATEGORY_MAP[cat] ?? inferCategory(food.description);
  }
  return inferCategory(food.description);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌾 USDA FoodData Central — Wiki Seeder');
  console.log(`   API key: ${API_KEY === 'DEMO_KEY' ? 'DEMO_KEY (30 req/hour)' : '*** (custom)'}`);
  console.log(`   Datasets: ${DATASETS.join(', ')}`);
  console.log('');

  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema: { wikiIngredients, wikiNutrition } });

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const dataType of DATASETS) {
    console.log(`📦 Fetching ${dataType}…`);
    let page = 1;
    let datasetInserted = 0;

    while (page <= MAX_PAGES) {
      process.stdout.write(`   Page ${page}… `);

      let foods: FdcFood[];
      try {
        foods = await fetchPage(dataType, page);
      } catch (err) {
        console.error(`\n   ❌ ${(err as Error).message}`);
        break;
      }

      if (foods.length === 0) {
        console.log('done (empty page)');
        break;
      }

      for (const food of foods) {
        const name = primaryName(food.description, food.dataType);

        // Skip duplicates by name
        const existing = db
          .select({ id: wikiIngredients.id })
          .from(wikiIngredients)
          .where(eq(wikiIngredients.name, name))
          .get();

        if (existing) {
          totalSkipped++;
          continue;
        }

        const ts = Math.floor(Date.now() / 1000);
        const id = ulid();
        const category = extractCategoryFromFood(food);
        const nutrients = extractNutrients(food.foodNutrients);

        db.insert(wikiIngredients)
          .values({
            id,
            name,
            aliases: null,
            description: food.description !== name ? food.description : null,
            category,
            subcategory: null,
            origin: null,
            seasons: null,
            flavorProfile: null,
            imageUrl: null,
            usdaFdcId: String(food.fdcId),
            flavorGraphId: null,
            createdAt: ts,
            updatedAt: ts,
          })
          .run();

        db.insert(wikiNutrition)
          .values({
            ingredientId: id,
            calories: nutrients.calories,
            proteinG: nutrients.proteinG,
            carbsG: nutrients.carbsG,
            fatG: nutrients.fatG,
            fiberG: nutrients.fiberG,
            sugarG: nutrients.sugarG,
            sodiumMg: nutrients.sodiumMg,
            servingSizeG: 100,
            source: `usda_${dataType.toLowerCase().replace(/\s+/g, '_')}`,
          })
          .run();

        datasetInserted++;
      }

      console.log(`${foods.length} foods (${datasetInserted} inserted so far)`);

      if (foods.length < PAGE_SIZE) {
        console.log(`   ✅ ${dataType} complete`);
        break;
      }

      page++;

      // Polite delay between pages to avoid rate limiting
      if (page <= MAX_PAGES) await new Promise((r) => setTimeout(r, 400));
    }

    totalInserted += datasetInserted;
    console.log(`   → ${datasetInserted} new ingredients from ${dataType}\n`);
  }

  sqlite.close();

  console.log(`✅ Done — ${totalInserted} ingredients inserted, ${totalSkipped} already existed`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
