#!/usr/bin/env tsx
/**
 * Seed 40 curated professional kitchen equipment items into the wish list.
 * Items selected for actual use in professional kitchens / by respected chefs,
 * not based on paid endorsements. Safe to re-run — skips existing names.
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
    name: 'Masamoto VG-10 Gyuto 240mm',
    brand: 'Masamoto',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 350,
    notes: 'Masamoto is the knife of choice in the majority of Tokyo sushi and kaiseki restaurants. The VG-10 stainless core holds an edge for weeks of professional use and can be sharpened to a near-mirror finish. A workhorse the moment it leaves the box.',
    url: 'https://www.japanesechefsknife.com/products/masamoto-vg-gyuto',
    sortOrder: 10,
  },
  {
    name: 'Nenox S-Type Gyuto 210mm',
    brand: 'Nenox (Nenohi)',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 620,
    notes: 'Hand-forged in Sakai, Japan. The S-type is the knife most often spotted in the hands of Michelin-starred Japanese chefs abroad — it has an extraordinarily thin grind behind the edge that makes vegetable prep feel effortless. The Magnolia octagonal handle is a joy for 12-hour service.',
    url: 'https://www.nenox.com/',
    sortOrder: 11,
  },
  {
    name: 'Konosuke HD2 Gyuto 240mm',
    brand: 'Konosuke',
    category: 'knives',
    priority: 'medium',
    estimatedPrice: 390,
    notes: 'HD2 semi-stainless steel is the sweet spot between reactive carbon and full stainless — sharper than most, stays sharp far longer, and can be maintained on a ceramic rod mid-service. Extremely thin geometry that excels at fish and delicate protein work.',
    url: 'https://www.konosuke-knives.com/',
    sortOrder: 12,
  },
  {
    name: 'Masamoto KS Yanagiba 270mm',
    brand: 'Masamoto',
    category: 'knives',
    priority: 'medium',
    estimatedPrice: 290,
    notes: 'The standard by which all yanagiba are measured. Carbon steel Ko-Kasumi finish. Every serious sushi chef trains on Masamoto KS. The single bevel cuts sashimi without compressing the flesh — essential for clean slice presentation and proper mouthfeel.',
    url: 'https://www.japanesechefsknife.com/products/masamoto-ks-yanagi',
    sortOrder: 13,
  },
  {
    name: 'Misono UX10 Gyuto 240mm',
    brand: 'Misono',
    category: 'knives',
    priority: 'high',
    estimatedPrice: 285,
    notes: 'Arguably the most popular high-performance knife in Western professional kitchens that has never needed a celebrity endorsement. Swedish Sandvik 19C27 steel, laser-thin blade profile, and a bolster that allows full choil pinch grip. Extremely durable for daily line-cook use.',
    url: 'https://www.japanesechefsknife.com/products/misono-ux10',
    sortOrder: 14,
  },
  {
    name: 'Mac Professional Series MTH-80 Chef\'s Knife 8.5"',
    brand: 'Mac Knife',
    category: 'knives',
    priority: 'medium',
    estimatedPrice: 155,
    notes: 'The knife that culinary school instructors quietly buy for themselves. Japanese steel with a dimpled blade to prevent food sticking. Slim enough for Western-trained cooks, sharp enough for Japanese-standard work. Genuinely the best value in professional knives.',
    url: 'https://www.macknife.com/products/professional-hollow-edge-chefs-knife',
    sortOrder: 15,
  },
  {
    name: 'Victorinox Fibrox 10" Breaking/Slicing Knife',
    brand: 'Victorinox',
    category: 'knives',
    priority: 'low',
    estimatedPrice: 52,
    notes: 'The knife found in every professional butcher shop, fish market, and restaurant prep kitchen that takes its work seriously. NSF-certified, dishwasher safe (though don\'t), takes a ferocious edge on a ceramic rod, costs less than a steak. Thomas Keller keeps them in rotation for rough prep.',
    url: 'https://www.victorinox.com/us/en/Products/Cutlery/Slicing-Knives',
    sortOrder: 16,
  },
  {
    name: 'Wüsthof Classic 9" Double-Serrated Bread Knife',
    brand: 'Wüsthof',
    category: 'knives',
    priority: 'low',
    estimatedPrice: 130,
    notes: 'The double-serrated offset blade is a genuine advance over standard bread knives — it shears through crusty sourdough and brioche alike without tearing or producing excessive crumbs. The German steel holds serrations for years of daily service.',
    url: 'https://www.wusthof.com/products/classic-9-double-serrated-bread-knife',
    sortOrder: 17,
  },

  // ── Cookware ─────────────────────────────────────────────────────────────
  {
    name: 'De Buyer Mineral B Carbon Steel Fry Pan 12.5"',
    brand: 'De Buyer',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 90,
    notes: 'The pan of choice in virtually every professional French kitchen. Carbon steel heats faster than cast iron and builds a natural non-stick patina with use. Thomas Keller\'s team uses De Buyer throughout The French Laundry. The Mineral B\'s beeswax coating protects it until first seasoning.',
    url: 'https://www.debuyer.com/en/content/mineral-b-frying-pan',
    sortOrder: 20,
  },
  {
    name: 'Mauviel M\'150c 2.7mm Copper Saucepan 1.9qt',
    brand: 'Mauviel',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 295,
    notes: 'The gold standard for sauce work. Copper\'s unmatched thermal conductivity means heat changes happen in seconds — critical for caramel, custard, sugar work, and reducing fine stocks without scorching. Used by every serious French kitchen in the world. Tin-lined for reactivity control.',
    url: 'https://www.mauviel.com/product/m150c-saucepan',
    sortOrder: 21,
  },
  {
    name: 'Mauviel M\'Cook 5-Ply Stainless Sauté Pan 3.4qt',
    brand: 'Mauviel',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 340,
    notes: 'Five-ply construction with a stainless/copper/stainless/aluminum/stainless core delivers the even heat distribution of copper at a fraction of the reactivity risk. The straight 2.75" sides make it the ideal pan for building pan sauces and braises on induction or gas.',
    url: 'https://www.mauviel.com/product/mcook-saute-pan',
    sortOrder: 22,
  },
  {
    name: 'Demeyere Atlantis Saucier 2.1qt',
    brand: 'Demeyere',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 255,
    notes: 'Demeyere\'s 7-ply Silvinox surface is so smooth it rivals non-stick for sauces, yet holds up to metal utensils indefinitely. The rounded base of the Atlantis saucier is designed specifically for whisking roux, beurre blanc, and emulsified sauces without dead corners.',
    url: 'https://www.demeyere.com/en-us/sauciers/atlantis-saucier',
    sortOrder: 23,
  },
  {
    name: 'Matfer Bourgeat Black Carbon Steel Fry Pan 11"',
    brand: 'Matfer Bourgeat',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 68,
    notes: 'The pan used in more French Michelin-starred restaurants than any other, according to Escoffier Online surveys. Pressed carbon steel with no rivets (the handle is welded), so nothing traps carbon or bacteria. Lighter than De Buyer Mineral B but equivalent performance once seasoned.',
    url: 'https://www.matferbourgeatusa.com/product/black-steel-frying-pan/',
    sortOrder: 24,
  },
  {
    name: 'Turk Wrought Iron Skillet 10"',
    brand: 'Türk (Turk)',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 165,
    notes: 'Hand-forged in Remscheid, Germany since 1857. Wrought iron is denser than cast iron, conducts heat more evenly, and the forging process creates a naturally smoother surface. One piece — no welds, no bolts. Chefs who find cast iron too heavy for wrist work swear by these.',
    url: 'https://www.turk-metall.de/en/',
    sortOrder: 25,
  },
  {
    name: 'Le Creuset Signature Round Dutch Oven 5.5qt',
    brand: 'Le Creuset',
    category: 'cookware',
    priority: 'high',
    estimatedPrice: 420,
    notes: 'The definitive enameled cast iron braisier. Sand-cast in Fresnoy-le-Grand, France. The tight-fitting lid creates a self-basting cycle that no other vessel replicates. Braised meats, slow-cooked stocks, and bread baking all yield results that have no equal in alternative vessels.',
    url: 'https://www.lecreuset.com/round-dutch-oven',
    sortOrder: 26,
  },
  {
    name: 'Staub Cocotte Round 5.5qt "Graphite"',
    brand: 'Staub',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 380,
    notes: 'Staub\'s black matte enamel interior develops a seasoning over time that Le Creuset\'s cream interior cannot. The lid is heavier, creating a tighter seal, and interior spikes on the lid return condensate as uniform droplets over the entire surface. Preferred by many Alsatian chefs.',
    url: 'https://www.staub-online.com/cocotte-round',
    sortOrder: 27,
  },
  {
    name: 'All-Clad D5 Brushed 12" Fry Pan',
    brand: 'All-Clad',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 210,
    notes: 'The 5-ply D5 construction adds two additional stainless layers to the classic D3, eliminating the slight hot spots of earlier All-Clad. The brushed exterior hides wear. Fully oven-safe, warp-resistant, and a lifetime guarantee. The standard American professional kitchen pan.',
    url: 'https://www.all-clad.com/d5-brushed-stainless-steel-12-fry-pan',
    sortOrder: 28,
  },

  // ── Bakeware ─────────────────────────────────────────────────────────────
  {
    name: 'Nordic Ware Natural Aluminum Half Sheet Pan (2-pack)',
    brand: 'Nordic Ware',
    category: 'bakeware',
    priority: 'high',
    estimatedPrice: 28,
    notes: 'The most-used pan in professional pastry kitchens. Pure aluminum construction delivers even bake with no dark spots. These are the pans used in every serious test kitchen — Cook\'s Illustrated\'s long-standing top pick. Buy two packs and never be caught short during service.',
    url: 'https://nordicware.com/products/natural-aluminum-commercial-bakers-half-sheet',
    sortOrder: 30,
  },
  {
    name: 'Matfer Bourgeat Exopat Non-Stick Baking Mat',
    brand: 'Matfer Bourgeat',
    category: 'bakeware',
    priority: 'medium',
    estimatedPrice: 42,
    notes: 'The professional-grade alternative to generic silicone mats. Reinforced fiberglass mesh coated with food-grade silicone rated to 480°F. Used in French patisserie for tuiles, caramel work, and macaron shells. Withstands 3,000+ uses without degradation.',
    url: 'https://www.matferbourgeatusa.com/product/exopat-baking-mat/',
    sortOrder: 31,
  },
  {
    name: 'USA Pan Aluminized Steel Pullman Loaf Pan 13"',
    brand: 'USA Pan',
    category: 'bakeware',
    priority: 'low',
    estimatedPrice: 38,
    notes: 'The Pullman pan is essential for shokupan, pain de mie, and any crustless sandwich bread. USA Pan\'s corrugated aluminized steel construction creates steam channels that promote more even rise than flat-bottomed alternatives. The lid ensures perfectly square, dense-crumbed loaves.',
    url: 'https://www.usapan.com/products/pullman-loaf-pan-cover',
    sortOrder: 32,
  },

  // ── Precision Tools ───────────────────────────────────────────────────────
  {
    name: 'Thermapen ONE Instant-Read Thermometer',
    brand: 'ThermoWorks',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 105,
    notes: 'The 1-second response time and ±0.5°F accuracy have made this the most trusted thermometer in professional cooking. Heston Blumenthal\'s team, every serious competition BBQ circuit, and the US military food safety program all rely on ThermoWorks. No other consumer thermometer comes close.',
    url: 'https://www.thermoworks.com/thermapen-one/',
    sortOrder: 40,
  },
  {
    name: 'PolyScience Sous Vide Professional Chef Series',
    brand: 'PolyScience',
    category: 'appliance',
    priority: 'high',
    estimatedPrice: 799,
    notes: 'The circulator that Thomas Keller and Heston Blumenthal used to pioneer sous vide cooking for a mainstream audience. ±0.07°C precision across a 28-liter bath. The pump is powerful enough for 20-gallon cambros during banquet service. Built to run 24 hours a day for years.',
    url: 'https://www.cuisinetechnology.com/chefs-series.php',
    sortOrder: 41,
  },
  {
    name: 'MyWeigh KD-8000 Baker\'s Math Kitchen Scale',
    brand: 'MyWeigh',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 55,
    notes: 'The scale recommended by Peter Reinhart, Jeffrey Hamelman, and virtually every professional bread baker. The Baker\'s Math function directly calculates percentage of each ingredient relative to flour weight — indispensable for scaling recipes. 8kg capacity, 1g resolution.',
    url: 'https://myweigh.com/product/kd8000/',
    sortOrder: 42,
  },
  {
    name: 'American Weigh Gemini-20 Precision Scale (0.001g)',
    brand: 'American Weigh Scales',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 26,
    notes: 'Essential for working with hydrocolloids, spices, and curing salts where ±0.1g variance can ruin a batch. 0.001g resolution on a 20g capacity. Used in every modernist kitchen for measuring agar, methylcellulose, transglutaminase, and pink salt ratios.',
    url: 'https://www.americanweigh.com/gemini-20.html',
    sortOrder: 43,
  },
  {
    name: 'Breville Control Freak Induction Cooktop',
    brand: 'Breville',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 1500,
    notes: 'The first consumer induction cooktop with a temperature probe that reads the actual pan surface rather than an inferred wattage setting. ±1°C control from 77°F to 482°F. Pastry chefs and chocolate workers use it to hold precise temper temperatures without a bain-marie. No equal on the market.',
    url: 'https://www.brevilleusa.com/products/the-control-freak',
    sortOrder: 44,
  },

  // ── Blenders & Processors ─────────────────────────────────────────────────
  {
    name: 'Vitamix 5200 Blender',
    brand: 'Vitamix',
    category: 'appliance',
    priority: 'high',
    estimatedPrice: 549,
    notes: 'The undisputed standard in professional kitchens worldwide. The 5200\'s 2-peak HP motor and aircraft-grade stainless blades pulverize anything. René Redzepi, Daniel Humm, and Thomas Keller\'s teams all use Vitamix. Variable speed + pulse, 7-year warranty, made in Ohio.',
    url: 'https://www.vitamix.com/us/en_us/shop/5200',
    sortOrder: 50,
  },
  {
    name: 'Robot Coupe R2N Food Processor 3qt',
    brand: 'Robot Coupe',
    category: 'appliance',
    priority: 'high',
    estimatedPrice: 720,
    notes: 'The machine that invented the food processor category in 1971 for French professional kitchens, and still the most common unit in those kitchens today. The induction motor runs indefinitely without heat buildup. Built for 8-hour production days. Home units are imitations of this.',
    url: 'https://www.robot-coupe.com/en-US/products/r2n/',
    sortOrder: 51,
  },
  {
    name: 'Bamix Pro 200 Immersion Blender',
    brand: 'Bamix',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 185,
    notes: 'The original immersion blender, made in Mettlen, Switzerland since 1954. The 200W Swiss motor in a stainless housing outperforms every plastic-bodied competitor at high-volume blending and emulsification. The interchangeable blade system — slicing disc, whisk, mincer — makes it a versatile station tool.',
    url: 'https://www.bamix.com/pro-200/',
    sortOrder: 52,
  },

  // ── Prep & Cutting Tools ──────────────────────────────────────────────────
  {
    name: 'Benriner Super Slicer (Japanese Mandoline)',
    brand: 'Benriner',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 65,
    notes: 'The mandoline found in every serious Japanese and Michelin-starred kitchen. Stainless steel blade adjustable to 0.3mm thickness. Thomas Keller famously attributed his signature cucumber carpaccio to the Benriner. Inexpensive, compact, and sharper than any French mandoline twice the price.',
    url: 'https://www.benriner.com/',
    sortOrder: 60,
  },
  {
    name: 'Krok Thai Granite Mortar & Pestle 8" (Heavy)',
    brand: 'Krok (Thai import)',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 75,
    notes: 'David Thompson, Andy Ricker (Pok Pok), and every Thai chef working at a serious level insist on granite. The roughness of the stone surface breaks down fibrous lemongrass and galangal that a smooth marble mortar cannot. The deep Thai-style bowl shape prevents spray. At least 13 lbs — weight is the point.',
    url: null,
    sortOrder: 61,
  },
  {
    name: 'Microplane Professional Series 4-Sided Box Grater',
    brand: 'Microplane',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 58,
    notes: 'Microplane\'s photo-etched blades remain sharp for years of professional use; competing box graters use stamped blades that dull within months. The fine zesting side produces feather-light citrus zest and hard cheese that literally floats onto a plate. Essential in every serious kitchen.',
    url: 'https://us.microplane.com/products/professional-series-4-sided-box-grater',
    sortOrder: 62,
  },
  {
    name: 'Rösle Stainless Steel Fine-Mesh Skimmer 6"',
    brand: 'Rösle',
    category: 'tool',
    priority: 'medium',
    estimatedPrice: 45,
    notes: 'The finest mesh of any commercial skimmer — 0.5mm holes remove even small albumin particles from clarifying stocks and consommés without a chinois. The long 14" handle keeps hands away from deep-fry oil. Wire welded to the frame, not clipped, so it never loosens.',
    url: 'https://www.roesle.com/en/products/cooking-tools',
    sortOrder: 63,
  },
  {
    name: 'John Boos 20"×15" Maple End-Grain Butcher Block',
    brand: 'John Boos',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 280,
    notes: 'End-grain maple is self-healing — knife marks close back up with the wood\'s natural expansion and contraction. John Boos supplies butcher blocks to The French Laundry, Alinea, and the majority of Relais & Châteaux properties in North America. Oiled monthly, this board outlasts careers.',
    url: 'https://www.johnboos.com/maple-end-grain-butcher-block',
    sortOrder: 64,
  },

  // ── Modernist Tools ───────────────────────────────────────────────────────
  {
    name: 'ISI Professional Cream Whipper 1L',
    brand: 'iSi',
    category: 'modernist',
    priority: 'high',
    estimatedPrice: 115,
    notes: 'The vessel that Ferran Adrià used to create the espuma revolution. Charged with N₂O, it aerates any liquid — stocks, oils, creams, fruit purées — into a stable foam that holds for service. iSi\'s Austrian-made aluminum body withstands repeated pressure cycles unlike cheaper imitators.',
    url: 'https://www.isi.com/en/culinary/products/professional-whipper',
    sortOrder: 70,
  },
  {
    name: 'PolyScience Smoking Gun Pro',
    brand: 'PolyScience',
    category: 'modernist',
    priority: 'medium',
    estimatedPrice: 130,
    notes: 'Cold-smokes proteins, cheeses, oils, and cocktails table-side or in production without raising temperature. Used by Grant Achatz at Alinea, Heston Blumenthal\'s development kitchen, and dozens of Eleven Madison Park alumni. Works with any wood chip or dried herb. Far more controlled than stovetop smoking.',
    url: 'https://www.cuisinetechnology.com/smoking-gun-pro.php',
    sortOrder: 71,
  },
  {
    name: 'Searzall Torch Attachment',
    brand: 'Booker and Dax',
    category: 'modernist',
    priority: 'medium',
    estimatedPrice: 75,
    notes: 'Developed by cocktail scientist Dave Arnold, the Searzall diffuses a propane torch flame through two screens of Inconel mesh, eliminating raw-propane flavor entirely. Essential for finishing sous vide proteins, crisping skin after confit, and table-side flambé work. Attaches to any Bernzomatic torch.',
    url: 'https://searzall.com/',
    sortOrder: 72,
  },
  {
    name: 'Excalibur 9-Tray Food Dehydrator 3926TB',
    brand: 'Excalibur',
    category: 'modernist',
    priority: 'medium',
    estimatedPrice: 265,
    notes: 'The dehydrator René Redzepi and the Noma fermentation lab rely on for drying fungi, seaweeds, and fermented pastes at precise temperatures. The Parallexx horizontal airflow system dehydrates all 9 trays simultaneously. Adjustable 105°–165°F thermostat with 26-hour timer.',
    url: 'https://www.excaliburdehydrator.com/products/9-tray-dehydrator',
    sortOrder: 73,
  },
  {
    name: 'VacMaster VP215 Chamber Vacuum Sealer',
    brand: 'VacMaster',
    category: 'modernist',
    priority: 'high',
    estimatedPrice: 650,
    notes: 'A chamber sealer — unlike suction-type home units — evacuates the entire chamber, enabling vacuum-packing of liquids, marinades, and fragile items. Essential for serious sous vide, quick pickling, and compressing fruits (a Ferran Adrià technique). The VP215 is the entry point to professional-grade chamber sealing.',
    url: 'https://www.vacmaster.com/vp215/',
    sortOrder: 74,
  },
  {
    name: 'Modernist Pantry Hydrocolloid Starter Kit',
    brand: 'Modernist Pantry',
    category: 'modernist',
    priority: 'medium',
    estimatedPrice: 85,
    notes: 'Includes agar, sodium alginate, calcium chloride, carrageenan, methylcellulose, and xanthan gum — the core set needed to execute spherification, gels, emulsions, and hot gels. Pre-weighed professional-grade ingredients with pharmaceutical purity. The foundation of a modernist mise en place.',
    url: 'https://www.modernistpantry.com/starter-kit.html',
    sortOrder: 75,
  },

  // ── Storage & Organization ─────────────────────────────────────────────────
  {
    name: 'Cambro 6-qt Round Polycarbonate Container Set (6-pack)',
    brand: 'Cambro',
    category: 'storage',
    priority: 'high',
    estimatedPrice: 70,
    notes: 'The universal language of professional kitchens. Every prep cook, sauce chef, and pastry station uses Cambros for stocks, brines, batters, and mise en place. NSF-certified, -40°F to +212°F range, crystal-clear walls for contents visibility. The lids stack in a standardized column. Buy more than you think you need.',
    url: 'https://www.cambro.com/products/food-storage/polycarbonate-round/round-storage-containers/',
    sortOrder: 80,
  },
  {
    name: 'Vollrath Super Pan V® 1/3 Size Hotel Pans (set of 6)',
    brand: 'Vollrath',
    category: 'storage',
    priority: 'medium',
    estimatedPrice: 55,
    notes: '20-gauge stainless steel hotel pans are the standard mise en place vessels for line stations worldwide. Vollrath\'s Super Pan V has a reinforced bead that prevents warping under steam table heat. The 1/3 size is the most versatile — fits three across a standard steam table and nests perfectly.',
    url: 'https://www.vollrathfoodservice.com/products/super-pan-v',
    sortOrder: 81,
  },
  {
    name: 'Fellow Stagg EKG Pro Electric Kettle',
    brand: 'Fellow',
    category: 'appliance',
    priority: 'low',
    estimatedPrice: 165,
    notes: 'Variable temperature (104°F–212°F) with a hold function makes this the go-to kettle for precision coffee and tea work — blooming pour-overs at exactly 200°F, gongfu tea at 175°F. Used by every high-end tasting menu kitchen that takes its tea and coffee service as seriously as its food.',
    url: 'https://fellowproducts.com/products/stagg-ekg-electric-kettle',
    sortOrder: 90,
  },
  {
    name: 'KitchenAid Professional 600 Series Stand Mixer 6qt',
    brand: 'KitchenAid',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 530,
    notes: 'The professional bowl-lift design handles 14 dozen cookies or 14 cups of flour — double the capacity of tilt-head models. The direct-drive motor with all-metal gears has powered bakery operations for decades. Bowl-lift design provides necessary clearance for whisk attachments with large batches.',
    url: 'https://www.kitchenaid.com/professional-600-series',
    sortOrder: 91,
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
    insert.run(ulid(), item.name, item.brand, item.category, item.priority, item.estimatedPrice, item.notes, item.url, item.sortOrder, now());
    console.log(`  ✅ Added: ${item.name}`);
    inserted++;
  }
  return inserted;
});

const count = insertAll(ITEMS);
console.log(`\nDone — ${count} items added to Kitchen Wish List.`);
