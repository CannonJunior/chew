import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { socialPosts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = db.select().from(socialPosts).where(eq(socialPosts.id, id)).get();
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const newLiked = post.liked === 1 ? 0 : 1;
  db.update(socialPosts).set({ liked: newLiked }).where(eq(socialPosts.id, id)).run();
  return NextResponse.json({ liked: newLiked });
}
