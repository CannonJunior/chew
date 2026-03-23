import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { socialSources, socialPosts } from '@/lib/db/schema';
import { newId } from '@/lib/utils/id';
import { now } from '@/lib/utils/time';
import { eq, inArray } from 'drizzle-orm';
import Parser from 'rss-parser';

const parser = new Parser({ timeout: 10000 });

export async function POST() {
  const sources = db.select().from(socialSources).where(eq(socialSources.active, 1)).all();

  // Fetch all RSS feeds in parallel
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);
      return { source, items: feed.items ?? [] };
    })
  );

  // Collect all candidate externalIds across all feeds
  type Candidate = {
    sourceId: string;
    externalId: string;
    title: string | null;
    description: string | null;
    url: string;
    imageUrl: string | null;
    author: string | null;
    publishedAt: number;
  };

  const ts = now();
  const candidates: Candidate[] = [];

  for (const result of results) {
    if (result.status === 'rejected') continue;
    const { source, items } = result.value;
    for (const item of items) {
      const externalId = item.guid ?? item.link ?? item.title ?? '';
      if (!externalId) continue;
      candidates.push({
        sourceId: source.id,
        externalId,
        title: item.title ?? null,
        description: item.contentSnippet ?? item.content ?? null,
        url: item.link ?? '',
        imageUrl: (item as Record<string, unknown>).enclosure
          ? ((item as Record<string, unknown>).enclosure as { url?: string }).url ?? null
          : null,
        author: item.creator ?? item.author ?? null,
        publishedAt: item.pubDate ? Math.floor(new Date(item.pubDate).getTime() / 1000) : ts,
      });
    }
  }

  if (candidates.length === 0) {
    return NextResponse.json({ added: 0 });
  }

  // Batch-fetch existing externalIds in one query
  const externalIds = candidates.map((c) => c.externalId);
  const existing = db
    .select({ externalId: socialPosts.externalId })
    .from(socialPosts)
    .where(inArray(socialPosts.externalId, externalIds))
    .all();
  const existingSet = new Set(existing.map((r) => r.externalId));

  // Insert only new posts
  const newPosts = candidates.filter((c) => !existingSet.has(c.externalId));
  if (newPosts.length > 0) {
    db.insert(socialPosts).values(
      newPosts.map((c) => ({
        id: newId(),
        sourceId: c.sourceId,
        externalId: c.externalId,
        title: c.title,
        description: c.description,
        url: c.url,
        imageUrl: c.imageUrl,
        author: c.author,
        publishedAt: c.publishedAt,
        fetchedAt: ts,
        tags: null,
        liked: 0,
        notes: null,
      }))
    ).run();
  }

  // Update lastFetched for all successfully fetched sources
  const fetchedSourceIds = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => (r as PromiseFulfilledResult<{ source: typeof sources[number] }>).value.source.id);

  if (fetchedSourceIds.length) {
    db.update(socialSources)
      .set({ lastFetched: ts })
      .where(inArray(socialSources.id, fetchedSourceIds))
      .run();
  }

  return NextResponse.json({ added: newPosts.length });
}
