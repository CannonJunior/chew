import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { recipes, recipeIngredients, recipeSteps, recipeMedia } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { now } from '@/lib/utils/time';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = db.select().from(recipes).where(eq(recipes.id, id)).get();
  if (!recipe) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ingredients = db.select().from(recipeIngredients).where(eq(recipeIngredients.recipeId, id)).all();
  const steps = db
    .select()
    .from(recipeSteps)
    .where(eq(recipeSteps.recipeId, id))
    .all()
    .sort((a, b) => a.stepNumber - b.stepNumber);
  const media = db.select().from(recipeMedia).where(eq(recipeMedia.recipeId, id)).all();

  return NextResponse.json({ recipe, ingredients, steps, media });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const update: Record<string, unknown> = { ...body, updatedAt: now() };
  if (body.tags) update.tags = JSON.stringify(body.tags);
  db.update(recipes).set(update).where(eq(recipes.id, id)).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(recipeMedia).where(eq(recipeMedia.recipeId, id)).run();
  db.delete(recipeSteps).where(eq(recipeSteps.recipeId, id)).run();
  db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id)).run();
  db.delete(recipes).where(eq(recipes.id, id)).run();
  return NextResponse.json({ ok: true });
}
