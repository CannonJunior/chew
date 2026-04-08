#!/usr/bin/env tsx
/**
 * Clears the wish list and seeds a tight, opinionated set of 16 items —
 * chosen for visual impact, professional pedigree, and photogenic imagery.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { ulid } from 'ulid';

const DB_PATH = path.join(process.cwd(), 'chew.db');
const db = new Database(DB_PATH);
const now = () => Math.floor(Date.now() / 1000);

type Item = {
  name: string;
  brand: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  estimatedPrice: number | null;
  notes: string;
  url: string | null;
  sortOrder: number;
};

const ITEMS: Item[] = [
  // ── Knives ───────────────────────────────────────────────────────────────
  {
    name: 'Yu Kurosaki Fujin SG2 Gyuto 210mm',
    brand: 'Yu Kurosaki',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 340,
    notes: 'Kurosaki\'s "Fujin" pattern — named after the Shinto god of wind — is one of the most photographed knife finishes in the world. Each blade is hand-hammered into a cloud-like tsuchime texture over SG2 powder steel, a 63-HRC core that takes a 10° edge and holds it through weeks of professional service. No other knife at this price point turns as many heads at a cutting board.',
    url: 'https://www.japaneseknifesupply.com/kurosaki-fujin',
    sortOrder: 10,
  },
  {
    name: 'Hatsukokoro Komorebi Gyuto 240mm',
    brand: 'Hatsukokoro',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 420,
    notes: '"Komorebi" means the interplay of light and leaves in a forest. True to the name, the layered stainless-clad iron Damascus on this Sakai-forged blade actually looks like sunlight filtering through foliage — no two are alike. The core is Shirogami #2 white carbon steel, one of the sharpest-taking alloys in production knifemaking. A collector-grade knife that earns its keep daily.',
    url: 'https://www.japaneseknifesupply.com/hatsukokoro',
    sortOrder: 11,
  },
  {
    name: 'Misono UX10 Gyuto 240mm',
    brand: 'Misono',
    category: 'knives',
    priority: 'medium',
    estimatedPrice: 285,
    notes: 'The most popular high-performance knife in Western professional kitchens that has never needed a celebrity endorsement. Swedish Sandvik 19C27 steel, laser-thin blade profile, and a bolster that allows a full choil pinch grip. Used straight through 12-hour service without degradation. The DIN-stamped serial number on every blade reflects Misono\'s factory pride.',
    url: 'https://www.japanesechefsknife.com/products/misono-ux10',
    sortOrder: 12,
  },

  // ── Cookware ─────────────────────────────────────────────────────────────
  {
    name: 'Mauviel M\'250c Copper Saucier 2.1qt',
    brand: 'Mauviel',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 375,
    notes: 'No kitchen object photographs like a gleaming 2.5mm copper saucier. No kitchen object performs like one either. Copper\'s thermal response outpaces stainless-clad at this thickness by a factor of five — caramel, beurre blanc, and curd work happens in real time rather than chasing the heat. Tin-lined interior, cast-iron handle. The saucier curve lets a whisk reach every square centimeter.',
    url: 'https://www.mauviel.com/product/m250c-saucier',
    sortOrder: 20,
  },
  {
    name: 'Smithey Ironware No. 12 Cast Iron Skillet',
    brand: 'Smithey Ironware',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 225,
    notes: 'Charleston-made, CNC-machined interior that is smoother than any vintage Griswold or Wagner straight from the foundry. The helper handle, curved lip, and polished surface look like industrial sculpture. Weighs 20% less than Lodge at the same diameter. The seasoning takes in 30 minutes and stays — a generational pan that genuinely improves with every use.',
    url: 'https://smithey.com/products/no-12-cast-iron-skillet',
    sortOrder: 21,
  },
  {
    name: 'Staub Cocotte Round 5.5qt Grenadine',
    brand: 'Staub',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 380,
    notes: 'Grenadine is the most visually striking colorway Staub produces — a deep pomegranate red that photographs like a jewel on any stovetop or table. But looks are not the reason to own it: the black matte enamel interior develops a seasoning over time, and the self-basting lid spikes return condensate uniformly over the entire surface. Braised short ribs in a Staub are a different dish than braised short ribs in anything else.',
    url: 'https://www.staub-online.com/cocotte-round-grenadine',
    sortOrder: 22,
  },
  {
    name: 'Finex 10" Cast Iron Skillet',
    brand: 'Finex',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 175,
    notes: 'The octagonal shape is not an affectation — eight pouring edges let you drain fat from any angle without dribbling. The signature coiled stainless steel handle dissipates heat faster than cast iron handles, so you can grab it bare-handed minutes after pulling it from the oven. Hand-cast in Portland, Oregon with a pre-seasoned interior that is genuinely non-stick before the first cook.',
    url: 'https://finexusa.com/products/10-cast-iron-skillet',
    sortOrder: 23,
  },

  // ── Appliances ────────────────────────────────────────────────────────────
  {
    name: 'Ankarsrum Original Stand Mixer 7qt',
    brand: 'Ankarsrum',
    category: 'appliance',
    priority: 'high',
    estimatedPrice: 750,
    notes: 'Sweden has been manufacturing this exact machine since 1940. The roller-and-hook design mimics hand-kneading by working dough against the bowl wall rather than pulling it from the center — professional bakers consistently rate Ankarsrum bread above KitchenAid at any hydration. The 7-quart stainless bowl and 600W direct-drive motor handle 5 pounds of dough without complaint. Visually unlike anything else on a countertop.',
    url: 'https://www.ankarsrum.com/us/ankarsrum-original/',
    sortOrder: 40,
  },
  {
    name: 'Breville Barista Express Impress',
    brand: 'Breville',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 900,
    notes: 'The rare prosumer espresso machine that satisfies both engineering and aesthetic standards. The Impress adds a guided tamping system over the previous Barista Express: a spring-loaded tamp applies consistent 30 lb pressure every pull, eliminating the variable that ruins 80% of home espresso. The integrated conical burr grinder pulls from bean to cup in under a minute. Brushed stainless exterior ages well and photographs beautifully.',
    url: 'https://www.breville.com/us/en/products/espresso/bes876.html',
    sortOrder: 41,
  },
  {
    name: 'Zojirushi Neuro Fuzzy Rice Cooker 5.5 Cup NS-ZCC10',
    brand: 'Zojirushi',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 185,
    notes: 'Zojirushi\'s Neuro Fuzzy logic adjusts cook time and temperature based on how the rice behaves during the cycle — not a preset timer. The result is rice that professional Japanese restaurants stake their reputation on, reproducible in a home kitchen. The rounded white body with the characteristic Zojirushi logo has been an icon of Japanese kitchen design for 30 years.',
    url: 'https://www.zojirushi.com/app/product/nszcc',
    sortOrder: 42,
  },
  {
    name: 'Ooni Karu 2 Pro Multi-Fuel Pizza Oven',
    brand: 'Ooni',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 799,
    notes: 'Reaches 950°F on wood, charcoal, or gas in 15 minutes — the floor temperature of a Neapolitan wood-burning oven. The 17-inch cooking surface accommodates pizza, whole fish, and focaccia. The new Ooni Connect hub provides real-time Bluetooth floor temperature monitoring, replacing the guesswork. For pop-ups, catering, and outdoor cooking at a Michelin-quality result.',
    url: 'https://ooni.com/products/ooni-karu-2-pro',
    sortOrder: 43,
  },

  // ── Tools ─────────────────────────────────────────────────────────────────
  {
    name: 'Thermapen ONE Instant-Read Thermometer',
    brand: 'ThermoWorks',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 105,
    notes: '1-second response time, ±0.5°F accuracy. The most trusted thermometer in professional cooking — Heston Blumenthal\'s team, the US military food safety program, and every serious competition BBQ circuit rely on ThermoWorks. The backlit foldable probe reads from any angle. No other consumer thermometer is within two seconds of this response time.',
    url: 'https://www.thermoworks.com/thermapen-one/',
    sortOrder: 50,
  },
  {
    name: 'John Boos CHOP-S End-Grain Maple Chopping Block 24×18×2.25"',
    brand: 'John Boos',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 280,
    notes: 'End-grain maple is self-healing: knife marks close back up with natural wood expansion and contraction. Boos supplies butcher blocks to The French Laundry, Alinea, and the majority of Relais & Châteaux properties in North America. The exposed end-grain pattern is one of the most visually appealing surfaces in any kitchen. Oiled monthly, this board outlasts careers.',
    url: 'https://www.johnboos.com/maple-end-grain-butcher-block',
    sortOrder: 51,
  },
  {
    name: 'Benriner Super Mandoline',
    brand: 'Benriner',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 65,
    notes: 'The mandoline found in every serious Japanese and Michelin-starred kitchen. Stainless blade adjustable to 0.3mm thickness. Thomas Keller famously attributed his signature cucumber carpaccio to the Benriner. Japanese-made, compact, sharper out of the box than any French mandoline at twice the price. The straight-cut and julienne blades cover 90% of professional slice work.',
    url: 'https://www.benriner.com/',
    sortOrder: 52,
  },

  // ── Modernist ─────────────────────────────────────────────────────────────
  {
    name: 'Anova Precision Cooker Pro (WiFi)',
    brand: 'Anova',
    category: 'modernist',
    priority: 'high',
    estimatedPrice: 199,
    notes: 'The 1200W Pro model circulates 12 liters per minute and maintains ±0.1°C across a 40-liter vessel — sufficient for a whole short rib braise in full service. The brushed stainless body and minimalist clamp look exactly like what professional sous vide equipment should look like. WiFi connectivity enables scheduled cooks from outside the kitchen. The most reliable consumer circulator available at this price.',
    url: 'https://anovaculinary.com/products/anova-precision-cooker-pro',
    sortOrder: 60,
  },
  {
    name: 'iSi Professional Cream Whipper 1L',
    brand: 'iSi',
    category: 'modernist',
    priority: 'medium',
    estimatedPrice: 115,
    notes: 'The vessel that Ferran Adrià used to create the espuma revolution. Charged with N₂O, it aerates any liquid — stocks, oils, creams, fruit purées — into a stable foam that holds for service. iSi\'s Austrian-made aluminum body withstands repeated pressure cycles unlike cheaper imitators. The 1L capacity is right for a restaurant mise en place or an ambitious dinner party.',
    url: 'https://www.isi.com/en/culinary/products/professional-whipper',
    sortOrder: 61,
  },
];

// Clear all existing items
db.prepare('DELETE FROM kitchen_wishlist').run();
console.log('Cleared existing wish list.');

const insert = db.prepare(`
  INSERT INTO kitchen_wishlist
    (id, name, brand, category, priority, estimated_price, notes, url, image_url, acquired, sort_order, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)
`);

const insertAll = db.transaction((items: Item[]) => {
  for (const item of items) {
    insert.run(ulid(), item.name, item.brand, item.category, item.priority, item.estimatedPrice, item.notes, item.url, item.sortOrder, now());
    console.log(`  ✅ Added: ${item.name}`);
  }
  return items.length;
});

const count = insertAll(ITEMS);
console.log(`\nDone — ${count} items seeded to Kitchen Wish List.`);
