import { NextRequest, NextResponse } from 'next/server';

const UA = 'Chew Food Intelligence/1.0 (food app)';

// Process-level cache: avoids re-fetching the same query during a session
const imageCache = new Map<string, string[]>();

async function searchCommons(query: string, limit = 8): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: query,
      gsrnamespace: '6',
      gsrlimit: String(limit),
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '900',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { 'User-Agent': UA },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = Object.values(data.query?.pages ?? {}) as Array<{
      imageinfo?: Array<{ thumburl?: string; url?: string; mime?: string }>;
    }>;
    return pages
      .flatMap((p) => p.imageinfo ?? [])
      .filter((ii) => ii.mime?.startsWith('image/') && (ii.thumburl ?? ii.url))
      .map((ii) => (ii.thumburl ?? ii.url) as string)
      .filter((u) => /\.(jpe?g|png|webp)/i.test(u))
      .slice(0, limit);
  } catch {
    return [];
  }
}

async function searchWikipedia(query: string): Promise<string[]> {
  const headers = { 'User-Agent': UA };
  for (const attempt of [query, query.replace(/\s+with\s+.*$/i, '').trim()]) {
    try {
      const slug = encodeURIComponent(attempt.replace(/ /g, '_'));
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.thumbnail?.source) {
          return [data.thumbnail.source.replace(/\/\d+px-/, '/900px-')];
        }
      }
    } catch { /* continue */ }
  }
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srprop=&srlimit=1&srnamespace=0`,
      { headers }
    );
    if (res.ok) {
      const data = await res.json();
      const title: string | undefined = data.query?.search?.[0]?.title;
      if (title) {
        const r = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`,
          { headers }
        );
        if (r.ok) {
          const d = await r.json();
          if (d.thumbnail?.source) return [d.thumbnail.source.replace(/\/\d+px-/, '/900px-')];
        }
      }
    }
  } catch { /* ignore */ }
  return [];
}

// Produce progressively simpler search terms from a kitchen item name
function searchVariants(query: string): string[] {
  const terms: string[] = [query];
  const words = query.split(/\s+/);
  // First word alone (brand name — often a direct Wikipedia slug, e.g. "Le_Creuset", "KitchenAid")
  if (words.length > 1) terms.push(words[0]);
  // First two words (brand + model, e.g. "Instant Pot", "Le Creuset")
  if (words.length > 2) terms.push(words.slice(0, 2).join(' '));
  // Last 3 words (often the core item type e.g. "Carbon Steel Pan")
  if (words.length > 3) terms.push(words.slice(-3).join(' '));
  // Last 2 words
  if (words.length > 2) terms.push(words.slice(-2).join(' '));
  // Last single word (item type: Pan, Blender, Knife…)
  if (words.length > 1) terms.push(words[words.length - 1]);
  return [...new Set(terms)].filter(Boolean);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ images: [] });

  const cached = imageCache.get(q);
  if (cached) {
    return NextResponse.json(
      { images: cached },
      { headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } }
    );
  }

  const variants = searchVariants(q);
  const seen = new Set<string>();
  const images: string[] = [];

  const results = await Promise.all(
    variants.map((term) =>
      Promise.all([
        searchCommons(`${term} kitchen`, 6),
        searchWikipedia(term),
      ])
    )
  );

  for (const [commons, wiki] of results) {
    for (const url of [...commons, ...wiki]) {
      if (!seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }
  }

  const sliced = images.slice(0, 8);
  if (sliced.length > 0) imageCache.set(q, sliced);

  return NextResponse.json(
    { images: sliced },
    { headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } }
  );
}
