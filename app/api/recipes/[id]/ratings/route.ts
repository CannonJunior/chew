import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { recipeRatings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { now } from '@/lib/utils/time';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const row = db.select().from(recipeRatings).where(eq(recipeRatings.recipeId, params.id)).get();
  return NextResponse.json(row ?? null);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json() as { picture?: number; quality?: number; uniqueness?: number };

  const existing = db.select().from(recipeRatings).where(eq(recipeRatings.recipeId, params.id)).get();

  if (existing) {
    const updated = db
      .update(recipeRatings)
      .set({ ...body, updatedAt: now() })
      .where(eq(recipeRatings.recipeId, params.id))
      .returning()
      .get();
    return NextResponse.json(updated);
  }

  const inserted = db
    .insert(recipeRatings)
    .values({ recipeId: params.id, ...body, updatedAt: now() })
    .returning()
    .get();
  return NextResponse.json(inserted);
}
