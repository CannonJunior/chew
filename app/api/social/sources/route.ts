import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { socialSources } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { desc } from 'drizzle-orm';

export async function GET() {
  const rows = db.select().from(socialSources).orderBy(desc(socialSources.createdAt)).all();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const source = {
    id: newId(),
    name: body.name as string,
    type: body.type as string,
    url: body.url as string,
    active: 1,
    lastFetched: null,
    createdAt: now(),
  };
  db.insert(socialSources).values(source).run();
  return NextResponse.json(source, { status: 201 });
}
