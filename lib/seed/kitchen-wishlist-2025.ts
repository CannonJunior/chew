#!/usr/bin/env tsx
/**
 * Seed 5 newly released (Aug 2024 – Aug 2025) kitchen equipment items.
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
  estimatedPrice: number | null;
  notes: string;
  url: string | null;
  sortOrder: number;
};

const ITEMS: Item[] = [
  {
    name: 'Combustion Inc. Predictive Thermometer (2nd Gen)',
    brand: 'Combustion Inc.',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 179,
    notes: 'Released November 2024. Eight evenly-spaced temperature sensors give a full gradient reading across the interior of any cut — not just the cold center — so you see exactly where a thick roast stands from crust to core simultaneously. The 2nd Gen adds a hermetically sealed ceramic-to-metal brazed body rated to IP69K and a 900°F ceiling, making it genuinely safe inside a screaming-hot oven or over live coals where competitors melt. The physics-based predictive engine estimates finish times through the stall with real accuracy — a genuine advancement over guesswork that every serious cook benefits from the first time they use it.',
    url: 'https://combustion.inc/products/predictive-thermometer-gen2',
    sortOrder: 45,
  },
  {
    name: 'ThermoWorks RFX Wireless Meat Thermometer (2-probe)',
    brand: 'ThermoWorks',
    category: 'tool',
    priority: 'high',
    estimatedPrice: 239,
    notes: 'Released July 2024. ThermoWorks — the makers of the Thermapen, the benchmark professional instant-read thermometer — entered the wireless probe market with sub-GHz radio technology rather than Bluetooth. The result is 1,500 ft line-of-sight range versus the ~170 ft ceiling of every Bluetooth competitor, solving the #1 reliability problem with wireless probes in large kitchens and outdoor setups. A single gateway supports 50+ probes simultaneously for professional or competition-scale use. No celebrities, no marketing — just the same rigorous engineering philosophy as the Thermapen.',
    url: 'https://www.thermoworks.com/rfx-starter-kit/',
    sortOrder: 46,
  },
  {
    name: 'Ooni Karu 2 Pro Multi-Fuel Pizza Oven',
    brand: 'Ooni',
    category: 'appliance',
    priority: 'medium',
    estimatedPrice: 799,
    notes: 'Released October 2024. Ooni\'s flagship multi-fuel oven burns wood, charcoal, or gas and reaches 950°F in 15 minutes — the floor temperature of a traditional Neapolitan wood-burning oven. The 17-inch cooking surface and 5.7-inch internal height accommodate whole chickens, large roasts, and full-size focaccia, not just pizza. The new Ooni Connect Digital Temperature Hub provides real-time Bluetooth temperature monitoring via smartphone, replacing guesswork with data. For pop-up chefs, caterers, and serious home cooks who want a commercial wood-fired result anywhere.',
    url: 'https://ooni.com/products/ooni-karu-2-pro',
    sortOrder: 92,
  },
  {
    name: 'Strata Carbon Clad Frying Pan 10.5"',
    brand: 'Strata Cookware',
    category: 'cookware',
    priority: 'medium',
    estimatedPrice: 119,
    notes: 'Released mid-2024. The first commercially available 3-ply clad pan with carbon steel as the cooking surface — an entirely new construction category, not a marketing refresh. Carbon steel\'s rapid thermal response and natural non-stick seasoning are combined with an aluminum core for the even heat distribution that single-layer carbon steel has always lacked, eliminating the hot-center problem that frustrates professional cooks. Induction compatible, significantly lighter than traditional carbon steel at the same diameter, and it builds the same patina. A genuine technical advance worth watching.',
    url: 'https://www.stratacookware.com/',
    sortOrder: 29,
  },
  {
    name: 'Shun Shiranami 8" Chef\'s Knife',
    brand: 'Shun (Kai USA)',
    category: 'knives',
    priority: 'medium',
    estimatedPrice: 370,
    notes: 'Released Q4 2024. Shun\'s new flagship consumer/enthusiast line uses 71-layer Dual Core Damascus steel — alternating layers of two different alloys throughout the full blade rather than a decorative surface layer over a single core — which distributes both edge retention and toughness evenly and eliminates the brittleness concentration at the spine common in standard Damascus. The resin-stabilized Jute Micarta handle is water-resistant and non-slip, a functional improvement over Shun\'s older Pakkawood handles that swelled and cracked in wet kitchen conditions. Hand-sharpened to 16° per side.',
    url: 'https://cutleryandmore.com/products/shun-shiranami-chefs-knife-41311',
    sortOrder: 18,
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
