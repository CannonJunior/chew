import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { recipeIngredients } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: recipeId } = await params;
  const body = await req.json();
  const ingredient = {
    id: newId(),
    recipeId,
    wikiId: (body.wikiId ?? null) as string | null,
    nameOverride: (body.nameOverride ?? body.name ?? null) as string | null,
    amount: (body.amount ?? null) as number | null,
    unit: (body.unit ?? null) as string | null,
    notes: (body.notes ?? null) as string | null,
    optional: (body.optional ? 1 : 0) as number,
    stepOrder: (body.stepOrder ?? null) as number | null,
  };
  db.insert(recipeIngredients).values(ingredient).run();
  return NextResponse.json(ingredient, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: recipeId } = await params;
  db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, recipeId)).run();
  return NextResponse.json({ ok: true });
}
