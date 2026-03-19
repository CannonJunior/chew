import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { kitchenEquipment } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { desc } from 'drizzle-orm';

export async function GET() {
  const rows = db.select().from(kitchenEquipment).orderBy(desc(kitchenEquipment.createdAt)).all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const item = {
    id: newId(),
    name: body.name as string,
    brand: (body.brand ?? null) as string | null,
    model: (body.model ?? null) as string | null,
    category: (body.category ?? 'other') as string,
    subcategory: (body.subcategory ?? null) as string | null,
    condition: (body.condition ?? 'good') as string,
    notes: (body.notes ?? null) as string | null,
    imagePath: (body.imagePath ?? null) as string | null,
    purchasedDate: (body.purchasedDate ?? null) as number | null,
    createdAt: now(),
  };
  db.insert(kitchenEquipment).values(item).run();
  return NextResponse.json(item, { status: 201 });
}
