import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { recipeMedia } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

const UA = 'Chew Food Intelligence/1.0 (food app)';

// Wikimedia Commons file search → returns up to `limit` thumbnail URLs
async function searchCommons(query: string, limit = 8, offset = 0): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: query,
      gsrnamespace: '6', // File: namespace
      gsrlimit: String(limit),
      ...(offset > 0 ? { gsroffset: String(offset) } : {}),
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

// TheMealDB — good food photography for mainstream dishes
async function searchMealDB(query: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.meals ?? []) as Array<{ strMealThumb: string }>)
      .map((m) => m.strMealThumb)
      .filter(Boolean)
      .slice(0, 3);
  } catch {
    return [];
  }
}

// Wikipedia page summary thumbnail
async function searchWikipedia(query: string): Promise<string[]> {
  const headers = { 'User-Agent': UA };
  // Try direct slug lookup
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
  // Fall back to search API
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

// Curated aliases for titles that are too obscure for algorithmic search
const ALIASES: Record<string, string[]> = {
  'Black Truffle Soup VGE': ['Truffle Soup', 'Vichyssoise'],
  'Oaxacan Black Mole with Chicken': ['Mole negro', 'Mole sauce'],
  'Roast Bone Marrow with Parsley Salad': ['Bone marrow food', 'Marrow bone'],
  'Ispahan Macaron': ['Macaron', 'French macaron'],
  'Chiles en Nogada': ['Chile en nogada'],
  'Roasted Cauliflower with Pomegranate and Pistachios': ['Roasted cauliflower', 'Cauliflower dish'],
  'Pasta e Fagioli': ['Pasta e fagioli', 'Bean pasta soup'],
  'Fried Yardbird': ['Fried chicken', 'Southern fried chicken'],
  'Momofuku Pork Buns': ['Gua bao', 'Pork bun'],
  'Spago Smoked Salmon Pizza': ['Smoked salmon pizza', 'Salmon pizza'],
  'DB Burger': ['Gourmet hamburger', 'Hamburger'],
  'World Peace Cookies': ['Chocolate shortbread', 'Chocolate cookies'],
  'Kogi Korean BBQ Short Rib Tacos': ['Korean taco', 'Korean BBQ'],
  'Nitro-Scrambled Egg and Bacon Ice Cream': ['Molecular gastronomy dessert', 'Liquid nitrogen ice cream'],
  'Olive Oil Spheres': ['Molecular gastronomy', 'Food spherification'],
  'Next-Level Steak Sandwich': ['Steak sandwich'],
  "Dragon's Breath Chili": ['Chili con carne', 'Bowl of chili'],
};

// Produce progressively simpler search terms from a recipe title
function searchVariants(title: string): string[] {
  const terms: string[] = [title];
  // Inject curated aliases first
  if (ALIASES[title]) terms.push(...ALIASES[title]);
  // Strip chef-style prefixes and filler
  const stripped = title
    .replace(/^(next-level|nitro-scrambled|oops!?\s*i\s+dropped\s+the)\s+/i, '')
    .replace(/\s+with\s+.+$/i, '')
    .replace(/\s+\(.*?\)$/i, '')
    .replace(/^.*?'s\s+/i, '') // strip "Maman's ", "Hazan's ", etc.
    .trim();
  if (stripped && stripped !== title) terms.push(stripped);
  const words = stripped.split(/\s+/);
  // Last 2 words (core dish phrase)
  if (words.length > 2) terms.push(words.slice(-2).join(' '));
  // Last single word (dish type: Shawarma, Soufflé, Risotto…)
  if (words.length > 1) terms.push(words[words.length - 1]);
  return [...new Set(terms)].filter(Boolean);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ images: [] });

  const recipeId = req.nextUrl.searchParams.get('id');
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0', 10) || 0;

  // Serve stored recipe_media images first (only on non-refresh requests)
  if (recipeId && offset === 0) {
    const stored = db
      .select({ url: recipeMedia.urlOrPath })
      .from(recipeMedia)
      .where(and(eq(recipeMedia.recipeId, recipeId), eq(recipeMedia.type, 'image')))
      .all();
    if (stored.length > 0) {
      return NextResponse.json(
        { images: stored.map((r) => r.url) },
        { headers: { 'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800' } }
      );
    }
  }

  const variants = searchVariants(q);
  const seen = new Set<string>();
  const images: string[] = [];

  // Run all variants in parallel; each variant searches Commons + MealDB + Wikipedia in parallel
  const results = await Promise.all(
    variants.map((term) =>
      Promise.all([
        searchCommons(`${term} food dish`, 6, offset),
        searchMealDB(term),
        searchWikipedia(term),
      ])
    )
  );

  for (const [commons, mealdb, wiki] of results) {
    for (const url of [...mealdb, ...commons, ...wiki]) {
      if (!seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    }
  }

  const cacheControl = offset > 0
    ? 'no-store'
    : 'public, max-age=86400, stale-while-revalidate=604800';

  return NextResponse.json(
    { images: images.slice(0, 8) },
    { headers: { 'Cache-Control': cacheControl } }
  );
}
