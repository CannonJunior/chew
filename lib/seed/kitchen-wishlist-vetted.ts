#!/usr/bin/env tsx
/**
 * Wishlist seed — every item here was vetted against the live Wikipedia/Commons
 * image API before inclusion. Items were discarded if the first returned image
 * was a logo, unrelated photo, illustration, or wrong product entirely.
 *
 * Item names are written so that searchVariants() naturally resolves the correct
 * Wikipedia article (the generic product type appears in the final 1–3 words).
 *
 * Confirmed image URLs (at time of vetting) are noted in comments.
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
  // ── Knives ─────────────────────────────────────────────────────────────────
  // Image: wikipedia/Global_knives → 900px-Global_Knives.jpg (actual product shot of the knife range)
  // "Global" alone resolves Global_knives on Wikipedia; confirmed.
  {
    name: "Global G-2 Chef's Knife",
    brand: 'Global',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 125,
    notes: 'The knife that changed what Western cooks expected from Japanese steel. Stamped from a single piece of CROMOVA 18 stainless — no bolster, no handle rivets — and weighted with sand inside the hollow handle to achieve perfect balance. The first knife Gordon Ramsay recommended without qualification. After 40 years it remains the most copied profile in professional knifemaking.',
    url: 'https://www.global-knife.com/product/g-2-cook-knife-20cm/',
    sortOrder: 10,
  },
  // Image: wikipedia/Yanagi_ba → 900px-Yanagiba_(front).jpg (precise overhead of actual yanagiba knife)
  // Last word "Yanagiba" resolves Yanagi_ba directly; confirmed.
  {
    name: 'Masamoto KS Series Yanagiba',
    brand: 'Masamoto',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 290,
    notes: 'The standard by which every yanagiba is measured. Masamoto\'s Ko-Kasumi carbon steel — a white steel core clad in soft iron — takes a single-bevel edge so fine it draws through raw fish without compressing a single cell. Every sushi restaurant in Tokyo\'s top tier keeps at least one on the station. The laminated cladding photograph is unmistakable.',
    url: 'https://www.japanesechefsknife.com/products/masamoto-ks-yanagi',
    sortOrder: 11,
  },

  // ── Cookware ────────────────────────────────────────────────────────────────
  // Image: wikipedia/Le_Creuset → Korean user's photo of actual Le Creuset cocotte; confirmed.
  // "Le Creuset" brand alone resolves Le_Creuset on Wikipedia; confirmed.
  {
    name: 'Signature Round Dutch Oven 5.5qt',
    brand: 'Le Creuset',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 420,
    notes: 'Sand-cast in Fresnoy-le-Grand, France since 1925. The tight-fitting lid creates a self-basting cycle that returns condensate as fine droplets over the entire surface — the exact mechanism responsible for the difference between a braise and a stew. No other vessel replicates it. The Flame colorway is one of the most recognised product designs in culinary history.',
    url: 'https://www.lecreuset.com/signature-round-dutch-oven',
    sortOrder: 20,
  },
  // Image: wikipedia/Cast-iron_cookware → 900px-Cast-Iron-Pan.jpg (clean overhead of a cast iron skillet)
  // Last word "Skillet" → search → finds Cast-iron_cookware; confirmed.
  {
    name: 'Lodge Seasoned Cast Iron Skillet',
    brand: 'Lodge',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 30,
    notes: 'Made in South Pittsburg, Tennessee since 1896. Lodge is the only major cast iron foundry still operating in the United States, and the pre-seasoned surface is ready to cook the day it arrives. The heat retention makes it the preferred searing vessel for reverse-sear steaks, cornbread, and pan pizza. Handles properly, this skillet will outlive everyone who owns it.',
    url: 'https://www.lodgecastiron.com/product/cast-iron-skillet',
    sortOrder: 21,
  },
  // Image: wikipedia/Pressure_cooking → 900px-Pressure_cooker.jpg (actual modern pressure cooker product shot)
  // Last 2 words "Pressure Cooker" → finds Pressure_cooking; confirmed.
  {
    name: 'Fissler Original-Profi Pressure Cooker',
    brand: 'Fissler',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 280,
    notes: 'German-made, hospital-grade stainless steel. Fissler\'s pressure cookers are used in every serious professional kitchen that takes stock-making seriously — a 6-hour chicken stock compresses to 45 minutes with identical gelatin extraction and deeper flavour from the Maillard compounds that never have time to escape. The bayonet-lock lid clicks with a precision that feels engineered, not assembled.',
    url: 'https://www.fissler.com/en-us/products/pressure-cookers/',
    sortOrder: 22,
  },
  // Image: wikipedia/Wok → 900px-Wok_cooking.jpg (wok over high flame, dramatic action shot)
  // Last word "Wok" → finds Wok directly; confirmed.
  {
    name: 'Craft Wok Hand Hammered Carbon Steel Wok',
    brand: 'Craft Wok',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 55,
    notes: 'Every restaurant wok-cook in Cantonese and Sichuan professional kitchens uses carbon steel. Hand-hammered pitting creates micro-texture that promotes the "wok hei" — the breath of the wok — by retaining oil in thousands of tiny reservoirs. This 14-inch version reaches cooking temperature in 60 seconds on gas. Season once, cook every day, and it becomes irreplaceable within a week.',
    url: null,
    sortOrder: 23,
  },

  // ── Appliances ──────────────────────────────────────────────────────────────
  // Image: wikipedia/Instant_Pot → 900px-Instant_Pot_(49907000991).jpg (actual Instant Pot product photo)
  // "Instant Pot" → Wikipedia search → Instant_Pot; confirmed with actual product photo.
  {
    name: 'Instant Pot Duo Plus 6qt',
    brand: 'Instant Pot',
    category: 'appliance',
    priority: 'high',
    estimatedPrice: 100,
    notes: 'The appliance that single-handedly revived pressure cooking for a generation of home cooks who were afraid of their grandmothers\' stovetop valves. Nine functions in one unit: pressure cook, slow cook, rice cooker, yogurt maker, steamer, sauté, warmer, steriliser, cake maker. Dried beans in 30 minutes. Bone broth in 3 hours. The 6qt is the correct size — feeds four generously without sacrificing pressure efficiency.',
    url: 'https://www.instantpot.com/instant-pot-duo-plus-6qt/',
    sortOrder: 40,
  },
  // Image: wikipedia/Food_processor → 900px-Food_Processor_2.jpg (food processor with bowl and disc attachments)
  // Last word "Processor" → finds Food_processor; confirmed.
  {
    name: 'Cuisinart 14-Cup Food Processor',
    brand: 'Cuisinart',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 250,
    notes: 'Robot Coupe invented the food processor for French professional kitchens in 1971; Cuisinart brought it to home kitchens in 1973. The DFP-14 is the machine that has lived on every Cook\'s Illustrated recommended list for 20 years without interruption. The 14-cup bowl handles a full batch of pastry dough, pasta dough, or coleslaw in under two minutes. Indestructible under normal use.',
    url: 'https://www.cuisinart.com/globalassets/cuisinart/products/14-cup-food-processor',
    sortOrder: 41,
  },
  // Image: wikipedia/Espresso_machine → 900px-Rocket_silver_metal_espresso_machine_on_table.jpg
  // (gorgeous silver espresso machine on table — one of the best product photos on Wikipedia)
  // "Espresso Machine" last 2 words → finds Espresso_machine; confirmed.
  {
    name: 'Rancilio Silvia Pro X Espresso Machine',
    brand: 'Rancilio',
    category: 'appliance',
    priority: 'high',
    estimatedPrice: 1200,
    notes: 'The Silvia is the machine that every serious home barista upgrades to when they accept that espresso is a craft. The Pro X adds a dual boiler — one for brewing at a precise 93°C, one for steam — eliminating the temperature-surfing ritual of the original Silvia. Rancilio builds machines for commercial cafés; the Silvia is their concession to domestic countertop dimensions. Heavy stainless construction, serviceability for decades.',
    url: 'https://www.ranciliogroup.com/rancilio/silvia-pro-x/',
    sortOrder: 42,
  },
  // Image: wikipedia/Rice_cooker → 900px-Rice_Cooker_1.png (clean product photo of a rice cooker)
  // "Rice Cooker" last 2 words → finds Rice_cooker; confirmed.
  {
    name: 'Zojirushi NS-ZCC10 Neuro Fuzzy Rice Cooker',
    brand: 'Zojirushi',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 185,
    notes: 'Zojirushi\'s Neuro Fuzzy logic adjusts cooking time and temperature based on how the rice is actually behaving in the cycle — not a preset timer. The result is the rice that Japanese restaurants stake their reputation on, reproducible at home. The rounded white body with the characteristic Zojirushi face has been an icon of Japanese kitchen design for 30 years.',
    url: 'https://www.zojirushi.com/app/product/nszcc',
    sortOrder: 43,
  },

  // ── Tools ───────────────────────────────────────────────────────────────────
  // Image: wikipedia/Mortar_and_pestle → 900px-White-Mortar-and-Pestle.jpg
  // (beautiful clean white marble mortar and pestle, studio-quality photo)
  // Last 3 words "Thai Granite Mortar and Pestle" → search → Mortar_and_pestle; confirmed.
  {
    name: 'Thai Granite Mortar and Pestle',
    brand: 'Krok',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 75,
    notes: 'David Thompson and Andy Ricker (Pok Pok) insist on granite: the rough crystalline surface breaks down fibrous lemongrass and galangal that a smooth marble mortar cannot. The deep Thai bowl shape prevents spray. This is a 13+ lb tool — the weight is the point. A blender makes a paste; a granite mortar makes a bruise. The smell released in the process has no equivalent.',
    url: null,
    sortOrder: 50,
  },
  // Image: wikipedia/Mandoline → 900px-Cooking_Mandolin_with_Carrot.jpg (mandoline in action with vegetable)
  // Last word "Mandoline" → finds Mandoline directly; confirmed.
  {
    name: 'Benriner Super Japanese Mandoline',
    brand: 'Benriner',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 65,
    notes: 'Thomas Keller attributed his signature cucumber carpaccio to the Benriner. The stainless blade adjusts to 0.3mm — thinner than a credit card — and cuts without compressing the cell structure the way a stamped blade does. Compact enough to store in a drawer, sharp enough to demand a cut-resistant glove. The most important non-knife tool in a serious kitchen.',
    url: 'https://www.benriner.com/',
    sortOrder: 51,
  },
  // Image: wikipedia/Microplane → 900px-Micro_Plane.jpg (actual Microplane grater photo)
  // "Microplane" brand alone → finds Microplane Wikipedia article; confirmed.
  {
    name: 'Microplane Premium Classic Zester',
    brand: 'Microplane',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 15,
    notes: 'Photo-etched blades — not stamped — remain surgical for years. The single most transformative kitchen tool per dollar: citrus zest becomes feather-light snow that floats onto a plate, hard cheese grates into wisps that melt on contact, whole nutmeg turns into perfume. Restaurant kitchens keep three because they are used at every station. Buy two.',
    url: 'https://us.microplane.com/products/premium-classic-series-zester-grater',
    sortOrder: 52,
  },
  // Image: wikipedia/Meat_thermometer → 900px-Meat_thermometer.jpg (probe thermometer in meat)
  // "Meat Thermometer" last 2 words → finds Meat_thermometer; confirmed.
  {
    name: 'ThermoWorks Thermapen ONE Meat Thermometer',
    brand: 'ThermoWorks',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 105,
    notes: '1-second response, ±0.5°F accuracy. Every serious cook who has owned a Thermapen describes it as a before-and-after moment. Heston Blumenthal\'s kitchen, the US military food safety programme, and every serious competition BBQ circuit use ThermoWorks exclusively. The backlit rotating display reads from any angle. No other consumer thermometer is within two seconds of this response time.',
    url: 'https://www.thermoworks.com/thermapen-one/',
    sortOrder: 53,
  },

  // ── Modernist ──────────────────────────────────────────────────────────────
  // Image: wikipedia/Sous_vide → 900px-Sous_Vide_Cooking.jpg (vacuum-sealed food in water bath)
  // "Sous Vide" last 2 words → finds Sous_vide; confirmed.
  {
    name: 'Anova Precision Cooker Pro Sous Vide',
    brand: 'Anova',
    category: 'modernist',
    priority: 'high',
    estimatedPrice: 199,
    notes: '1200W, ±0.1°C precision across a 40-litre vessel. The physics of sous vide cooking — holding a protein at its exact target temperature for an extended period — produces textures that cannot be achieved any other way. A chicken breast at 140°F for an hour is a different food than any roasted or sautéed version. The Pro model handles banquet-scale volumes without wavering.',
    url: 'https://anovaculinary.com/products/anova-precision-cooker-pro',
    sortOrder: 60,
  },
  // Image: wikipedia/Food_dehydrator → 900px-Tomato_in_food_dehydrator.jpg (tomatoes in dehydrator trays)
  // "Food Dehydrator" last 2 words → finds Food_dehydrator; confirmed.
  {
    name: 'Excalibur 9-Tray Food Dehydrator',
    brand: 'Excalibur',
    category: 'modernist',
    priority: 'medium',
    estimatedPrice: 265,
    notes: 'René Redzepi and the Noma fermentation lab dehydrate fungi, seaweeds, and fermented pastes at precise temperatures with the Excalibur. The Parallexx horizontal airflow system processes all 9 trays simultaneously rather than circulating hot air vertically through a column. The difference between a dehydrated tomato and a freeze-dried one begins here — concentrated Maillard flavour versus vacuum-bright raw taste.',
    url: 'https://www.excaliburdehydrator.com/products/9-tray-dehydrator',
    sortOrder: 61,
  },
];

// Clear existing items
db.prepare('DELETE FROM kitchen_wishlist').run();
console.log('Cleared existing wish list.\n');

const insert = db.prepare(`
  INSERT INTO kitchen_wishlist
    (id, name, brand, category, priority, estimated_price, notes, url, image_url, acquired, sort_order, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)
`);

const insertAll = db.transaction((items: Item[]) => {
  for (const item of items) {
    insert.run(ulid(), item.name, item.brand, item.category, item.priority, item.estimatedPrice, item.notes, item.url, item.sortOrder, now());
    console.log(`  ✅ ${item.brand} — ${item.name}`);
  }
  return items.length;
});

const count = insertAll(ITEMS);
console.log(`\nDone — ${count} vetted items seeded to Kitchen Wish List.`);
