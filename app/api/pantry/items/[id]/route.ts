import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { groceryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, normalizedName, category, quantity, unit, price, purchaseDate, expiryDate, runningLow, remainingPct, notes, wikiId, removedAt, removalReason } = body;
  const update = Object.fromEntries(
    Object.entries({ name, normalizedName, category, quantity, unit, price, purchaseDate, expiryDate, runningLow, remainingPct, notes, wikiId, removedAt, removalReason })
      .filter(([, v]) => v !== undefined)
  );
  db.update(groceryItems).set(update).where(eq(groceryItems.id, id)).run();
  return NextResponse.json({ id, ...update });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(groceryItems).where(eq(groceryItems.id, id)).run();
  return NextResponse.json({ success: true });
}
