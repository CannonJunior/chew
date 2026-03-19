import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { socialPosts } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const liked = searchParams.get('liked');

  const rows = liked === '1'
    ? db.select().from(socialPosts).where(eq(socialPosts.liked, 1)).orderBy(desc(socialPosts.publishedAt)).all()
    : db.select().from(socialPosts).orderBy(desc(socialPosts.publishedAt)).limit(100).all();

  return NextResponse.json(rows);
}
