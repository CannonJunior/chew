import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { kitchenEquipment } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { name, brand, model, category, subcategory, condition, notes, imagePath, purchasedDate } = body;
  const update = Object.fromEntries(
    Object.entries({ name, brand, model, category, subcategory, condition, notes, imagePath, purchasedDate })
      .filter(([, v]) => v !== undefined)
  );
  db.update(kitchenEquipment).set(update).where(eq(kitchenEquipment.id, id)).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(kitchenEquipment).where(eq(kitchenEquipment.id, id)).run();
  return NextResponse.json({ ok: true });
}
