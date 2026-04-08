#!/usr/bin/env tsx
/**
 * Second-pass vetting: try brand-only Wikipedia slugs and evaluate image URLs
 * by filename to filter out logos, unrelated photos, and non-product images.
 */

const UA = 'Chew Food Intelligence/1.0 (food app)';

async function wikiSummary(slug: string): Promise<{ title: string; url: string } | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      { headers: { 'User-Agent': UA } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    if (d.thumbnail?.source) {
      return {
        title: d.title,
        url: d.thumbnail.source.replace(/\/\d+px-/, '/900px-'),
      };
    }
    return null;
  } catch { return null; }
}

// Heuristic: reject URLs that are clearly not product photos
function isLikelyProductImage(url: string): boolean {
  const fname = url.toLowerCase().split('/').pop() ?? '';
  // Reject known bad patterns
  const BAD = [
    'logo', 'svg', 'flag', 'map', 'emblem', 'seal', 'coat',
    'rain', 'chapel', 'church', 'mercury', 'thermometer_glass',
    'good_food_display', // NCI food display
    'gathering', // cast iron gathering (not product shot)
    'revere_ware', // wrong brand
    'four_a_ceramique', // ceramic kiln
  ];
  if (BAD.some((b) => fname.includes(b))) return false;
  return true;
}

interface Candidate {
  name: string;
  brand: string;
  category: string;
  wikiSlugs: string[]; // Wikipedia article slugs to try, in order of confidence
}

const CANDIDATES: Candidate[] = [
  // Knives
  { name: 'Global G-2 Chef\'s Knife 8"',        brand: 'Global',       category: 'knives',    wikiSlugs: ['Global_knives', 'Global_knife'] },
  { name: 'Wüsthof Classic Ikon Chef\'s Knife',   brand: 'Wüsthof',      category: 'knives',    wikiSlugs: ['Wüsthof', 'Wusthof'] },
  { name: 'Shun Classic Chef\'s Knife 8"',         brand: 'Shun',         category: 'knives',    wikiSlugs: ['Shun_cutlery', 'Kai_Co.'] },
  { name: 'Chef\'s knife',                          brand: '',             category: 'knives',    wikiSlugs: ["Chef's_knife"] },
  { name: 'Yanagiba sashimi knife',                 brand: '',             category: 'knives',    wikiSlugs: ['Yanagi_ba'] },

  // Cookware
  { name: 'Le Creuset Round Dutch Oven 5.5qt',   brand: 'Le Creuset',   category: 'cookware',   wikiSlugs: ['Le_Creuset'] },
  { name: 'Staub Cocotte Round 5.5qt',           brand: 'Staub',        category: 'cookware',   wikiSlugs: ['Staub_(cookware)'] },
  { name: 'Lodge Cast Iron Skillet 12"',          brand: 'Lodge',        category: 'cookware',   wikiSlugs: ['Lodge_Manufacturing', 'Cast-iron_cookware'] },
  { name: 'Copper cookware',                       brand: 'Mauviel',      category: 'cookware',   wikiSlugs: ['Copper_cookware', 'Mauviel'] },
  { name: 'Cast iron cookware',                    brand: '',             category: 'cookware',   wikiSlugs: ['Cast-iron_cookware'] },
  { name: 'Carbon steel cookware',                 brand: '',             category: 'cookware',   wikiSlugs: ['Carbon_steel_cookware'] },
  { name: 'Dutch oven',                            brand: '',             category: 'cookware',   wikiSlugs: ['Dutch_oven'] },
  { name: 'Wok',                                   brand: '',             category: 'cookware',   wikiSlugs: ['Wok'] },
  { name: 'Pressure cooker',                       brand: '',             category: 'cookware',   wikiSlugs: ['Pressure_cooking', 'Pressure_cooker'] },

  // Appliances
  { name: 'KitchenAid Artisan Stand Mixer',       brand: 'KitchenAid',   category: 'appliance',  wikiSlugs: ['KitchenAid'] },
  { name: 'Vitamix 5200 Blender',                 brand: 'Vitamix',      category: 'appliance',  wikiSlugs: ['Vitamix'] },
  { name: 'Instant Pot Duo 7-in-1 6qt',           brand: 'Instant Pot',  category: 'appliance',  wikiSlugs: ['Instant_Pot'] },
  { name: 'Food processor',                        brand: 'Cuisinart',    category: 'appliance',  wikiSlugs: ['Food_processor', 'Cuisinart'] },
  { name: 'Immersion blender',                     brand: '',             category: 'appliance',  wikiSlugs: ['Immersion_blender', 'Hand_blender'] },
  { name: 'Electric kettle',                       brand: 'Fellow',       category: 'appliance',  wikiSlugs: ['Electric_kettle'] },
  { name: 'Espresso machine',                      brand: 'Breville',     category: 'appliance',  wikiSlugs: ['Espresso_machine'] },
  { name: 'Rice cooker',                           brand: 'Zojirushi',    category: 'appliance',  wikiSlugs: ['Rice_cooker', 'Zojirushi'] },
  { name: 'Pizza oven',                            brand: 'Ooni',         category: 'appliance',  wikiSlugs: ['Pizza_oven'] },
  { name: 'Toaster oven',                          brand: 'Breville',     category: 'appliance',  wikiSlugs: ['Toaster_oven'] },

  // Tools
  { name: 'Mortar and pestle',                     brand: '',             category: 'tool',       wikiSlugs: ['Mortar_and_pestle'] },
  { name: 'Mandoline slicer',                      brand: 'Benriner',     category: 'tool',       wikiSlugs: ['Mandoline'] },
  { name: 'Microplane grater',                     brand: 'Microplane',   category: 'tool',       wikiSlugs: ['Microplane'] },
  { name: 'Kitchen scale',                         brand: '',             category: 'tool',       wikiSlugs: ['Kitchen_scale', 'Weighing_scale'] },
  { name: 'Meat thermometer',                      brand: 'ThermoWorks',  category: 'tool',       wikiSlugs: ['Meat_thermometer'] },
  { name: 'Butcher block cutting board',           brand: 'John Boos',    category: 'tool',       wikiSlugs: ['Cutting_board', 'Butcher_block'] },
  { name: 'Pasta machine',                         brand: 'Marcato',      category: 'tool',       wikiSlugs: ['Pasta_machine', 'Marcato'] },

  // Modernist
  { name: 'Sous vide cooker',                      brand: 'Anova',        category: 'modernist',  wikiSlugs: ['Sous_vide', 'Immersion_circulator'] },
  { name: 'Whipped cream dispenser',               brand: 'iSi',          category: 'modernist',  wikiSlugs: ['Whipped-cream_charger', 'Cream_whipper'] },
  { name: 'Food dehydrator',                       brand: 'Excalibur',    category: 'modernist',  wikiSlugs: ['Food_dehydrator'] },
];

async function main() {
  console.log(`Testing ${CANDIDATES.length} candidates...\n`);

  const results: Array<{
    name: string; brand: string; category: string;
    url: string | null; slug: string | null; pass: boolean;
  }> = [];

  for (const c of CANDIDATES) {
    let found: { title: string; url: string } | null = null;
    let usedSlug = '';
    for (const slug of c.wikiSlugs) {
      const r = await wikiSummary(slug);
      if (r) { found = r; usedSlug = slug; break; }
      await new Promise((res) => setTimeout(res, 100));
    }
    const url = found?.url ?? null;
    const pass = url !== null && isLikelyProductImage(url);
    results.push({ name: c.name, brand: c.brand, category: c.category, url, slug: usedSlug || null, pass });

    const icon = pass ? '✅' : (url ? '⚠️ ' : '❌');
    console.log(`${icon} [${c.category}] ${c.brand ? c.brand + ' — ' : ''}${c.name}`);
    if (url) {
      const fname = url.split('/').pop()?.slice(0, 80) ?? '';
      console.log(`   wiki:${usedSlug}  file:${fname}`);
    }
    await new Promise((res) => setTimeout(res, 150));
  }

  console.log('\n── PASSED (good product image via Wikipedia) ─────────────────');
  results.filter((r) => r.pass).forEach((r) =>
    console.log(`  ✅ [${r.category}] ${r.brand ? r.brand + ' — ' : ''}${r.name}`)
  );

  console.log('\n── WARNING (image exists but suspicious filename) ─────────────');
  results.filter((r) => r.url && !r.pass).forEach((r) =>
    console.log(`  ⚠️  [${r.category}] ${r.brand ? r.brand + ' — ' : ''}${r.name}  → ${r.url?.split('/').pop()?.slice(0, 80)}`)
  );

  console.log('\n── NO IMAGE ───────────────────────────────────────────────────');
  results.filter((r) => !r.url).forEach((r) =>
    console.log(`  ❌ [${r.category}] ${r.brand ? r.brand + ' — ' : ''}${r.name}`)
  );
}

main().catch(console.error);
