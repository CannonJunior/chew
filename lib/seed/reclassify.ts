#!/usr/bin/env tsx
/**
 * One-time script to reclassify wiki_ingredients categories.
 * Usage: npx tsx lib/seed/reclassify.ts
 */
import Database from 'better-sqlite3';
import path from 'path';
import { inferCategory } from './categories';

const DB_PATH = path.join(process.cwd(), 'chew.db');

const sqlite = new Database(DB_PATH);
const rows = sqlite.prepare('SELECT id, name FROM wiki_ingredients').all() as { id: string; name: string }[];
const update = sqlite.prepare('UPDATE wiki_ingredients SET category = ? WHERE id = ?');

let changed = 0;
for (const row of rows) {
  update.run(inferCategory(row.name), row.id);
  changed++;
}
sqlite.close();

console.log(`Reclassified ${changed} ingredients`);

const db2 = new Database(DB_PATH);
const summary = db2.prepare('SELECT category, COUNT(*) as n FROM wiki_ingredients GROUP BY category ORDER BY n DESC').all();
console.log('\nCategory breakdown:');
for (const r of summary as { category: string; n: number }[]) {
  console.log(`  ${r.n.toString().padStart(4)}  ${r.category}`);
}
db2.close();
