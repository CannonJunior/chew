import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { kitchenEquipment } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  db.update(kitchenEquipment).set(body).where(eq(kitchenEquipment.id, id)).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(kitchenEquipment).where(eq(kitchenEquipment.id, id)).run();
  return NextResponse.json({ ok: true });
}
