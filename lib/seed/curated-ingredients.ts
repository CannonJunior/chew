#!/usr/bin/env tsx
/**
 * Curated ingredient seed — adds ~500 common cooking ingredients directly to
 * the DB without any API calls. Safe to re-run; skips existing names.
 *
 * Usage:  npx tsx lib/seed/curated-ingredients.ts
 *         npm run seed:curated
 *
 * Nutrition values are per 100 g, sourced from USDA SR / standard references.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { ulid } from 'ulid';
import { inferCategory } from './categories';

const DB_PATH = path.join(process.cwd(), 'chew.db');

type Ing = {
  name: string;
  description?: string;
  category?: string;   // override inferCategory if provided
  subcategory?: string;
  origin?: string;
  seasons?: string[];
  cal: number; prot: number; carb: number; fat: number;
  fib?: number; sug?: number; sod?: number;
};

/* ─── PRODUCE — vegetables ───────────────────────────────────────────────── */
const VEGETABLES: Ing[] = [
  { name:'Acorn squash', cal:40, prot:0.8, carb:10, fat:0.1, fib:1.5, sug:0, sod:4 },
  { name:'Arrowroot', cal:65, prot:4.2, carb:13, fat:0.2, fib:1.3, sug:0, sod:26 },
  { name:'Artichoke', cal:47, prot:3.3, carb:11, fat:0.2, fib:5.4, sug:1, sod:94 },
  { name:'Arugula', cal:25, prot:2.6, carb:3.7, fat:0.7, fib:1.6, sug:2, sod:27 },
  { name:'Asparagus', cal:20, prot:2.2, carb:3.9, fat:0.1, fib:2.1, sug:1.9, sod:2 },
  { name:'Bamboo shoots', cal:27, prot:2.6, carb:5.2, fat:0.3, fib:2.2, sug:3, sod:4 },
  { name:'Bean sprouts', cal:30, prot:3, carb:6, fat:0.2, fib:1.8, sug:4, sod:6 },
  { name:'Beet greens', cal:22, prot:2.2, carb:4.3, fat:0.1, fib:3.7, sug:0, sod:226 },
  { name:'Beets', cal:43, prot:1.6, carb:10, fat:0.2, fib:2.8, sug:7, sod:78 },
  { name:'Bell pepper, green', cal:20, prot:0.9, carb:4.6, fat:0.2, fib:1.7, sug:2.4, sod:3 },
  { name:'Bell pepper, red', cal:31, prot:1, carb:6, fat:0.3, fib:2.1, sug:4.2, sod:4 },
  { name:'Bell pepper, yellow', cal:27, prot:1, carb:6.3, fat:0.2, fib:0.9, sug:5.4, sod:2 },
  { name:'Bok choy', cal:13, prot:1.5, carb:2.2, fat:0.2, fib:1, sug:1.2, sod:65 },
  { name:'Broccoli rabe', cal:22, prot:3.2, carb:2.8, fat:0.5, fib:2.7, sug:0, sod:33 },
  { name:'Brussels sprouts', cal:43, prot:3.4, carb:9, fat:0.3, fib:3.8, sug:2.2, sod:25 },
  { name:'Butternut squash', cal:45, prot:1, carb:12, fat:0.1, fib:2, sug:2.2, sod:4 },
  { name:'Cabbage, green', cal:25, prot:1.3, carb:5.8, fat:0.1, fib:2.5, sug:3.2, sod:18 },
  { name:'Cabbage, red', cal:31, prot:1.4, carb:7.4, fat:0.2, fib:2.1, sug:3.8, sod:27 },
  { name:'Cactus pads (nopales)', cal:16, prot:1.3, carb:3.3, fat:0.1, fib:2, sug:1.1, sod:21 },
  { name:'Cauliflower', cal:25, prot:1.9, carb:5, fat:0.3, fib:2, sug:1.9, sod:30 },
  { name:'Celeriac', cal:42, prot:1.5, carb:9.2, fat:0.3, fib:1.8, sug:1.6, sod:100 },
  { name:'Celery root', cal:42, prot:1.5, carb:9.2, fat:0.3, fib:1.8, sug:1.6, sod:100 },
  { name:'Chard, Swiss', cal:19, prot:1.8, carb:3.7, fat:0.2, fib:1.6, sug:1.1, sod:213 },
  { name:'Chayote', cal:24, prot:0.8, carb:5.9, fat:0.1, fib:2.6, sug:2.2, sod:2 },
  { name:'Chicory greens', cal:23, prot:1.7, carb:4.7, fat:0.3, fib:4, sug:0.7, sod:45 },
  { name:'Chinese eggplant', cal:25, prot:1, carb:6, fat:0.2, fib:3, sug:3.5, sod:2 },
  { name:'Collard greens', cal:32, prot:3, carb:5.4, fat:0.6, fib:4, sug:0.5, sod:17 },
  { name:'Corn, sweet', cal:86, prot:3.3, carb:19, fat:1.4, fib:2.7, sug:3.2, sod:15 },
  { name:'Daikon radish', cal:18, prot:0.6, carb:4.1, fat:0.1, fib:1.6, sug:2.5, sod:21 },
  { name:'Dandelion greens', cal:45, prot:2.7, carb:9.2, fat:0.7, fib:3.5, sug:0.7, sod:76 },
  { name:'Edamame', cal:121, prot:11, carb:9, fat:5.2, fib:5, sug:2.2, sod:6 },
  { name:'Endive', cal:17, prot:1.3, carb:3.4, fat:0.2, fib:3.1, sug:0.2, sod:22 },
  { name:'Escarole', cal:19, prot:1.4, carb:3.8, fat:0.2, fib:3.1, sug:0.2, sod:25 },
  { name:'Fennel bulb', cal:31, prot:1.2, carb:7.3, fat:0.2, fib:3.1, sug:3.9, sod:52 },
  { name:'Fiddlehead ferns', cal:34, prot:4.6, carb:5.5, fat:0.4, fib:0, sug:0, sod:1 },
  { name:'Garlic scapes', cal:149, prot:6.4, carb:33, fat:0.5, fib:2.1, sug:1, sod:17 },
  { name:'Green beans', cal:31, prot:1.8, carb:7, fat:0.1, fib:2.7, sug:3.3, sod:6 },
  { name:'Green onion', cal:32, prot:1.8, carb:7.3, fat:0.2, fib:2.6, sug:2.3, sod:16 },
  { name:'Jalapeño', cal:29, prot:0.9, carb:6.5, fat:0.4, fib:2.8, sug:4.1, sod:3 },
  { name:'Jerusalem artichoke', cal:73, prot:2, carb:17, fat:0, fib:1.6, sug:9.6, sod:4 },
  { name:'Jicama', cal:38, prot:0.7, carb:8.8, fat:0.1, fib:4.9, sug:1.8, sod:4 },
  { name:'Kale', cal:49, prot:4.3, carb:9, fat:0.9, fib:3.6, sug:1.3, sod:38 },
  { name:'Kohlrabi', cal:27, prot:1.7, carb:6.2, fat:0.1, fib:3.6, sug:2.6, sod:20 },
  { name:'Leek', cal:61, prot:1.5, carb:14, fat:0.3, fib:1.8, sug:3.9, sod:20 },
  { name:'Lotus root', cal:74, prot:2.6, carb:17, fat:0.1, fib:4.9, sug:0.5, sod:45 },
  { name:'Mustard greens', cal:27, prot:2.9, carb:4.7, fat:0.4, fib:3.2, sug:1.3, sod:20 },
  { name:'Napa cabbage', cal:16, prot:1.2, carb:3.2, fat:0.2, fib:1.2, sug:1.4, sod:9 },
  { name:'Okra', cal:33, prot:1.9, carb:7.5, fat:0.2, fib:3.2, sug:1.5, sod:7 },
  { name:'Poblano pepper', cal:20, prot:0.9, carb:4.6, fat:0.2, fib:1.9, sug:2.4, sod:3 },
  { name:'Portobello mushroom', cal:22, prot:2.1, carb:3.9, fat:0.4, fib:1.3, sug:2.5, sod:9 },
  { name:'Purslane', cal:20, prot:2, carb:3.4, fat:0.4, fib:0.4, sug:0, sod:45 },
  { name:'Radicchio', cal:23, prot:1.4, carb:4.5, fat:0.2, fib:0.9, sug:0.6, sod:22 },
  { name:'Radish', cal:16, prot:0.7, carb:3.4, fat:0.1, fib:1.6, sug:1.9, sod:39 },
  { name:'Rutabaga', cal:38, prot:1.3, carb:8.1, fat:0.2, fib:2.5, sug:4.5, sod:20 },
  { name:'Serrano pepper', cal:32, prot:1.7, carb:6.7, fat:0.4, fib:3.7, sug:2.9, sod:10 },
  { name:'Shallot', cal:72, prot:2.5, carb:17, fat:0.1, fib:3.2, sug:7.9, sod:12 },
  { name:'Shiitake mushroom', cal:34, prot:2.2, carb:6.8, fat:0.5, fib:2.5, sug:2.4, sod:9 },
  { name:'Snow peas', cal:42, prot:2.8, carb:7.6, fat:0.2, fib:2.6, sug:4, sod:4 },
  { name:'Sorrel', cal:22, prot:2, carb:3.2, fat:0.7, fib:0, sug:0, sod:4 },
  { name:'Spaghetti squash', cal:31, prot:0.6, carb:7, fat:0.6, fib:1.5, sug:2.8, sod:17 },
  { name:'Sugar snap peas', cal:42, prot:2.8, carb:7.6, fat:0.2, fib:2.6, sug:4, sod:4 },
  { name:'Tomatillo', cal:32, prot:1, carb:5.8, fat:1, fib:1.9, sug:3.9, sod:1 },
  { name:'Turnip', cal:28, prot:0.9, carb:6.4, fat:0.1, fib:1.8, sug:3.8, sod:67 },
  { name:'Water chestnut', cal:97, prot:1.4, carb:24, fat:0.1, fib:3, sug:4.8, sod:14 },
  { name:'Watercress', cal:11, prot:2.3, carb:1.3, fat:0.1, fib:0.5, sug:0.2, sod:41 },
  { name:'White mushroom', cal:22, prot:3.1, carb:3.3, fat:0.3, fib:1, sug:2, sod:5 },
  { name:'Yam', cal:118, prot:1.5, carb:28, fat:0.2, fib:4.1, sug:0.5, sod:9 },
  { name:'Yellow squash', cal:18, prot:1.3, carb:3.8, fat:0.2, fib:1.1, sug:2.5, sod:2 },
  { name:'Zucchini', cal:17, prot:1.2, carb:3.1, fat:0.3, fib:1, sug:2.5, sod:8 },
];

/* ─── PRODUCE — fruits ───────────────────────────────────────────────────── */
const FRUITS: Ing[] = [
  { name:'Acai berry', cal:70, prot:1.5, carb:5, fat:5, fib:2, sug:2, sod:31 },
  { name:'Apricot', cal:48, prot:1.4, carb:11, fat:0.4, fib:2, sug:9.2, sod:1 },
  { name:'Asian pear', cal:42, prot:0.5, carb:11, fat:0.2, fib:3.6, sug:7, sod:0 },
  { name:'Blood orange', cal:50, prot:1, carb:11, fat:0.2, fib:2.2, sug:8, sod:0 },
  { name:'Boysenberry', cal:50, prot:1.4, carb:12, fat:0.3, fib:5.3, sug:4.9, sod:1 },
  { name:'Breadfruit', cal:103, prot:1.1, carb:27, fat:0.2, fib:4.9, sug:11, sod:2 },
  { name:'Cactus pear (prickly pear)', cal:41, prot:0.7, carb:10, fat:0.5, fib:3.6, sug:0, sod:5 },
  { name:'Cantaloupe', cal:34, prot:0.8, carb:8.2, fat:0.2, fib:0.9, sug:8, sod:16 },
  { name:'Cherimoya', cal:75, prot:1.6, carb:18, fat:0.7, fib:3, sug:12.5, sod:7 },
  { name:'Clementine', cal:47, prot:0.9, carb:12, fat:0.2, fib:1.7, sug:9.2, sod:1 },
  { name:'Cranberry', cal:46, prot:0.4, carb:12, fat:0.1, fib:4.6, sug:4, sod:2 },
  { name:'Currant, black', cal:63, prot:1.4, carb:15, fat:0.4, fib:0, sug:0, sod:2 },
  { name:'Date, Medjool', cal:277, prot:1.8, carb:75, fat:0.2, fib:6.7, sug:64, sod:1 },
  { name:'Dragon fruit', cal:60, prot:1.2, carb:13, fat:0, fib:3, sug:8, sod:39 },
  { name:'Durian', cal:147, prot:1.5, carb:27, fat:5.3, fib:3.8, sug:0, sod:2 },
  { name:'Elderberry', cal:73, prot:0.7, carb:18, fat:0.5, fib:7, sug:0, sod:6 },
  { name:'Feijoa', cal:55, prot:1, carb:13, fat:0.8, fib:6.4, sug:0, sod:3 },
  { name:'Fig, fresh', cal:74, prot:0.8, carb:19, fat:0.3, fib:2.9, sug:16, sod:1 },
  { name:'Fig, dried', cal:249, prot:3.3, carb:64, fat:0.9, fib:9.8, sug:48, sod:10 },
  { name:'Gooseberry', cal:44, prot:0.9, carb:10, fat:0.6, fib:4.3, sug:0, sod:1 },
  { name:'Grapefruit', cal:42, prot:0.8, carb:11, fat:0.1, fib:1.6, sug:7, sod:0 },
  { name:'Guava', cal:68, prot:2.6, carb:14, fat:1, fib:5.4, sug:8.9, sod:2 },
  { name:'Honeydew melon', cal:36, prot:0.5, carb:9.1, fat:0.1, fib:0.8, sug:8, sod:18 },
  { name:'Jackfruit', cal:95, prot:1.7, carb:24, fat:0.6, fib:1.5, sug:19, sod:2 },
  { name:'Kumquat', cal:71, prot:1.9, carb:16, fat:1, fib:6.5, sug:9.4, sod:10 },
  { name:'Lychee', cal:66, prot:0.8, carb:17, fat:0.4, fib:1.3, sug:15, sod:1 },
  { name:'Mandarin orange', cal:53, prot:0.8, carb:13, fat:0.3, fib:1.8, sug:10.6, sod:2 },
  { name:'Mango', cal:60, prot:0.8, carb:15, fat:0.4, fib:1.6, sug:14, sod:1 },
  { name:'Mulberry', cal:43, prot:1.4, carb:9.8, fat:0.4, fib:1.7, sug:8.1, sod:10 },
  { name:'Nectarine', cal:44, prot:1.1, carb:11, fat:0.3, fib:1.7, sug:7.9, sod:0 },
  { name:'Papaya', cal:43, prot:0.5, carb:11, fat:0.3, fib:1.7, sug:7.8, sod:8 },
  { name:'Passion fruit', cal:97, prot:2.2, carb:23, fat:0.7, fib:10, sug:11, sod:28 },
  { name:'Pawpaw', cal:80, prot:1.2, carb:19, fat:1.2, fib:2.6, sug:0, sod:0 },
  { name:'Persimmon', cal:70, prot:0.6, carb:19, fat:0.2, fib:3.6, sug:12.5, sod:1 },
  { name:'Pineapple', cal:50, prot:0.5, carb:13, fat:0.1, fib:1.4, sug:10, sod:1 },
  { name:'Plantain', cal:122, prot:1.3, carb:32, fat:0.4, fib:2.3, sug:15, sod:4 },
  { name:'Plum', cal:46, prot:0.7, carb:11, fat:0.3, fib:1.4, sug:9.9, sod:0 },
  { name:'Pomegranate', cal:83, prot:1.7, carb:19, fat:1.2, fib:4, sug:14, sod:3 },
  { name:'Pomelo', cal:38, prot:0.8, carb:10, fat:0, fib:1, sug:0, sod:1 },
  { name:'Quince', cal:57, prot:0.4, carb:15, fat:0.1, fib:1.9, sug:6.3, sod:4 },
  { name:'Rambutan', cal:82, prot:0.9, carb:21, fat:0.2, fib:0.9, sug:0, sod:11 },
  { name:'Raspberry', cal:52, prot:1.2, carb:12, fat:0.7, fib:6.5, sug:4.4, sod:1 },
  { name:'Soursop', cal:66, prot:1, carb:17, fat:0.3, fib:3.3, sug:0, sod:14 },
  { name:'Star fruit (carambola)', cal:31, prot:1, carb:6.7, fat:0.3, fib:2.8, sug:3.9, sod:2 },
  { name:'Strawberry', cal:32, prot:0.7, carb:7.7, fat:0.3, fib:2, sug:4.9, sod:1 },
  { name:'Tamarind', cal:239, prot:2.8, carb:63, fat:0.6, fib:5.1, sug:38, sod:28 },
  { name:'Tangerine', cal:53, prot:0.8, carb:13, fat:0.3, fib:1.8, sug:10.6, sod:2 },
  { name:'Ugli fruit', cal:47, prot:0.7, carb:12, fat:0.1, fib:0, sug:0, sod:0 },
  { name:'Watermelon', cal:30, prot:0.6, carb:7.6, fat:0.2, fib:0.4, sug:6.2, sod:1 },
  { name:'White peach', cal:39, prot:0.9, carb:10, fat:0.3, fib:1.5, sug:8.4, sod:0 },
  { name:'Yuzu', cal:53, prot:0.8, carb:13, fat:0.3, fib:1.8, sug:9, sod:0 },
];

/* ─── PRODUCE — fresh herbs ──────────────────────────────────────────────── */
const FRESH_HERBS: Ing[] = [
  { name:'Basil, fresh', category:'produce', cal:23, prot:3.2, carb:2.7, fat:0.6, fib:1.6, sug:0.3, sod:4 },
  { name:'Bay leaf', category:'produce', cal:313, prot:7.6, carb:75, fat:8.4, fib:26, sug:0, sod:23 },
  { name:'Chervil', category:'produce', cal:237, prot:23, carb:37, fat:3.9, fib:11.3, sug:0, sod:83 },
  { name:'Chives', category:'produce', cal:30, prot:3.3, carb:4.4, fat:0.7, fib:2.5, sug:1.9, sod:3 },
  { name:'Cilantro', category:'produce', cal:23, prot:2.1, carb:3.7, fat:0.5, fib:2.8, sug:0.9, sod:46 },
  { name:'Dill, fresh', category:'produce', cal:43, prot:3.5, carb:7, fat:1.1, fib:2.1, sug:0, sod:61 },
  { name:'Epazote', category:'produce', cal:32, prot:0.3, carb:7.4, fat:0.5, fib:0, sug:0, sod:43 },
  { name:'Kaffir lime leaves', category:'produce', cal:0, prot:0, carb:0, fat:0 },
  { name:'Lavender', category:'produce', cal:49, prot:0, carb:12, fat:0.7, fib:0, sug:0, sod:0 },
  { name:'Lemon balm', category:'produce', cal:44, prot:3.7, carb:8.4, fat:0.6, fib:0, sug:0, sod:0 },
  { name:'Lemon verbena', category:'produce', cal:0, prot:0, carb:0, fat:0 },
  { name:'Lovage', category:'produce', cal:25, prot:0, carb:6, fat:0.6, fib:0, sug:0, sod:0 },
  { name:'Marjoram, fresh', category:'produce', cal:33, prot:3.5, carb:6.9, fat:0.7, fib:2.8, sug:0, sod:24 },
  { name:'Mint, fresh', category:'produce', cal:70, prot:3.8, carb:15, fat:0.9, fib:8, sug:0.9, sod:31 },
  { name:'Oregano, fresh', category:'produce', cal:36, prot:2.3, carb:8.6, fat:0.5, fib:3.1, sug:0, sod:0 },
  { name:'Parsley, fresh', category:'produce', cal:36, prot:3, carb:6.3, fat:0.8, fib:3.3, sug:0.9, sod:56 },
  { name:'Rosemary, fresh', category:'produce', cal:131, prot:3.3, carb:21, fat:5.9, fib:14, sug:0, sod:26 },
  { name:'Sage, fresh', category:'produce', cal:315, prot:10.6, carb:61, fat:12.8, fib:40.3, sug:1.7, sod:11 },
  { name:'Shiso', category:'produce', cal:37, prot:3.8, carb:7, fat:0.1, fib:7.3, sug:0, sod:0 },
  { name:'Sorrel, fresh', category:'produce', cal:22, prot:2, carb:3.2, fat:0.7, fib:0, sug:0, sod:4 },
  { name:'Summer savory', category:'produce', cal:272, prot:6.7, carb:69, fat:5.9, fib:45.7, sug:0, sod:24 },
  { name:'Tarragon, fresh', category:'produce', cal:295, prot:22.8, carb:50, fat:7.2, fib:0, sug:0, sod:62 },
  { name:'Thyme, fresh', category:'produce', cal:101, prot:5.6, carb:24, fat:1.7, fib:14, sug:0, sod:9 },
];

/* ─── PANTRY — spices ────────────────────────────────────────────────────── */
const SPICES: Ing[] = [
  { name:'Allspice, ground', category:'pantry', cal:263, prot:6.1, carb:72, fat:8.7, fib:21.6, sug:0, sod:77 },
  { name:'Anise seed', category:'pantry', cal:337, prot:18, carb:50, fat:16, fib:14.6, sug:0, sod:16 },
  { name:'Caraway seed', category:'pantry', cal:333, prot:20, carb:50, fat:14.6, fib:38, sug:0, sod:17 },
  { name:'Cardamom, ground', category:'pantry', cal:311, prot:11, carb:68, fat:6.7, fib:28, sug:0.4, sod:18 },
  { name:'Cayenne pepper', category:'pantry', cal:318, prot:12, carb:57, fat:17, fib:27, sug:10, sod:30 },
  { name:'Celery seed', category:'pantry', cal:392, prot:18, carb:41, fat:25, fib:11.8, sug:0, sod:160 },
  { name:'Chili powder', category:'pantry', cal:282, prot:13, carb:50, fat:14, fib:27, sug:7, sod:1878 },
  { name:'Chinese five spice', category:'pantry', cal:279, prot:6, carb:57, fat:6, fib:0, sug:0, sod:0 },
  { name:'Cinnamon, ground', category:'pantry', cal:247, prot:4, carb:81, fat:1.2, fib:53, sug:2.2, sod:10 },
  { name:'Cloves, ground', category:'pantry', cal:274, prot:6, carb:66, fat:13, fib:33.9, sug:2.4, sod:277 },
  { name:'Coriander, ground', category:'pantry', cal:298, prot:12, carb:55, fat:18, fib:42, sug:0, sod:35 },
  { name:'Cumin, ground', category:'pantry', cal:375, prot:18, carb:44, fat:22, fib:11, sug:2.3, sod:168 },
  { name:'Curry powder', category:'pantry', cal:325, prot:14, carb:58, fat:14, fib:33.2, sug:2.8, sod:52 },
  { name:'Dill seed', category:'pantry', cal:305, prot:16, carb:55, fat:15, fib:21, sug:0, sod:20 },
  { name:'Fennel seed', category:'pantry', cal:345, prot:16, carb:52, fat:15, fib:40, sug:0, sod:88 },
  { name:'Fenugreek seed', category:'pantry', cal:323, prot:23, carb:58, fat:6.4, fib:25, sug:0, sod:67 },
  { name:'Garam masala', category:'pantry', cal:379, prot:15, carb:51, fat:15, fib:0, sug:0, sod:54 },
  { name:'Garlic powder', category:'pantry', cal:331, prot:17, carb:73, fat:0.7, fib:9, sug:2.6, sod:60 },
  { name:'Ginger, ground', category:'pantry', cal:335, prot:9, carb:72, fat:4.2, fib:14.1, sug:0, sod:27 },
  { name:'Mace, ground', category:'pantry', cal:475, prot:6.7, carb:51, fat:33, fib:20.2, sug:0, sod:26 },
  { name:'Mustard powder', category:'pantry', cal:469, prot:28, carb:28, fat:29, fib:12.2, sug:0, sod:13 },
  { name:'Nigella seed', category:'pantry', cal:375, prot:16, carb:52, fat:22, fib:0, sug:0, sod:0 },
  { name:'Nutmeg, ground', category:'pantry', cal:525, prot:5.8, carb:49, fat:36, fib:20.8, sug:2.9, sod:16 },
  { name:'Onion powder', category:'pantry', cal:341, prot:10, carb:79, fat:0.9, fib:9.2, sug:7, sod:70 },
  { name:'Paprika, smoked', category:'pantry', cal:289, prot:14, carb:54, fat:13, fib:34, sug:10, sod:68 },
  { name:'Paprika, sweet', category:'pantry', cal:282, prot:14, carb:54, fat:13, fib:35, sug:10, sod:68 },
  { name:'Pepper, white', category:'pantry', cal:296, prot:10, carb:69, fat:2.1, fib:26, sug:0, sod:5 },
  { name:'Poppy seed', category:'pantry', cal:525, prot:18, carb:28, fat:42, fib:19.5, sug:2.9, sod:26 },
  { name:'Ras el hanout', category:'pantry', cal:290, prot:9, carb:50, fat:9, fib:0, sug:0, sod:0 },
  { name:'Red pepper flakes', category:'pantry', cal:318, prot:12, carb:57, fat:17, fib:27, sug:10, sod:30 },
  { name:'Saffron', category:'pantry', cal:310, prot:11, carb:65, fat:5.9, fib:3.9, sug:0, sod:148 },
  { name:'Star anise', category:'pantry', cal:337, prot:18, carb:50, fat:16, fib:15, sug:0, sod:16 },
  { name:'Sumac', category:'pantry', cal:179, prot:3.5, carb:27, fat:6, fib:0, sug:0, sod:3 },
  { name:'Turmeric, ground', category:'pantry', cal:354, prot:8, carb:65, fat:10, fib:21, sug:3.2, sod:38 },
  { name:'Vanilla bean', category:'pantry', cal:288, prot:0.1, carb:13, fat:0.1, fib:0, sug:0, sod:9 },
  { name:'Za\'atar', category:'pantry', cal:302, prot:10, carb:44, fat:12, fib:0, sug:0, sod:0 },
];

/* ─── PANTRY — oils, vinegars, condiments ───────────────────────────────── */
const CONDIMENTS: Ing[] = [
  { name:'Apple cider vinegar', category:'pantry', cal:22, prot:0, carb:0.9, fat:0, fib:0, sug:0.4, sod:5 },
  { name:'Balsamic vinegar', category:'pantry', cal:88, prot:0.5, carb:17, fat:0, fib:0, sug:15, sod:23 },
  { name:'Black vinegar (Chinkiang)', category:'pantry', cal:18, prot:0, carb:4, fat:0, fib:0, sug:0, sod:0 },
  { name:'Coconut aminos', category:'pantry', cal:20, prot:0, carb:5, fat:0, fib:0, sug:4, sod:430 },
  { name:'Dijon mustard', category:'pantry', cal:66, prot:3.7, carb:5.3, fat:4, fib:0, sug:1.5, sod:1104 },
  { name:'Fish sauce', category:'pantry', cal:35, prot:5.1, carb:3.6, fat:0, fib:0, sug:3.6, sod:5765 },
  { name:'Gochujang', category:'pantry', cal:120, prot:3.6, carb:25, fat:1.3, fib:0, sug:15, sod:1380 },
  { name:'Hoisin sauce', category:'pantry', cal:220, prot:3.5, carb:42, fat:3.5, fib:1.7, sug:26, sod:1960 },
  { name:'Honey', category:'pantry', cal:304, prot:0.3, carb:82, fat:0, fib:0.2, sug:82, sod:4 },
  { name:'Horseradish, prepared', category:'pantry', cal:48, prot:1.2, carb:11, fat:0.7, fib:3.3, sug:4, sod:314 },
  { name:'Ketchup', category:'pantry', cal:112, prot:1.7, carb:26, fat:0.3, fib:0.4, sug:21, sod:976 },
  { name:'Maple syrup', category:'pantry', cal:260, prot:0, carb:67, fat:0.1, fib:0, sug:60, sod:12 },
  { name:'Mayonnaise', category:'pantry', cal:680, prot:1, carb:0.6, fat:75, fib:0, sug:0.6, sod:635 },
  { name:'Miso paste', category:'pantry', cal:199, prot:12, carb:27, fat:6, fib:5.4, sug:6, sod:3728 },
  { name:'Molasses', category:'pantry', cal:290, prot:0, carb:75, fat:0, fib:0, sug:55, sod:37 },
  { name:'Oyster sauce', category:'pantry', cal:51, prot:1.1, carb:10, fat:0.3, fib:0, sug:4, sod:2733 },
  { name:'Pomegranate molasses', category:'pantry', cal:267, prot:0, carb:68, fat:0, fib:0, sug:60, sod:0 },
  { name:'Rice vinegar', category:'pantry', cal:18, prot:0, carb:0.04, fat:0, fib:0, sug:0, sod:5 },
  { name:'Sambal oelek', category:'pantry', cal:35, prot:1.5, carb:6, fat:0.5, fib:0, sug:4, sod:1230 },
  { name:'Shaoxing wine', category:'pantry', cal:60, prot:0, carb:5, fat:0, fib:0, sug:0, sod:0 },
  { name:'Sherry vinegar', category:'pantry', cal:49, prot:0, carb:11, fat:0, fib:0, sug:1, sod:26 },
  { name:'Sriracha', category:'pantry', cal:35, prot:1, carb:8, fat:0.7, fib:0, sug:5, sod:930 },
  { name:'Tahini', category:'pantry', cal:595, prot:17, carb:21, fat:54, fib:9.3, sug:0.5, sod:115 },
  { name:'Tamari', category:'pantry', cal:60, prot:11, carb:6, fat:0, fib:0.1, sug:1.7, sod:5890 },
  { name:'Tamarind paste', category:'pantry', cal:278, prot:3.4, carb:73, fat:0.6, fib:5.1, sug:47, sod:28 },
  { name:'White wine vinegar', category:'pantry', cal:18, prot:0, carb:0, fat:0, fib:0, sug:0, sod:2 },
  { name:'Worcestershire sauce', category:'pantry', cal:78, prot:0, carb:19, fat:0, fib:0, sug:12, sod:980 },
];

/* ─── PANTRY — grains, legumes, baking ──────────────────────────────────── */
const PANTRY_STAPLES: Ing[] = [
  { name:'Adzuki beans', category:'pantry', cal:128, prot:7.5, carb:25, fat:0.1, fib:7.3, sug:0, sod:8 },
  { name:'Amaranth grain', category:'pantry', cal:371, prot:14, carb:65, fat:7, fib:6.7, sug:1.7, sod:4 },
  { name:'Arborio rice', category:'pantry', cal:355, prot:6.7, carb:79, fat:0.6, fib:0, sug:0, sod:2 },
  { name:'Arrowroot starch', category:'pantry', cal:357, prot:0.3, carb:88, fat:0.1, fib:3.4, sug:0, sod:2 },
  { name:'Baking powder', category:'pantry', cal:53, prot:0, carb:28, fat:0, fib:0.2, sug:0, sod:10600 },
  { name:'Baking soda', category:'pantry', cal:0, prot:0, carb:0, fat:0, fib:0, sug:0, sod:27360 },
  { name:'Basmati rice', category:'pantry', cal:356, prot:7, carb:80, fat:0.7, fib:1.3, sug:0, sod:1 },
  { name:'Black-eyed peas', category:'pantry', cal:116, prot:8, carb:21, fat:0.5, fib:6.5, sug:3.3, sod:4 },
  { name:'Brown lentils', category:'pantry', cal:116, prot:9, carb:20, fat:0.4, fib:7.9, sug:1.8, sod:2 },
  { name:'Brown rice', category:'pantry', cal:216, prot:5, carb:45, fat:1.8, fib:3.5, sug:0.7, sod:5 },
  { name:'Buckwheat groats', category:'pantry', cal:343, prot:13, carb:72, fat:3.4, fib:10, sug:0, sod:1 },
  { name:'Bulgur wheat', category:'pantry', cal:342, prot:12, carb:76, fat:1.3, fib:18.3, sug:0.4, sod:17 },
  { name:'Cannellini beans', category:'pantry', cal:127, prot:8.7, carb:22, fat:0.5, fib:6.3, sug:0.3, sod:5 },
  { name:'Chickpea flour', category:'pantry', cal:387, prot:22, carb:58, fat:6.7, fib:10.8, sug:10.8, sod:64 },
  { name:'Coconut flour', category:'pantry', cal:400, prot:19, carb:60, fat:13, fib:40, sug:9, sod:28 },
  { name:'Cornmeal', category:'pantry', cal:362, prot:8.1, carb:77, fat:3.6, fib:7.3, sug:0.6, sod:5 },
  { name:'Cornstarch', category:'pantry', cal:381, prot:0.3, carb:91, fat:0.1, fib:0.9, sug:0, sod:9 },
  { name:'Couscous', category:'pantry', cal:376, prot:13, carb:77, fat:0.6, fib:5, sug:0.4, sod:10 },
  { name:'Dried black beans', category:'pantry', cal:341, prot:22, carb:63, fat:1.4, fib:15.5, sug:0.6, sod:5 },
  { name:'Dried kidney beans', category:'pantry', cal:337, prot:22, carb:61, fat:1.1, fib:15.2, sug:2.2, sod:24 },
  { name:'Dried pinto beans', category:'pantry', cal:347, prot:21, carb:63, fat:1.2, fib:15.5, sug:2.1, sod:12 },
  { name:'Farro', category:'pantry', cal:340, prot:14, carb:67, fat:2.5, fib:7, sug:0, sod:0 },
  { name:'Freekeh', category:'pantry', cal:364, prot:16, carb:71, fat:2.7, fib:16, sug:0, sod:0 },
  { name:'Glutinous rice', category:'pantry', cal:370, prot:6.8, carb:80, fat:0.6, fib:2.8, sug:0, sod:10 },
  { name:'Jasmine rice', category:'pantry', cal:365, prot:7, carb:80, fat:0.6, fib:0.7, sug:0, sod:1 },
  { name:'Kamut', category:'pantry', cal:337, prot:14.7, carb:70, fat:2.2, fib:11, sug:0, sod:0 },
  { name:'Millet', category:'pantry', cal:378, prot:11, carb:73, fat:4.2, fib:8.5, sug:0, sod:5 },
  { name:'Mung beans', category:'pantry', cal:347, prot:24, carb:63, fat:1.2, fib:16, sug:6.6, sod:15 },
  { name:'Oat bran', category:'pantry', cal:246, prot:17, carb:66, fat:7, fib:15.4, sug:0, sod:4 },
  { name:'Panko breadcrumbs', category:'pantry', cal:395, prot:11, carb:77, fat:4.8, fib:3.2, sug:5.7, sod:736 },
  { name:'Pearl barley', category:'pantry', cal:352, prot:10, carb:78, fat:1.2, fib:15.6, sug:0.8, sod:12 },
  { name:'Polenta', category:'pantry', cal:362, prot:8.1, carb:77, fat:3.6, fib:7.3, sug:0.6, sod:5 },
  { name:'Quinoa', category:'pantry', cal:368, prot:14, carb:64, fat:6.1, fib:7, sug:0, sod:5 },
  { name:'Red lentils', category:'pantry', cal:116, prot:9, carb:20, fat:0.4, fib:7.9, sug:1.8, sod:2 },
  { name:'Rice flour', category:'pantry', cal:366, prot:5.9, carb:80, fat:1.4, fib:2.4, sug:0.1, sod:0 },
  { name:'Rolled oats', category:'pantry', cal:389, prot:17, carb:66, fat:7, fib:10.6, sug:0, sod:6 },
  { name:'Rye flour', category:'pantry', cal:325, prot:8.2, carb:69, fat:1.6, fib:15.1, sug:1, sod:1 },
  { name:'Semolina', category:'pantry', cal:360, prot:13, carb:73, fat:1, fib:3.9, sug:0.8, sod:1 },
  { name:'Sorghum', category:'pantry', cal:329, prot:10.6, carb:72, fat:3.5, fib:6.3, sug:0, sod:2 },
  { name:'Spelt flour', category:'pantry', cal:338, prot:15, carb:70, fat:2.4, fib:10, sug:0, sod:0 },
  { name:'Split peas', category:'pantry', cal:341, prot:24, carb:60, fat:1.2, fib:26, sug:8, sod:15 },
  { name:'Teff', category:'pantry', cal:367, prot:13, carb:73, fat:2.4, fib:8, sug:1.8, sod:12 },
  { name:'White miso', category:'pantry', cal:183, prot:10, carb:26, fat:5, fib:3.2, sug:11, sod:3520 },
  { name:'Whole wheat flour', category:'pantry', cal:340, prot:13, carb:72, fat:2.5, fib:10.7, sug:0.4, sod:2 },
  { name:'Wild rice', category:'pantry', cal:357, prot:15, carb:75, fat:1.1, fib:6.2, sug:2.5, sod:7 },
  { name:'Yeast, active dry', category:'pantry', cal:325, prot:40, carb:41, fat:7.6, fib:26, sug:0, sod:51 },
];

/* ─── PANTRY — nuts & seeds ──────────────────────────────────────────────── */
const NUTS_SEEDS: Ing[] = [
  { name:'Brazil nut', category:'pantry', cal:659, prot:14, carb:12, fat:67, fib:7.5, sug:2.3, sod:3 },
  { name:'Chia seeds', category:'pantry', cal:486, prot:17, carb:42, fat:31, fib:34, sug:0, sod:16 },
  { name:'Coconut, desiccated', category:'pantry', cal:660, prot:6.9, carb:24, fat:65, fib:16.3, sug:6.7, sod:37 },
  { name:'Coconut, fresh', category:'pantry', cal:354, prot:3.3, carb:15, fat:33, fib:9, sug:6.2, sod:20 },
  { name:'Flaxseed', category:'pantry', cal:534, prot:18, carb:29, fat:42, fib:27.3, sug:1.6, sod:30 },
  { name:'Hemp seeds', category:'pantry', cal:553, prot:32, carb:8.7, fat:49, fib:4, sug:1.5, sod:5 },
  { name:'Macadamia nut', category:'pantry', cal:718, prot:7.9, carb:14, fat:76, fib:8.6, sug:4.6, sod:5 },
  { name:'Peanut butter', category:'pantry', cal:588, prot:25, carb:20, fat:50, fib:6, sug:9, sod:429 },
  { name:'Pecan', category:'pantry', cal:691, prot:9.2, carb:14, fat:72, fib:9.6, sug:3.9, sod:0 },
  { name:'Pine nut', category:'pantry', cal:673, prot:14, carb:13, fat:68, fib:3.7, sug:3.6, sod:2 },
  { name:'Pistachio', category:'pantry', cal:562, prot:20, carb:28, fat:45, fib:10.6, sug:7.7, sod:1 },
  { name:'Poppy seeds', category:'pantry', cal:525, prot:18, carb:28, fat:42, fib:19.5, sug:2.9, sod:26 },
  { name:'Pumpkin seeds', category:'pantry', cal:559, prot:30, carb:11, fat:49, fib:6, sug:1.4, sod:7 },
  { name:'Sesame seeds', category:'pantry', cal:573, prot:18, carb:23, fat:50, fib:11.8, sug:0.3, sod:11 },
  { name:'Sunflower seeds', category:'pantry', cal:584, prot:21, carb:20, fat:51, fib:8.6, sug:2.6, sod:9 },
  { name:'Walnut', category:'pantry', cal:654, prot:15, carb:14, fat:65, fib:6.7, sug:2.6, sod:2 },
];

/* ─── DAIRY ──────────────────────────────────────────────────────────────── */
const DAIRY: Ing[] = [
  { name:'Blue cheese', category:'dairy', cal:353, prot:21, carb:2.3, fat:29, fib:0, sug:0.5, sod:1395 },
  { name:'Brie', category:'dairy', cal:334, prot:21, carb:0.5, fat:28, fib:0, sug:0.5, sod:629 },
  { name:'Burrata', category:'dairy', cal:300, prot:17, carb:0, fat:26, fib:0, sug:0, sod:380 },
  { name:'Buttermilk', category:'dairy', cal:40, prot:3.3, carb:4.8, fat:0.9, fib:0, sug:4.8, sod:105 },
  { name:'Camembert', category:'dairy', cal:300, prot:20, carb:0.5, fat:24, fib:0, sug:0.5, sod:842 },
  { name:'Clotted cream', category:'dairy', cal:586, prot:2.2, carb:2.7, fat:63, fib:0, sug:2.7, sod:28 },
  { name:'Colby cheese', category:'dairy', cal:394, prot:24, carb:2.6, fat:32, fib:0, sug:0.5, sod:604 },
  { name:'Condensed milk, sweetened', category:'dairy', cal:321, prot:8, carb:54, fat:9, fib:0, sug:54, sod:127 },
  { name:'Cottage cheese', category:'dairy', cal:98, prot:11, carb:3.4, fat:4.3, fib:0, sug:2.7, sod:364 },
  { name:'Cream cheese', category:'dairy', cal:342, prot:6, carb:4.1, fat:34, fib:0, sug:3.2, sod:321 },
  { name:'Crème fraîche', category:'dairy', cal:292, prot:2.1, carb:2.9, fat:30, fib:0, sug:2.9, sod:40 },
  { name:'Edam cheese', category:'dairy', cal:357, prot:25, carb:1.4, fat:28, fib:0, sug:0, sod:965 },
  { name:'Evaporated milk', category:'dairy', cal:134, prot:6.8, carb:10, fat:7.6, fib:0, sug:10, sod:106 },
  { name:'Fontina cheese', category:'dairy', cal:389, prot:25, carb:1.6, fat:31, fib:0, sug:0.5, sod:800 },
  { name:'Ghee', category:'dairy', cal:900, prot:0, carb:0, fat:100, fib:0, sug:0, sod:2 },
  { name:'Goat cheese (chèvre)', category:'dairy', cal:364, prot:22, carb:2.5, fat:30, fib:0, sug:1.5, sod:368 },
  { name:'Gouda cheese', category:'dairy', cal:356, prot:25, carb:2.2, fat:28, fib:0, sug:2.2, sod:819 },
  { name:'Gruyère', category:'dairy', cal:413, prot:30, carb:0.4, fat:32, fib:0, sug:0.4, sod:336 },
  { name:'Half-and-half', category:'dairy', cal:130, prot:3, carb:4.3, fat:12, fib:0, sug:4, sod:52 },
  { name:'Halloumi', category:'dairy', cal:316, prot:24, carb:2, fat:25, fib:0, sug:0, sod:1580 },
  { name:'Heavy cream', category:'dairy', cal:340, prot:2.1, carb:2.8, fat:36, fib:0, sug:2.8, sod:38 },
  { name:'Havarti cheese', category:'dairy', cal:371, prot:23, carb:2, fat:30, fib:0, sug:0, sod:700 },
  { name:'Kefir', category:'dairy', cal:61, prot:3.5, carb:4.7, fat:3.5, fib:0, sug:4.7, sod:40 },
  { name:'Labneh', category:'dairy', cal:166, prot:8, carb:4, fat:13, fib:0, sug:4, sod:62 },
  { name:'Manchego', category:'dairy', cal:395, prot:26, carb:0, fat:32, fib:0, sug:0, sod:524 },
  { name:'Mascarpone', category:'dairy', cal:429, prot:4.2, carb:3.6, fat:44, fib:0, sug:3.6, sod:53 },
  { name:'Milk, 2%', category:'dairy', cal:50, prot:3.4, carb:5, fat:2, fib:0, sug:5, sod:41 },
  { name:'Milk, whole', category:'dairy', cal:61, prot:3.2, carb:4.8, fat:3.3, fib:0, sug:5.1, sod:43 },
  { name:'Monterey Jack', category:'dairy', cal:373, prot:24, carb:0.7, fat:30, fib:0, sug:0.7, sod:536 },
  { name:'Pecorino Romano', category:'dairy', cal:387, prot:32, carb:3.6, fat:27, fib:0, sug:0, sod:1200 },
  { name:'Provolone', category:'dairy', cal:351, prot:26, carb:2.1, fat:27, fib:0, sug:0.6, sod:876 },
  { name:'Queso fresco', category:'dairy', cal:290, prot:18, carb:3, fat:23, fib:0, sug:0, sod:600 },
  { name:'Ricotta, whole milk', category:'dairy', cal:174, prot:11, carb:3, fat:13, fib:0, sug:0.3, sod:84 },
  { name:'Skyr', category:'dairy', cal:65, prot:11, carb:4, fat:0.2, fib:0, sug:4, sod:44 },
  { name:'Sour cream', category:'dairy', cal:198, prot:2.4, carb:4.6, fat:19, fib:0, sug:4.6, sod:53 },
  { name:'Whipping cream', category:'dairy', cal:292, prot:2.2, carb:2.8, fat:30, fib:0, sug:2.8, sod:27 },
];

/* ─── MEAT ───────────────────────────────────────────────────────────────── */
const MEAT: Ing[] = [
  { name:'Beef brisket', category:'meat', cal:266, prot:26, carb:0, fat:18, fib:0, sug:0, sod:64 },
  { name:'Beef chuck', category:'meat', cal:215, prot:26, carb:0, fat:12, fib:0, sug:0, sod:68 },
  { name:'Beef ribeye', category:'meat', cal:291, prot:24, carb:0, fat:21, fib:0, sug:0, sod:60 },
  { name:'Beef short ribs', category:'meat', cal:310, prot:22, carb:0, fat:25, fib:0, sug:0, sod:55 },
  { name:'Beef sirloin', category:'meat', cal:207, prot:29, carb:0, fat:10, fib:0, sug:0, sod:55 },
  { name:'Beef tenderloin', category:'meat', cal:215, prot:28, carb:0, fat:11, fib:0, sug:0, sod:58 },
  { name:'Bologna', category:'meat', cal:310, prot:11, carb:3.2, fat:28, fib:0, sug:2, sod:1020 },
  { name:'Chicken drumstick', category:'meat', cal:172, prot:28, carb:0, fat:6, fib:0, sug:0, sod:87 },
  { name:'Chicken thigh', category:'meat', cal:209, prot:26, carb:0, fat:11, fib:0, sug:0, sod:88 },
  { name:'Chicken whole', category:'meat', cal:215, prot:18, carb:0, fat:15, fib:0, sug:0, sod:75 },
  { name:'Chicken wing', category:'meat', cal:203, prot:18, carb:0, fat:14, fib:0, sug:0, sod:73 },
  { name:'Chorizo', category:'meat', cal:455, prot:24, carb:2, fat:40, fib:0, sug:0, sod:1235 },
  { name:'Duck breast', category:'meat', cal:201, prot:19, carb:0, fat:13, fib:0, sug:0, sod:65 },
  { name:'Duck confit', category:'meat', cal:330, prot:19, carb:0, fat:28, fib:0, sug:0, sod:700 },
  { name:'Ground beef, 80% lean', category:'meat', cal:254, prot:26, carb:0, fat:17, fib:0, sug:0, sod:72 },
  { name:'Ground lamb', category:'meat', cal:282, prot:23, carb:0, fat:21, fib:0, sug:0, sod:75 },
  { name:'Ground pork', category:'meat', cal:263, prot:22, carb:0, fat:19, fib:0, sug:0, sod:62 },
  { name:'Ground turkey', category:'meat', cal:189, prot:22, carb:0, fat:11, fib:0, sug:0, sod:82 },
  { name:'Ham, cured', category:'meat', cal:145, prot:21, carb:1.5, fat:6, fib:0, sug:1.5, sod:1203 },
  { name:'Italian sausage', category:'meat', cal:339, prot:14, carb:3.4, fat:30, fib:0, sug:0, sod:734 },
  { name:'Lamb chop', category:'meat', cal:294, prot:25, carb:0, fat:21, fib:0, sug:0, sod:72 },
  { name:'Lamb leg', category:'meat', cal:217, prot:28, carb:0, fat:11, fib:0, sug:0, sod:70 },
  { name:'Lamb rack', category:'meat', cal:294, prot:25, carb:0, fat:21, fib:0, sug:0, sod:72 },
  { name:'Liver, beef', category:'meat', cal:175, prot:27, carb:4, fat:5, fib:0, sug:0, sod:76 },
  { name:'Liver, chicken', category:'meat', cal:172, prot:24, carb:1, fat:7.5, fib:0, sug:0, sod:71 },
  { name:'Pancetta', category:'meat', cal:420, prot:17, carb:1, fat:39, fib:0, sug:0, sod:1700 },
  { name:'Pork belly', category:'meat', cal:518, prot:9.3, carb:0, fat:53, fib:0, sug:0, sod:42 },
  { name:'Pork chop', category:'meat', cal:187, prot:27, carb:0, fat:8, fib:0, sug:0, sod:51 },
  { name:'Pork loin', category:'meat', cal:165, prot:29, carb:0, fat:4.7, fib:0, sug:0, sod:54 },
  { name:'Prosciutto', category:'meat', cal:217, prot:29, carb:0.3, fat:11, fib:0, sug:0, sod:2270 },
  { name:'Salami', category:'meat', cal:336, prot:19, carb:1.9, fat:28, fib:0, sug:0, sod:1890 },
  { name:'Turkey breast', category:'meat', cal:135, prot:30, carb:0, fat:1, fib:0, sug:0, sod:50 },
  { name:'Veal cutlet', category:'meat', cal:151, prot:26, carb:0, fat:4, fib:0, sug:0, sod:69 },
  { name:'Venison', category:'meat', cal:158, prot:30, carb:0, fat:3.2, fib:0, sug:0, sod:54 },
];

/* ─── SEAFOOD ────────────────────────────────────────────────────────────── */
const SEAFOOD: Ing[] = [
  { name:'Arctic char', category:'seafood', cal:168, prot:23, carb:0, fat:8, fib:0, sug:0, sod:47 },
  { name:'Barramundi', category:'seafood', cal:124, prot:21, carb:0, fat:4, fib:0, sug:0, sod:85 },
  { name:'Black sea bass', category:'seafood', cal:97, prot:18, carb:0, fat:2, fib:0, sug:0, sod:68 },
  { name:'Branzino (sea bass)', category:'seafood', cal:124, prot:24, carb:0, fat:3, fib:0, sug:0, sod:80 },
  { name:'Clam', category:'seafood', cal:148, prot:26, carb:5.1, fat:2, fib:0, sug:0, sod:112 },
  { name:'Crab, Dungeness', category:'seafood', cal:86, prot:18, carb:0.7, fat:1, fib:0, sug:0, sod:295 },
  { name:'Crab, king', category:'seafood', cal:84, prot:18, carb:0, fat:0.6, fib:0, sug:0, sod:836 },
  { name:'Crawfish', category:'seafood', cal:82, prot:17, carb:0, fat:1.2, fib:0, sug:0, sod:97 },
  { name:'Flounder', category:'seafood', cal:91, prot:18, carb:0, fat:1.9, fib:0, sug:0, sod:81 },
  { name:'Geoduck clam', category:'seafood', cal:104, prot:19, carb:4.6, fat:1.5, fib:0, sug:0, sod:188 },
  { name:'Grouper', category:'seafood', cal:92, prot:19, carb:0, fat:1, fib:0, sug:0, sod:53 },
  { name:'Halibut', category:'seafood', cal:111, prot:23, carb:0, fat:2.3, fib:0, sug:0, sod:54 },
  { name:'Lobster', category:'seafood', cal:98, prot:18, carb:1.3, fat:1.9, fib:0, sug:0, sod:380 },
  { name:'Mackerel', category:'seafood', cal:205, prot:19, carb:0, fat:14, fib:0, sug:0, sod:90 },
  { name:'Mahi-mahi', category:'seafood', cal:109, prot:24, carb:0, fat:0.9, fib:0, sug:0, sod:113 },
  { name:'Mussel', category:'seafood', cal:172, prot:24, carb:7.4, fat:4.5, fib:0, sug:0, sod:369 },
  { name:'Octopus', category:'seafood', cal:164, prot:30, carb:4.4, fat:2.1, fib:0, sug:0, sod:460 },
  { name:'Oyster', category:'seafood', cal:81, prot:9.5, carb:4.9, fat:2.3, fib:0, sug:0, sod:417 },
  { name:'Pollock', category:'seafood', cal:111, prot:23, carb:0, fat:1.5, fib:0, sug:0, sod:112 },
  { name:'Sardine', category:'seafood', cal:208, prot:25, carb:0, fat:11, fib:0, sug:0, sod:505 },
  { name:'Scallop', category:'seafood', cal:88, prot:17, carb:2.4, fat:0.8, fib:0, sug:0, sod:392 },
  { name:'Shrimp', category:'seafood', cal:99, prot:24, carb:0.2, fat:0.3, fib:0, sug:0, sod:111 },
  { name:'Snapper', category:'seafood', cal:100, prot:21, carb:0, fat:1.3, fib:0, sug:0, sod:64 },
  { name:'Squid', category:'seafood', cal:92, prot:16, carb:3.1, fat:1.4, fib:0, sug:0, sod:44 },
  { name:'Swordfish', category:'seafood', cal:172, prot:28, carb:0, fat:5.7, fib:0, sug:0, sod:115 },
  { name:'Tilapia', category:'seafood', cal:96, prot:20, carb:0, fat:1.7, fib:0, sug:0, sod:52 },
  { name:'Trout', category:'seafood', cal:150, prot:21, carb:0, fat:7, fib:0, sug:0, sod:52 },
  { name:'Tuna, bluefin', category:'seafood', cal:144, prot:23, carb:0, fat:5, fib:0, sug:0, sod:39 },
  { name:'Tuna, yellowfin', category:'seafood', cal:109, prot:24, carb:0, fat:1, fib:0, sug:0, sod:45 },
  { name:'Uni (sea urchin)', category:'seafood', cal:172, prot:13, carb:12, fat:6, fib:0, sug:0, sod:217 },
];

/* ─── BEVERAGES ──────────────────────────────────────────────────────────── */
const BEVERAGES: Ing[] = [
  { name:'Black coffee', category:'beverage', cal:2, prot:0.3, carb:0, fat:0, fib:0, sug:0, sod:2 },
  { name:'Coconut water', category:'beverage', cal:19, prot:0.7, carb:3.7, fat:0.2, fib:1.1, sug:2.6, sod:105 },
  { name:'Cold brew coffee', category:'beverage', cal:5, prot:0.5, carb:0, fat:0, fib:0, sug:0, sod:10 },
  { name:'Espresso', category:'beverage', cal:9, prot:0.1, carb:1.7, fat:0.2, fib:0, sug:0, sod:14 },
  { name:'Green tea', category:'beverage', cal:1, prot:0, carb:0, fat:0, fib:0, sug:0, sod:1 },
  { name:'Herbal tea', category:'beverage', cal:2, prot:0, carb:0.4, fat:0, fib:0, sug:0, sod:1 },
  { name:'Matcha', category:'beverage', cal:7, prot:0.5, carb:1, fat:0.1, fib:0, sug:0, sod:0 },
  { name:'Oat milk', category:'beverage', cal:49, prot:1.3, carb:6.9, fat:1.5, fib:0.5, sug:4, sod:60 },
  { name:'Sake', category:'beverage', cal:134, prot:0.5, carb:5, fat:0, fib:0, sug:0, sod:2 },
  { name:'Soy milk', category:'beverage', cal:33, prot:2.9, carb:1.6, fat:1.8, fib:0.6, sug:1.1, sod:50 },
];

const ALL_INGREDIENTS: Ing[] = [
  ...VEGETABLES,
  ...FRUITS,
  ...FRESH_HERBS,
  ...SPICES,
  ...CONDIMENTS,
  ...PANTRY_STAPLES,
  ...NUTS_SEEDS,
  ...DAIRY,
  ...MEAT,
  ...SEAFOOD,
  ...BEVERAGES,
];

async function main() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const existingNames = new Set<string>(
    (sqlite.prepare('SELECT name FROM wiki_ingredients').all() as { name: string }[]).map((r) => r.name)
  );

  const insertIngredient = sqlite.prepare(`
    INSERT INTO wiki_ingredients (id, name, description, category, subcategory, origin, seasons, flavor_profile, usda_fdc_id, flavor_graph_id, image_url, aliases, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertNutrition = sqlite.prepare(`
    INSERT INTO wiki_nutrition (ingredient_id, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, serving_size_g, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 100, 'curated')
  `);

  let inserted = 0;
  let skipped = 0;
  const ts = Math.floor(Date.now() / 1000);

  const insertMany = sqlite.transaction(() => {
    for (const ing of ALL_INGREDIENTS) {
      if (existingNames.has(ing.name)) { skipped++; continue; }
      const id = ulid();
      const category = ing.category ?? inferCategory(ing.name);
      insertIngredient.run(
        id, ing.name, ing.description ?? null, category,
        ing.subcategory ?? null, ing.origin ?? null,
        ing.seasons ? JSON.stringify(ing.seasons) : null,
        null, null, null, null, null, ts, ts
      );
      insertNutrition.run(
        id,
        ing.cal ?? null,
        ing.prot ?? null,
        ing.carb ?? null,
        ing.fat ?? null,
        ing.fib ?? null,
        ing.sug ?? null,
        ing.sod ?? null,
      );
      existingNames.add(ing.name);
      inserted++;
    }
  });

  insertMany();
  sqlite.close();

  console.log(`✅ Curated seed complete — ${inserted} inserted, ${skipped} already existed`);
  console.log(`   Total in dataset: ${ALL_INGREDIENTS.length}`);

  // Summary
  const db2 = new Database(DB_PATH);
  const total = (db2.prepare('SELECT COUNT(*) as n FROM wiki_ingredients').get() as { n: number }).n;
  const cats = db2.prepare('SELECT category, COUNT(*) as n FROM wiki_ingredients GROUP BY category ORDER BY n DESC').all() as { category: string; n: number }[];
  db2.close();

  console.log(`\nWiki total: ${total} ingredients`);
  cats.forEach((r) => console.log(`  ${r.n.toString().padStart(4)}  ${r.category}`));
}

main().catch((err) => { console.error(err); process.exit(1); });
