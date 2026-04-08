import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { groceryItems } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: receiptId } = await params;
  const { items } = (await req.json()) as {
    items: Array<{ name: string; quantity: number | null; unit: string | null; price?: number | null; category: string }>;
  };

  const inserted = items.map((item) => ({
    id: newId(),
    receiptId,
    name: item.name,
    normalizedName: item.name,
    category: item.category ?? 'other',
    quantity: item.quantity ?? null,
    unit: item.unit ?? null,
    price: item.price ?? null,
    purchaseDate: now(),
    runningLow: 0 as const,
    createdAt: now(),
  }));

  if (inserted.length > 0) {
    db.insert(groceryItems).values(inserted).run();
  }

  return NextResponse.json({ saved: inserted.length });
}
