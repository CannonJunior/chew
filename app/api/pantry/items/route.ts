import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { groceryItems } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { desc, eq, like, and, isNull, isNotNull, SQL } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const runningLow = searchParams.get('running_low');
  const search = searchParams.get('q');
  const includeRemoved = searchParams.get('include_removed') === '1';

  const conditions: (SQL | undefined)[] = [];

  if (!includeRemoved) {
    conditions.push(isNull(groceryItems.removedAt));
  }
  if (category && category !== 'all') {
    conditions.push(eq(groceryItems.category, category));
  }
  if (runningLow === '1') {
    conditions.push(eq(groceryItems.runningLow, 1));
  }
  if (search) {
    conditions.push(like(groceryItems.name, `%${search}%`));
  }

  const rows = db.select().from(groceryItems)
    .where(and(...conditions))
    .orderBy(desc(groceryItems.createdAt))
    .all();

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = {
    id: newId(),
    receiptId: (body.receiptId ?? null) as string | null,
    name: body.name as string,
    normalizedName: body.name as string,
    category: (body.category ?? 'other') as string,
    quantity: (body.quantity ?? null) as number | null,
    unit: (body.unit ?? null) as string | null,
    price: (body.price ?? null) as number | null,
    purchaseDate: now(),
    runningLow: 0 as const,
    notes: (body.notes ?? null) as string | null,
    createdAt: now(),
  };
  db.insert(groceryItems).values(item).run();
  return NextResponse.json(item, { status: 201 });
}
