import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { kitchenWishlist } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { asc } from 'drizzle-orm';

export async function GET() {
  const rows = db
    .select()
    .from(kitchenWishlist)
    .orderBy(asc(kitchenWishlist.sortOrder), asc(kitchenWishlist.createdAt))
    .all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = {
    id: newId(),
    name: body.name as string,
    brand: (body.brand ?? null) as string | null,
    category: (body.category ?? 'tool') as string,
    priority: (body.priority ?? 'medium') as string,
    estimatedPrice: (body.estimatedPrice ?? null) as number | null,
    notes: (body.notes ?? null) as string | null,
    url: (body.url ?? null) as string | null,
    imageUrl: (body.imageUrl ?? null) as string | null,
    acquired: 0,
    sortOrder: (body.sortOrder ?? 0) as number,
    createdAt: now(),
  };
  db.insert(kitchenWishlist).values(item).run();
  return NextResponse.json(item, { status: 201 });
}
