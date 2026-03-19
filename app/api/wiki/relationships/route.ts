import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { wikiRelationships, wikiIngredients } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { eq, or, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ingredientId = searchParams.get('ingredientId');

  if (!ingredientId) {
    return NextResponse.json({ error: 'ingredientId required' }, { status: 400 });
  }

  const rels = db
    .select()
    .from(wikiRelationships)
    .where(
      or(
        eq(wikiRelationships.ingredientAId, ingredientId),
        eq(wikiRelationships.ingredientBId, ingredientId)
      )
    )
    .all();

  // Collect all referenced ingredient IDs
  const ids = new Set<string>();
  rels.forEach((r) => {
    if (r.ingredientAId) ids.add(r.ingredientAId);
    if (r.ingredientBId) ids.add(r.ingredientBId);
  });

  const ingredientList = ids.size
    ? db
        .select({ id: wikiIngredients.id, name: wikiIngredients.name, category: wikiIngredients.category })
        .from(wikiIngredients)
        .where(inArray(wikiIngredients.id, [...ids]))
        .all()
    : [];

  return NextResponse.json({ relationships: rels, ingredients: ingredientList });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rel = {
    id: newId(),
    ingredientAId: body.ingredientAId as string,
    ingredientBId: body.ingredientBId as string,
    relationship: body.relationship as string,
    strength: (body.strength ?? 0.5) as number,
    sharedCompounds: body.sharedCompounds ? JSON.stringify(body.sharedCompounds) : null,
    notes: (body.notes ?? null) as string | null,
  };
  db.insert(wikiRelationships).values(rel).run();
  return NextResponse.json(rel, { status: 201 });
}
