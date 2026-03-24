import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { kitchenWishlist } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const update: Partial<typeof kitchenWishlist.$inferInsert> = {};

  if (body.acquired !== undefined) update.acquired = body.acquired ? 1 : 0;
  if (body.priority !== undefined) update.priority = body.priority;
  if (body.notes !== undefined) update.notes = body.notes;
  if (body.estimatedPrice !== undefined) update.estimatedPrice = body.estimatedPrice;
  if (body.name !== undefined) update.name = body.name;
  if (body.brand !== undefined) update.brand = body.brand;
  if (body.category !== undefined) update.category = body.category;
  if (body.url !== undefined) update.url = body.url;

  db.update(kitchenWishlist).set(update).where(eq(kitchenWishlist.id, id)).run();
  const updated = db.select().from(kitchenWishlist).where(eq(kitchenWishlist.id, id)).get();
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(kitchenWishlist).where(eq(kitchenWishlist.id, id)).run();
  return NextResponse.json({ ok: true });
}
