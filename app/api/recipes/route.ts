import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { recipes } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { desc, like } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  const rows = q
    ? db.select().from(recipes).where(like(recipes.title, `%${q}%`)).orderBy(desc(recipes.createdAt)).all()
    : db.select().from(recipes).orderBy(desc(recipes.createdAt)).all();

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ts = now();
  const recipe = {
    id: newId(),
    title: body.title as string,
    description: (body.description ?? null) as string | null,
    cuisine: (body.cuisine ?? null) as string | null,
    difficulty: (body.difficulty ?? 'medium') as string,
    prepTimeMin: (body.prepTimeMin ?? null) as number | null,
    cookTimeMin: (body.cookTimeMin ?? null) as number | null,
    servings: (body.servings ?? 4) as number,
    tags: body.tags ? JSON.stringify(body.tags) : null,
    sourceUrl: (body.sourceUrl ?? null) as string | null,
    createdAt: ts,
    updatedAt: ts,
  };
  db.insert(recipes).values(recipe).run();
  return NextResponse.json(recipe, { status: 201 });
}
