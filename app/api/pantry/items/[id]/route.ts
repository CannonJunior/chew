import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { groceryItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  db.update(groceryItems).set(body).where(eq(groceryItems.id, id)).run();
  return NextResponse.json({ id, ...body });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(groceryItems).where(eq(groceryItems.id, id)).run();
  return NextResponse.json({ success: true });
}
