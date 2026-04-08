#!/usr/bin/env tsx
/**
 * Vets candidate wishlist items against the actual Wikipedia/Commons image
 * APIs used by the app. Prints the first resolved image URL for each so we
 * can decide which items have compelling, specific imagery worth including.
 */

const UA = 'Chew Food Intelligence/1.0 (food app)';

async function searchCommons(query: string): Promise<string[]> {
  try {
    const params = new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrsearch: query,
      gsrnamespace: '6',
      gsrlimit: '8',
      prop: 'imageinfo',
      iiprop: 'url|mime',
      iiurlwidth: '900',
      format: 'json',
      origin: '*',
    });
    const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { 'User-Agent': UA } });
    if (!res.ok) return [];
    const data = await res.json();
    const pages = Object.values(data.query?.pages ?? {}) as Array<{ imageinfo?: Array<{ thumburl?: string; url?: string; mime?: string; title?: string }> }>;
    return pages
      .flatMap((p) => p.imageinfo ?? [])
      .filter((ii) => ii.mime?.startsWith('image/') && (ii.thumburl ?? ii.url))
      .map((ii) => (ii.thumburl ?? ii.url) as string)
      .filter((u) => /\.(jpe?g|png|webp)/i.test(u))
      .slice(0, 4);
  } catch { return []; }
}

async function searchWikipedia(query: string): Promise<string | null> {
  const headers = { 'User-Agent': UA };
  try {
    const slug = encodeURIComponent(query.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data.thumbnail?.source) return data.thumbnail.source.replace(/\/\d+px-/, '/900px-');
    }
  } catch { /* ignore */ }
  try {
    const res = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srprop=&srlimit=1&srnamespace=0`,
      { headers }
    );
    if (res.ok) {
      const data = await res.json();
      const title: string | undefined = data.query?.search?.[0]?.title;
      if (title) {
        const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, { headers });
        if (r.ok) {
          const d = await r.json();
          if (d.thumbnail?.source) return d.thumbnail.source.replace(/\/\d+px-/, '/900px-');
        }
      }
    }
  } catch { /* ignore */ }
  return null;
}

function searchVariants(query: string): string[] {
  const terms: string[] = [query];
  const words = query.split(/\s+/);
  if (words.length > 3) terms.push(words.slice(-3).join(' '));
  if (words.length > 2) terms.push(words.slice(-2).join(' '));
  if (words.length > 1) terms.push(words[words.length - 1]);
  return [...new Set(terms)].filter(Boolean);
}

async function vetItem(name: string, brand: string): Promise<{ url: string | null; query: string }> {
  const q = [brand, name].filter(Boolean).join(' ');
  const variants = searchVariants(q);
  for (const term of variants) {
    const [commons, wiki] = await Promise.all([
      searchCommons(`${term} kitchen`),
      searchWikipedia(term),
    ]);
    const all = [...commons, ...(wiki ? [wiki] : [])];
    if (all.length > 0) return { url: all[0], query: term };
  }
  return { url: null, query: q };
}

// ── Candidate items ───────────────────────────────────────────────────────────
const CANDIDATES: Array<{ name: string; brand: string; category: string }> = [
  // Knives
  { name: 'Global G-2 Chef\'s Knife 8"', brand: 'Global', category: 'knives' },
  { name: 'Wüsthof Classic 8" Chef\'s Knife', brand: 'Wüsthof', category: 'knives' },
  { name: 'MAC Professional MTH-80 Chef\'s Knife', brand: 'MAC Knife', category: 'knives' },
  { name: 'Victorinox Fibrox Pro Chef\'s Knife 8"', brand: 'Victorinox', category: 'knives' },
  { name: 'Shun Classic 8" Chef\'s Knife', brand: 'Shun', category: 'knives' },
  { name: 'Henckels Professional S 8" Chef\'s Knife', brand: 'Henckels', category: 'knives' },

  // Cookware
  { name: 'Le Creuset Round Dutch Oven 5.5qt', brand: 'Le Creuset', category: 'cookware' },
  { name: 'Staub Cocotte Round 5.5qt', brand: 'Staub', category: 'cookware' },
  { name: 'Lodge Cast Iron Skillet 12"', brand: 'Lodge', category: 'cookware' },
  { name: 'All-Clad D3 Stainless 12" Fry Pan', brand: 'All-Clad', category: 'cookware' },
  { name: 'Mauviel M\'150c Copper Saucepan', brand: 'Mauviel', category: 'cookware' },
  { name: 'De Buyer Mineral B Carbon Steel Fry Pan', brand: 'De Buyer', category: 'cookware' },
  { name: 'Demeyere Proline Skillet 11"', brand: 'Demeyere', category: 'cookware' },
  { name: 'Smithey Ironware Cast Iron Skillet 12"', brand: 'Smithey', category: 'cookware' },

  // Appliances
  { name: 'KitchenAid Artisan Stand Mixer 5qt', brand: 'KitchenAid', category: 'appliance' },
  { name: 'Vitamix 5200 Blender', brand: 'Vitamix', category: 'appliance' },
  { name: 'Cuisinart DFP-14BCWB Food Processor 14-Cup', brand: 'Cuisinart', category: 'appliance' },
  { name: 'Instant Pot Duo 7-in-1 6qt', brand: 'Instant Pot', category: 'appliance' },
  { name: 'Breville Smart Oven Air Fryer Pro', brand: 'Breville', category: 'appliance' },
  { name: 'Zojirushi NS-ZCC10 Rice Cooker', brand: 'Zojirushi', category: 'appliance' },
  { name: 'Ankarsrum Original Stand Mixer', brand: 'Ankarsrum', category: 'appliance' },
  { name: 'KitchenAid Professional 600 Stand Mixer', brand: 'KitchenAid', category: 'appliance' },
  { name: 'Ooni Koda 16 Gas Pizza Oven', brand: 'Ooni', category: 'appliance' },

  // Tools
  { name: 'Thermapen ONE Instant-Read Thermometer', brand: 'ThermoWorks', category: 'tool' },
  { name: 'Microplane Premium Classic Zester Grater', brand: 'Microplane', category: 'tool' },
  { name: 'Benriner Japanese Mandoline Slicer', brand: 'Benriner', category: 'tool' },
  { name: 'OXO Good Grips Kitchen Scale', brand: 'OXO', category: 'tool' },
  { name: 'John Boos Maple End-Grain Butcher Block', brand: 'John Boos', category: 'tool' },
  { name: 'Spider Web Skimmer', brand: 'generic', category: 'tool' },

  // Modernist
  { name: 'PolyScience Sous Vide Professional Circulator', brand: 'PolyScience', category: 'modernist' },
  { name: 'Anova Precision Cooker', brand: 'Anova', category: 'modernist' },
  { name: 'iSi Gourmet Whip Cream Whipper', brand: 'iSi', category: 'modernist' },
  { name: 'PolyScience Smoking Gun', brand: 'PolyScience', category: 'modernist' },
  { name: 'VacMaster Chamber Vacuum Sealer', brand: 'VacMaster', category: 'modernist' },

  // Bakeware
  { name: 'Nordic Ware Natural Aluminum Half Sheet Pan', brand: 'Nordic Ware', category: 'bakeware' },
  { name: 'USA Pan Aluminized Steel Loaf Pan', brand: 'USA Pan', category: 'bakeware' },
  { name: 'Emile Henry Bread Loaf Baker', brand: 'Emile Henry', category: 'bakeware' },
];

async function main() {
  console.log(`Vetting ${CANDIDATES.length} candidates...\n`);

  const BATCH = 5;
  const results: Array<{ name: string; brand: string; category: string; url: string | null; query: string }> = [];

  for (let i = 0; i < CANDIDATES.length; i += BATCH) {
    const batch = CANDIDATES.slice(i, i + BATCH);
    const batchResults = await Promise.all(
      batch.map(async (c) => {
        const { url, query } = await vetItem(c.name, c.brand);
        return { ...c, url, query };
      })
    );
    results.push(...batchResults);
    for (const r of batchResults) {
      const status = r.url ? '✅' : '❌';
      console.log(`${status} [${r.category}] ${r.name}`);
      if (r.url) console.log(`   → ${r.url.slice(0, 120)}`);
    }
    if (i + BATCH < CANDIDATES.length) await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\n── Summary ──────────────────────────────────────────────────────');
  const hits = results.filter((r) => r.url);
  const misses = results.filter((r) => !r.url);
  console.log(`Has image: ${hits.length}/${results.length}`);
  console.log('\nGOOD CANDIDATES:');
  hits.forEach((r) => console.log(`  • [${r.category}] ${r.name}`));
  console.log('\nNO IMAGE:');
  misses.forEach((r) => console.log(`  • [${r.category}] ${r.name}`));
}

main().catch(console.error);
