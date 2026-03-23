import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { recipes, recipeIngredients, recipeSteps, recipeMedia } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';

const OLLAMA_BASE = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/api\/?$/, '');
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL ?? 'qwen2.5:7b';

type RecipeInput = {
  id: string;
  title: string;
  cuisine: string | null;
  difficulty: string | null;
};

type GeneratedRecipe = {
  title: string;
  description: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prepTimeMin: number;
  cookTimeMin: number;
  servings: number;
  ingredients: string[];
  steps: string[];
};

async function generateReplacement(old: RecipeInput): Promise<GeneratedRecipe | null> {
  const cuisineHint = old.cuisine ? ` (${old.cuisine} cuisine, ${old.difficulty ?? 'medium'} difficulty)` : '';
  const prompt = `Generate a replacement recipe for "${old.title}"${cuisineHint}. Choose a DIFFERENT, well-known dish in the same or similar cuisine — one that is famous enough to have many photographs available online. Return ONLY valid JSON with exactly these fields: {"title":"string","description":"2-3 sentence string","cuisine":"string","difficulty":"easy"|"medium"|"hard","prepTimeMin":number,"cookTimeMin":number,"servings":number,"ingredients":["string"],"steps":["string"]}`;

  try {
    const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: 'system', content: 'You are a culinary expert. Respond only with valid JSON. No markdown, no explanation, no extra text.' },
          { role: 'user', content: prompt },
        ],
        stream: false,
        format: 'json',
        options: { num_ctx: 4096, temperature: 0.7 },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { message?: { content?: string } };
    const content = data.message?.content ?? '';
    return JSON.parse(content) as GeneratedRecipe;
  } catch {
    return null;
  }
}

async function findImage(baseUrl: string, recipeId: string, title: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/api/recipes/image?id=${recipeId}&q=${encodeURIComponent(title)}`);
    if (!res.ok) return null;
    const { images } = await res.json() as { images: string[] };
    return images[0] ?? null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { recipes: RecipeInput[] };
  const toReplace: RecipeInput[] = body.recipes ?? [];
  if (!toReplace.length) return NextResponse.json({ added: [], deleted: [] });

  const baseUrl = new URL(req.url).origin;
  const added: object[] = [];
  const deleted: string[] = [];

  // Process replacements sequentially to avoid hammering Ollama
  for (const old of toReplace) {
    const generated = await generateReplacement(old);
    if (!generated) continue;

    const ts = now();
    const newRecipeId = newId();

    const newRecipe = {
      id: newRecipeId,
      title: generated.title,
      description: generated.description ?? null,
      cuisine: generated.cuisine ?? old.cuisine ?? null,
      difficulty: generated.difficulty ?? old.difficulty ?? 'medium',
      prepTimeMin: typeof generated.prepTimeMin === 'number' ? generated.prepTimeMin : null,
      cookTimeMin: typeof generated.cookTimeMin === 'number' ? generated.cookTimeMin : null,
      servings: typeof generated.servings === 'number' ? generated.servings : 4,
      tags: null as string | null,
      sourceUrl: null as string | null,
      createdAt: ts,
      updatedAt: ts,
    };

    // Search for image before the transaction
    const imageUrl = await findImage(baseUrl, newRecipeId, generated.title);

    db.transaction((tx) => {
      // Insert new recipe
      tx.insert(recipes).values(newRecipe).run();

      // Insert ingredients
      const ingredients = Array.isArray(generated.ingredients) ? generated.ingredients : [];
      for (let i = 0; i < ingredients.length; i++) {
        const name = String(ingredients[i]).trim();
        if (!name) continue;
        tx.insert(recipeIngredients).values({
          id: newId(),
          recipeId: newRecipeId,
          nameOverride: name,
          stepOrder: i,
        }).run();
      }

      // Insert steps
      const steps = Array.isArray(generated.steps) ? generated.steps : [];
      for (let i = 0; i < steps.length; i++) {
        const instruction = String(steps[i]).trim();
        if (!instruction) continue;
        tx.insert(recipeSteps).values({
          id: newId(),
          recipeId: newRecipeId,
          stepNumber: i + 1,
          instruction,
        }).run();
      }

      // Insert primary image if found
      if (imageUrl) {
        tx.insert(recipeMedia).values({
          id: newId(),
          recipeId: newRecipeId,
          type: 'image',
          urlOrPath: imageUrl,
          isPrimary: 1,
          sortOrder: 0,
        }).run();
      }

      // Delete old recipe and all its children
      tx.delete(recipeMedia).where(eq(recipeMedia.recipeId, old.id)).run();
      tx.delete(recipeSteps).where(eq(recipeSteps.recipeId, old.id)).run();
      tx.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, old.id)).run();
      tx.delete(recipes).where(eq(recipes.id, old.id)).run();
    });

    added.push(newRecipe);
    deleted.push(old.id);
  }

  return NextResponse.json({ added, deleted });
}
