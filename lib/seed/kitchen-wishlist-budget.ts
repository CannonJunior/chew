#!/usr/bin/env tsx
/**
 * Seed 20 highly recommended low-cost items + 3 top utensil sets.
 * Safe to re-run — skips existing names.
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
  estimatedPrice: number;
  notes: string;
  url: string | null;
  sortOrder: number;
};

const ITEMS: Item[] = [
  // ── Low-Cost Essentials ────────────────────────────────────────────────────
  {
    name: 'Kuhn Rikon Original Swiss Peeler Set of 3',
    brand: 'Kuhn Rikon',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 12,
    notes: 'The single most recommended peeler in professional and test kitchens worldwide. The y-shaped carbon steel blade shaves paper-thin without the wrist-twisting required by straight peelers. At $4 per peeler they are disposable when dull — professional kitchens keep them by the dozen. Used daily at The French Laundry.',
    url: 'https://kuhnrikon.com/us/swiss-peeler-set-of-3-carded-2784-u.html',
    sortOrder: 100,
  },
  {
    name: 'OXO Good Grips Multi-Purpose Stainless Steel Bench Scraper',
    brand: 'OXO',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 12,
    notes: 'Every pastry chef, bread baker, and prep cook keeps a bench scraper within arm\'s reach at all times. Used to portion dough, transfer chopped ingredients, clean a flour-dusted surface in one pass, and crush garlic. Wirecutter\'s top pick across every review cycle. The OXO version adds a comfortable grip and a ruler on the blade.',
    url: 'https://www.oxo.com/multi-purpose-scraper-and-chopper.html',
    sortOrder: 101,
  },
  {
    name: 'Ateco 4.5" Offset Spatula (Model 1385)',
    brand: 'Ateco',
    category: 'bakeware',
    priority: 'high',
    estimatedPrice: 8,
    notes: 'The offset spatula that every pastry professional learns on. The 4.5" blade is the versatile workhorse size — frosting cupcakes, smoothing ganache, lifting delicate items off a silpat, pressing a crust into a tart ring. Ateco supplies more professional pastry kitchens in the US than any other bakeware brand.',
    url: 'https://www.atecousa.com/4.5%E2%80%9D-offset-spatula---1385.html',
    sortOrder: 102,
  },
  {
    name: 'Lodge 10.25" Classic Cast Iron Skillet (L8SK3)',
    brand: 'Lodge',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 28,
    notes: 'Made in South Pittsburg, Tennessee since 1896. The L8SK3 is pre-seasoned and ready to use out of the box — it gets better with every cook. Cast iron retains heat longer than any other pan material, making it ideal for searing, baking cornbread, and frying. The most gifted and recommended entry-level cookware item in America, by a significant margin.',
    url: 'https://www.lodgecastiron.com/products/round-cast-iron-classic-skillet',
    sortOrder: 103,
  },
  {
    name: 'Victorinox 3.25" Fibrox Paring Knife',
    brand: 'Victorinox',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 9,
    notes: 'A sharper, more agile blade than most paring knives costing ten times more. The NSF-certified Fibrox handle is non-slip even when wet. Culinary schools issue Victorinox Fibrox paring knives to students on day one and for good reason — they take a razor edge and stay sharp through weeks of daily peeling, trimming, and detail work.',
    url: 'https://www.amazon.com/Victorinox-47508-4-Inch-Paring-Knife/dp/B008RCAXLY',
    sortOrder: 104,
  },
  {
    name: 'Matfer Bourgeat Exoglass High-Temperature Pelton Spatula',
    brand: 'Matfer Bourgeat',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 22,
    notes: 'Exoglass is a proprietary reinforced composite rated to 430°F — it will not melt on the lip of a hot pan the way plastic spatulas do, and unlike silicone it is rigid enough to flip a fish fillet cleanly. Standard issue in French professional kitchens. Dishwasher-safe, one-piece construction, no seams to trap food.',
    url: 'https://matferbourgeatusa.com/product/matfer-bourgeat-exoglass-high-temperature-pelton-spatula/',
    sortOrder: 105,
  },
  {
    name: 'OXO Good Grips 11" Balloon Whisk',
    brand: 'OXO',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 12,
    notes: 'Wirecutter\'s long-standing top pick for everyday whisks. The 11 stainless wires are thicker than most competitors, so they hold their shape under the pressure of stiff doughs and heavy cream. The handle is weighted to balance the whisk head — you can sense when a sauce is thickening rather than just stirring blindly.',
    url: 'https://www.oxo.com/11-in-balloon-whisk.html',
    sortOrder: 106,
  },
  {
    name: 'OXO Good Grips Large Silicone Flexible Turner',
    brand: 'OXO',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 13,
    notes: 'The silicone head slides under fried eggs, pancakes, and fish without tearing while the slightly flexible blade reads the pan surface better than a rigid metal turner. Heat-safe to 600°F. The scalloped edge creates a slight vacuum-break that makes releasing delicate foods easier.',
    url: 'https://www.oxo.com/oxo-gg-large-silicone-flexible-turner.html',
    sortOrder: 107,
  },
  {
    name: 'Winco LDI-6 Stainless Steel Ladle 6oz',
    brand: 'Winco',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 9,
    notes: 'The ladle used in more restaurant kitchens than any other — Winco is the standard NSF-certified professional smallwares brand. One-piece stainless steel, no rivets, welded handle. The 6oz size is the workhorse for plating soups and sauces accurately. Buy multiple to cover 2oz, 4oz, and 6oz portions.',
    url: 'https://www.wincous.com/products/ldi-6',
    sortOrder: 108,
  },
  {
    name: 'Nordic Ware 10" Deluxe Microwave Plate Cover',
    brand: 'Nordic Ware',
    category: 'other',
    priority: 'low',
    estimatedPrice: 8,
    notes: 'The quietly essential item every kitchen should have and almost nobody prioritizes until they need to clean a microwave. BPA-free, vented to prevent steam buildup, dishwasher-safe. Nordic Ware makes this in the US and the construction outlasts cheap supermarket versions by years.',
    url: 'https://www.nordicware.com/products/10-deluxe-plate-cover/',
    sortOrder: 109,
  },
  {
    name: 'Escali Primo Digital Kitchen Scale',
    brand: 'Escali',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 28,
    notes: 'The most recommended entry-level kitchen scale in professional baking circles. 2g graduation to 11lb capacity, tare function, easy-clean platform, 9V battery. Wirecutter recommends it as the best budget scale; it out-tests units twice its price. Every bread baker and pastry student should own one before anything else.',
    url: 'https://www.amazon.com/Escali-Digital-Multi-Functional-Kitchen-Measuring/dp/B0007GAWRS',
    sortOrder: 110,
  },
  {
    name: 'OXO Good Grips 3-Piece Fine Mesh Strainer Set',
    brand: 'OXO',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 20,
    notes: 'Three sizes (3", 5.5", 8") that together cover every straining need in a professional or home kitchen — washing grains, rinsing berries, sifting flour, dusting powdered sugar, and straining custards through the finest mesh. The reinforced frame does not bow under pressure the way cheap versions do.',
    url: 'https://www.oxo.com/oxo-good-grips-3-piece-strainer-set.html',
    sortOrder: 111,
  },
  {
    name: 'Rösle Stainless Steel Garlic Press 9"',
    brand: 'Rösle',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 35,
    notes: 'The garlic press that converted garlic-press skeptics — including Alton Brown, who reversed his public stance after testing the Rösle. The gear mechanism provides enormous mechanical advantage with minimal wrist strain; the self-cleaning plunger ejects skin from unpeeled cloves cleanly. Cast from solid 18/10 stainless, it will not corrode or flex under load.',
    url: 'https://www.amazon.com/R%C3%B6sle-Stainless-9-inch-Mincing-Garlic/dp/B000063Y8F',
    sortOrder: 112,
  },
  {
    name: 'GIR Ultimate Spatula',
    brand: 'GIR (Get It Right)',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 20,
    notes: 'Wirecutter\'s top spatula pick. Seamless one-piece pharmaceutical-grade silicone rated to 425°F — no metal core to corrode, no seam to trap bacteria. The rigidity is precisely calibrated: flexible enough to scrape a bowl completely, stiff enough to fold bread dough. Used by professional pastry teams and food stylists who need no scratches on non-stick.',
    url: 'https://gir.co/products/spatula',
    sortOrder: 113,
  },
  {
    name: 'Ateco Bowl Scraper Set of 2 (Plastic)',
    brand: 'Ateco',
    category: 'bakeware',
    priority: 'medium',
    estimatedPrice: 8,
    notes: 'The humble plastic bowl scraper is one of the highest-ROI items in a baker\'s kit — it transfers sticky dough to the bench without waste, scrapes a mixing bowl completely clean, and shapes wet dough in a banneton fold. Ateco\'s version is slightly curved to match the radius of their mixing bowls. Professional bakeries use dozens.',
    url: 'https://www.amazon.com/Ateco-Bowl-Scraper-Set-2/dp/B01MFH5647',
    sortOrder: 114,
  },
  {
    name: 'Vollrath 47312 12" Heavy-Duty Stainless Utility Tongs',
    brand: 'Vollrath',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 12,
    notes: 'The tongs found on every professional line station. Vollrath\'s one-piece stainless construction with a tension spring that actually matches the cook\'s grip strength — not too loose, not fatiguing. NSF-certified, dishwasher-safe, and rated for commercial use. Buy a pair of 9" and a pair of 12" and throw out every inferior tong you own.',
    url: 'https://www.vollrathfoodservice.com/products/smallwares/kitchen-essentials/tongs/utility-tongs/47312',
    sortOrder: 115,
  },
  {
    name: 'Fat Daddio\'s Anodized Aluminum Round Cake Pan 9"×2"',
    brand: 'Fat Daddio\'s',
    category: 'bakeware',
    priority: 'medium',
    estimatedPrice: 14,
    notes: 'The pan used by most professional pastry schools and competition bakers in the US. Hard-anodized aluminum conducts heat more evenly and releases cakes more cleanly than non-anodized alternatives. The 2" straight walls produce perfectly flat layers that stack without doming correction. At $14 each, professional bakers buy them in sets of 3.',
    url: 'https://shop.fatdaddios.com/products/round-cake-pans',
    sortOrder: 116,
  },
  {
    name: 'OXO Good Grips Stainless Steel 5-qt Colander',
    brand: 'OXO',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 35,
    notes: 'The legs are high enough to drain into a full pot beneath it — you can reserve pasta water without a ladle. Fully perforated bowl with no dead zones, ring base that stays level in a sink, and a rolled rim that won\'t damage stainless sinks. Cook\'s Illustrated\'s top pick for years. Holds a full pound of pasta with room to toss.',
    url: 'https://www.oxo.com/oxo-gg-stainless-steel-5-qt-colander.html',
    sortOrder: 117,
  },
  {
    name: 'Rubbermaid Commercial 13.5" High-Heat Silicone Scraper',
    brand: 'Rubbermaid Commercial',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 16,
    notes: 'The NSF-certified scraper found in every institutional and professional kitchen. Heat-stable to 500°F — safe for stirring hot caramel, sauces, and roux without melting. The blade flexibility is calibrated for complete bowl scraping, not the mushy feel of cheaper silicone spatulas. Color-coded versions help with allergen separation protocols.',
    url: 'https://www.webstaurantstore.com/rubbermaid-fg1963000000-color-coded-13-1-2-red-high-temperature-silicone-spatula/690FG19630RD.html',
    sortOrder: 118,
  },
  {
    name: 'ThermoWorks ThermoPop 2',
    brand: 'ThermoWorks',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 34,
    notes: 'The affordable ThermoWorks option that still delivers the brand\'s hallmark accuracy (±1°F) and a 3-4 second response time that beats every competitor at the price point. Rotating display, waterproof, and a calibration function. For a cook who can\'t yet justify the Thermapen ONE, this is the right entry point — ThermoWorks is the only thermometer brand serious professional cooks recommend without reservation.',
    url: 'https://www.thermoworks.com/thermopop-2/',
    sortOrder: 119,
  },

  // ── Utensil Sets ──────────────────────────────────────────────────────────
  {
    name: 'GIR 10-Piece Silicone Kitchen Utensil Set',
    brand: 'GIR (Get It Right)',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 120,
    notes: "Food Network's top-rated silicone utensil set across all testing. Pharmaceutical-grade BPA/BPS-free silicone rated to 425°F in seamless unibody construction — no seams, no joints, no bacteria traps. Wirecutter independently recognizes the GIR spatula as the best in class. Includes spatulas, flip, ladle, spoons, whisk, peeler, and spoonula. The set a professional pastry cook would choose for home.",
    url: 'https://gir.co/products/10piece-best-sellers-set',
    sortOrder: 120,
  },
  {
    name: 'OXO Steel 15-Piece Utensil Set',
    brand: 'OXO',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 90,
    notes: "OXO is Wirecutter's most-cited brand across kitchen tool categories, and this set covers the full range of everyday tools in dishwasher-safe stainless steel: tongs, fish turner, whisk, pizza wheel, ladle, solid spoon, slotted spoon, spaghetti server, can opener, peeler, and stainless holder. Heat-safe to 400°F. Food Network testers found the turner handled omelets and fish perfectly.",
    url: 'https://www.oxo.com/oxo-steel-15-piece-set.html',
    sortOrder: 121,
  },
  {
    name: 'All-Clad Cook & Serve 6-Piece Stainless Steel Tool Set',
    brand: 'All-Clad',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 100,
    notes: 'All-Clad\'s professional-grade heavy-gauge stainless tools rated to 600°F with a Limited Lifetime Warranty — the highest heat rating of any set in this price range. Six essential tools (solid spoon, slotted spoon, ladle, fork, tongs, and caddy) in the same quality standard as All-Clad\'s cookware. The choice when you want your utensils to last as long as your pans.',
    url: 'https://www.all-clad.com/cook-serve-set-6-piece-tool-set.html',
    sortOrder: 122,
  },
];

const checkExists = db.prepare('SELECT id FROM kitchen_wishlist WHERE name = ?');
const insert = db.prepare(`
  INSERT INTO kitchen_wishlist
    (id, name, brand, category, priority, estimated_price, notes, url, image_url, acquired, sort_order, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)
`);

const insertAll = db.transaction((items: Item[]) => {
  let inserted = 0;
  for (const item of items) {
    if (checkExists.get(item.name)) {
      console.log(`  ⏭  Skipping (exists): ${item.name}`);
      continue;
    }
    insert.run(ulid(), item.name, item.brand, item.category, item.priority,
      item.estimatedPrice, item.notes, item.url, item.sortOrder, now());
    console.log(`  ✅ Added: ${item.name}`);
    inserted++;
  }
  return inserted;
});

const count = insertAll(ITEMS);
console.log(`\nDone — ${count} items added to Kitchen Wish List.`);
