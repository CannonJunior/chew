import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { wikiIngredients, wikiNutrition, wikiRelationships } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { now } from '@/lib/utils/time';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ingredient = db.select().from(wikiIngredients).where(eq(wikiIngredients.id, id)).get();
  if (!ingredient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const nutrition = db.select().from(wikiNutrition).where(eq(wikiNutrition.ingredientId, id)).get();
  const relationships = db
    .select()
    .from(wikiRelationships)
    .where(eq(wikiRelationships.ingredientAId, id))
    .limit(50)
    .all();

  return NextResponse.json({ ingredient, nutrition, relationships });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  db.update(wikiIngredients)
    .set({ ...body, updatedAt: now() })
    .where(eq(wikiIngredients.id, id))
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(wikiIngredients).where(eq(wikiIngredients.id, id)).run();
  return NextResponse.json({ ok: true });
}
