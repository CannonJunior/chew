import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { wikiIngredients } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { like, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  const rows = q
    ? db.select().from(wikiIngredients).where(like(wikiIngredients.name, `%${q}%`)).limit(200).all()
    : db.select().from(wikiIngredients).orderBy(desc(wikiIngredients.createdAt)).all();

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ts = now();
  const ingredient = {
    id: newId(),
    name: body.name as string,
    aliases: body.aliases ? JSON.stringify(body.aliases) : null,
    description: (body.description ?? null) as string | null,
    category: (body.category ?? null) as string | null,
    subcategory: (body.subcategory ?? null) as string | null,
    origin: (body.origin ?? null) as string | null,
    seasons: body.seasons ? JSON.stringify(body.seasons) : null,
    flavorProfile: body.flavorProfile ? JSON.stringify(body.flavorProfile) : null,
    imageUrl: (body.imageUrl ?? null) as string | null,
    usdaFdcId: (body.usdaFdcId ?? null) as string | null,
    flavorGraphId: (body.flavorGraphId ?? null) as string | null,
    createdAt: ts,
    updatedAt: ts,
  };
  db.insert(wikiIngredients).values(ingredient).run();
  return NextResponse.json(ingredient, { status: 201 });
}
