#!/usr/bin/env tsx
/**
 * Clears the wish list and seeds a curated set of aspirational kitchen items.
 * Fetches one Wikipedia thumbnail per item at seed time so images are stored
 * directly in image_url — no runtime image search needed.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { ulid } from 'ulid';

const DB_PATH = path.join(process.cwd(), 'chew.db');
const db = new Database(DB_PATH);
const now = () => Math.floor(Date.now() / 1000);
const UA = 'Chew/1.0 (kitchen wishlist seed)';

type Item = {
  name: string;
  brand: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimatedPrice: number | null;
  notes: string;
  url: string | null;
  /** Wikipedia article title to pull the thumbnail from */
  wikiTitle: string;
  sortOrder: number;
};

const ITEMS: Item[] = [
  // ── Knives ────────────────────────────────────────────────────────────────
  {
    name: 'Misono UX10 Gyuto 240mm',
    brand: 'Misono',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 285,
    notes: 'The most trusted high-performance knife in Western professional kitchens. Swedish Sandvik 19C27 steel, laser-thin profile, bolster shaped for a full pinch grip. Runs through 12-hour service without degradation. The DIN-stamped serial number on every blade reflects factory pride.',
    url: 'https://www.japanesechefsknife.com/products/misono-ux10',
    wikiTitle: 'Chef\'s knife',
    sortOrder: 10,
  },
  {
    name: 'Shun Classic 8" Chef\'s Knife',
    brand: 'Shun',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 185,
    notes: '68-layer Damascus cladding over VG-MAX steel core, 16° edge angle. The D-shaped Pakkawood handle fits the right hand precisely and the blade geometry handles both push-cuts and draw-cuts equally well. One of the few Japanese knives that immediately makes sense to a cook trained on European blades.',
    url: 'https://www.shuncutlery.com/products/classic-8-chefs-knife',
    wikiTitle: 'Damascus steel',
    sortOrder: 11,
  },
  {
    name: 'MAC MTH-80 Professional 8" Chef\'s Knife with Dimples',
    brand: 'MAC Knife',
    category: 'knives',
    priority: 'medium',
    estimatedPrice: 175,
    notes: 'The knife recommended most consistently by Cook\'s Illustrated and the New York Times Wirecutter since 2013. High-carbon Japanese steel, 25% thinner than German equivalents, dimples that reduce food adhesion. Outstanding out-of-box sharpness and accessible enough for everyday home use.',
    url: 'https://www.macknife.com/products/mth-80',
    wikiTitle: 'Japanese kitchen knife',
    sortOrder: 12,
  },

  // ── Cookware ──────────────────────────────────────────────────────────────
  {
    name: 'Mauviel M\'250c Copper Saucier 2.1qt',
    brand: 'Mauviel',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 375,
    notes: 'No kitchen object performs like 2.5mm copper. Thermal response outpaces stainless-clad by a factor of five — caramel, beurre blanc, and curd work happens in real time. Tin-lined interior, cast-iron handle. The saucier curve lets a whisk reach every square centimeter. Mauviel has supplied French professional kitchens since 1830.',
    url: 'https://www.mauviel.com',
    wikiTitle: 'Saucepan',
    sortOrder: 20,
  },
  {
    name: 'Smithey Ironware No. 12 Cast Iron Skillet',
    brand: 'Smithey Ironware',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 225,
    notes: 'Charleston-made with a CNC-machined interior smoother than any vintage Griswold straight from the foundry. The helper handle, curved lip, and polished surface look like industrial sculpture. 20% lighter than Lodge at the same diameter. The seasoning takes in 30 minutes and stays.',
    url: 'https://smithey.com/products/no-12-cast-iron-skillet',
    wikiTitle: 'Cast-iron cookware',
    sortOrder: 21,
  },
  {
    name: 'Staub Cocotte Round 5.5qt',
    brand: 'Staub',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 380,
    notes: 'The self-basting lid returns condensate uniformly over the entire surface via interior spikes — a design advantage over Le Creuset. The black matte enamel interior develops seasoning over time. Braised short ribs in a Staub are objectively a different dish.',
    url: 'https://www.staub-online.com',
    wikiTitle: 'Staub (cookware)',
    sortOrder: 22,
  },
  {
    name: 'Le Creuset Signature Braiser 3.5qt',
    brand: 'Le Creuset',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 330,
    notes: 'Wide, shallow form factor is the right vessel for chicken thighs, short ribs, and any braise where browning matters before braising. The domed lid catches steam efficiently. Le Creuset enamel is the benchmark every competitor is measured against.',
    url: 'https://www.lecreuset.com',
    wikiTitle: 'Le Creuset',
    sortOrder: 23,
  },

  // ── Appliances ────────────────────────────────────────────────────────────
  {
    name: 'Ankarsrum Original Stand Mixer',
    brand: 'Ankarsrum',
    category: 'appliance',
    priority: 'high',
    estimatedPrice: 750,
    notes: 'Sweden has been manufacturing this exact machine since 1940. The roller-and-hook design mimics hand-kneading by working dough against the bowl wall rather than pulling from the center. Professional bakers consistently rate Ankarsrum bread above KitchenAid at any hydration. 600W direct-drive motor handles 5 pounds of dough without complaint.',
    url: 'https://www.ankarsrum.com/us/ankarsrum-original/',
    wikiTitle: 'Stand mixer',
    sortOrder: 40,
  },
  {
    name: 'Breville Barista Express Impress',
    brand: 'Breville',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 900,
    notes: 'The guided tamping system applies consistent 30 lb pressure every pull, eliminating the variable that ruins 80% of home espresso. The integrated conical burr grinder pulls from bean to cup in under a minute. Brushed stainless exterior photographs well and ages well.',
    url: 'https://www.breville.com/us/en/products/espresso/bes876.html',
    wikiTitle: 'Espresso machine',
    sortOrder: 41,
  },
  {
    name: 'Zojirushi Neuro Fuzzy Rice Cooker 5.5 Cup',
    brand: 'Zojirushi',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 185,
    notes: 'Fuzzy logic adjusts cook time and temperature based on how the rice behaves during the cycle — not a preset timer. The result is rice that professional Japanese restaurants stake their reputation on, reproducible at home. The rounded white body has been an icon of Japanese kitchen design for 30 years.',
    url: 'https://www.zojirushi.com/app/product/nszcc',
    wikiTitle: 'Zojirushi Corporation',
    sortOrder: 42,
  },
  {
    name: 'Ooni Karu 16 Multi-Fuel Pizza Oven',
    brand: 'Ooni',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 799,
    notes: 'Reaches 950°F on wood or gas in 15 minutes — the floor temperature of a Neapolitan wood-burning oven. The 16-inch cooking surface handles large pies and whole fish. The viewable flame and thermometer make it as theatrical as it is functional.',
    url: 'https://ooni.com/products/ooni-karu-16',
    wikiTitle: 'Wood-fired oven',
    sortOrder: 43,
  },

  // ── Tools ─────────────────────────────────────────────────────────────────
  {
    name: 'Thermapen ONE Instant-Read Thermometer',
    brand: 'ThermoWorks',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 105,
    notes: '1-second response time, ±0.5°F accuracy. The most trusted thermometer in professional cooking — Heston Blumenthal\'s team, the US military food safety program, and every serious competition BBQ circuit rely on ThermoWorks. No other consumer thermometer is within two seconds of this response time.',
    url: 'https://www.thermoworks.com/thermapen-one/',
    wikiTitle: 'Meat thermometer',
    sortOrder: 50,
  },
  {
    name: 'John Boos End-Grain Maple Chopping Block 24×18"',
    brand: 'John Boos',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 280,
    notes: 'End-grain maple is self-healing: knife marks close back up with wood expansion and contraction. Boos supplies butcher blocks to The French Laundry, Alinea, and the majority of Relais & Châteaux properties in North America. Oiled monthly, this board outlasts careers.',
    url: 'https://www.johnboos.com',
    wikiTitle: 'Butcher block',
    sortOrder: 51,
  },
  {
    name: 'Microplane Premium Classic Zester',
    brand: 'Microplane',
    category: 'tool',
    priority: 'low',
    estimatedPrice: 15,
    notes: 'Photo-etched stainless steel teeth that are sharper than any stamped grater at any price. Used by Thomas Keller, Gordon Ramsay, and essentially every professional pastry kitchen. Transforms citrus zest from a chore into a precise technique.',
    url: 'https://us.microplane.com/products/premium-classic-zester-grater',
    wikiTitle: 'Microplane',
    sortOrder: 52,
  },

  // ── Modernist ─────────────────────────────────────────────────────────────
  {
    name: 'Anova Precision Cooker Pro (WiFi)',
    brand: 'Anova',
    category: 'modernist',
    priority: 'high',
    estimatedPrice: 199,
    notes: '1200W, ±0.1°C precision across a 40-liter vessel — sufficient for a whole short rib braise in full service. WiFi connectivity enables scheduled cooks. The most reliable consumer circulator at this price point.',
    url: 'https://anovaculinary.com/products/anova-precision-cooker-pro',
    wikiTitle: 'Sous vide',
    sortOrder: 60,
  },
  {
    name: 'iSi Professional Cream Whipper 1L',
    brand: 'iSi',
    category: 'modernist',
    priority: 'medium',
    estimatedPrice: 115,
    notes: 'The vessel Ferran Adrià used to create the espuma revolution. Charged with N₂O, it aerates any liquid — stocks, oils, creams, fruit purées — into a stable foam that holds for service. Austrian-made aluminum body withstands repeated pressure cycles unlike cheaper imitators.',
    url: 'https://www.isi.com/en/culinary/products/professional-whipper',
    wikiTitle: 'Whipped-cream charger',
    sortOrder: 61,
  },
];

async function fetchWikiImage(title: string): Promise<string | null> {
  try {
    const slug = encodeURIComponent(title.replace(/ /g, '_'));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`,
      { headers: { 'User-Agent': UA } }
    );
    if (!res.ok) return null;
    const data = await res.json() as { thumbnail?: { source: string } };
    if (data.thumbnail?.source) {
      return data.thumbnail.source.replace(/\/\d+px-/, '/800px-');
    }
  } catch { /* ignore */ }
  return null;
}

async function main() {
  db.prepare('DELETE FROM kitchen_wishlist').run();
  console.log('Cleared existing wish list.\n');

  const insert = db.prepare(`
    INSERT INTO kitchen_wishlist
      (id, name, brand, category, priority, estimated_price, notes, url, image_url, acquired, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);

  let seeded = 0;
  for (const item of ITEMS) {
    process.stdout.write(`  Fetching image for: ${item.name} ... `);
    const imageUrl = await fetchWikiImage(item.wikiTitle);
    console.log(imageUrl ? 'OK' : 'no image');

    insert.run(
      ulid(),
      item.name,
      item.brand,
      item.category,
      item.priority,
      item.estimatedPrice,
      item.notes,
      item.url,
      imageUrl,
      item.sortOrder,
      now(),
    );
    seeded++;
  }

  console.log(`\nDone — ${seeded} items seeded.`);
}

main().catch(console.error);
