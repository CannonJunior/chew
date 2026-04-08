#!/usr/bin/env tsx
/**
 * Curated chef & food social sources seed.
 * Safe to re-run — skips sources whose URL is already present.
 *
 * Usage:  npx tsx lib/seed/social-sources.ts
 */
import Database from 'better-sqlite3';
import path from 'path';
import { ulid } from 'ulid';

const DB_PATH = path.join(process.cwd(), 'chew.db');

type Source = {
  name: string;
  type: 'youtube_atom' | 'rss' | 'reddit_rss';
  url: string;
};

// YouTube Atom feed URL helper
const yt = (channelId: string) =>
  `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

// Reddit RSS helper
const reddit = (sub: string) => `https://www.reddit.com/r/${sub}/.rss`;

const SOURCES: Source[] = [
  // ── YouTube chef channels ──────────────────────────────────────────────────
  // Channel IDs extracted from YouTube page metadata.
  {
    name: "Andy Cooks",
    type: "youtube_atom",
    url: yt("UCB2kVwJM7adiyjbssntEaUQ"),
    // Andy Hearnden — fine-dining chef turned YouTube teacher, ex-Rockpool.
    // High production quality; practical restaurant techniques for home cooks.
  },
  {
    name: "Food Wishes (Chef John)",
    type: "youtube_atom",
    url: yt("UCRIZtPl9nb9RiXc9btSTQNw"),
    // Chef John Mitzewich — over 1,500 recipes, deadpan narration, Allrecipes alumni.
    // Best for classics done right: stocks, braises, pastry fundamentals.
  },
  {
    name: "Joshua Weissman",
    type: "youtube_atom",
    url: yt("UChBEbMKI1eCcejTtmI32UEw"),
    // Culinary school grad turned creator — "But Better" fast-food copycat series
    // and fermentation deep-dives. Strong on baking and bread.
  },
  {
    name: "Ethan Chlebowski",
    type: "youtube_atom",
    url: yt("UCDq5v10l4wkV5-ZBIJJFbzQ"),
    // Data-driven cooking — controlled experiments on technique, gear reviews,
    // and nutrition. Companion to Kenji Lopez-Alt's writing.
  },
  {
    name: "Guga Foods",
    type: "youtube_atom",
    url: yt("UCfE5Cz44GlZVyoaYTHJbuZw"),
    // Gustavo Tosta — dry-aging, wagyu, and steak experiments.
    // Obsessive meat science; good for understanding high-heat technique.
  },
  {
    name: "Brian Lagerstrom",
    type: "youtube_atom",
    url: yt("UCn5fhcGRrCvrmFibPbT6q1A"),
    // Former professional baker and restaurant chef. Bread, pizza, and weeknight
    // dinners grounded in real kitchen experience rather than content-farm recipes.
  },
  {
    name: "Jacques Pépin Foundation",
    type: "youtube_atom",
    url: yt("UCB2XJXj7dDhK7HscFIJf_UQ"),
    // Archive of Jacques Pépin's PBS specials and Foundation events. Irreplaceable
    // classical French technique from the most important culinary educator alive.
  },
  {
    name: "Internet Shaquille",
    type: "youtube_atom",
    url: yt("UCSuT9FSddzI6W5Bij9XwtmA"),
    // Short-form food science and recipe failures explained. Best channel for
    // understanding *why* things go wrong — the food-adjacent YouTube lane.
  },

  // ── Chef & food blogs (RSS) ────────────────────────────────────────────────
  {
    name: "Smitten Kitchen",
    type: "rss",
    url: "https://feeds.feedburner.com/smittenkitchen",
    // Deb Perelman — meticulous home cook writing from a small NYC kitchen.
    // Every recipe is tested obsessively. Strong on baking and seasonal produce.
  },
  {
    name: "David Lebovitz",
    type: "rss",
    url: "https://www.davidlebovitz.com/feed/",
    // Former Chez Panisse pastry chef, now Paris-based. Ice cream authority;
    // excellent on French technique, ingredient sourcing, and food travel.
  },
  {
    name: "Bon Appétit",
    type: "rss",
    url: "https://www.bonappetit.com/feed/rss",
    // Restaurant-world recipes adapted for home — strong on flavour-forward
    // weeknight cooking. Good signal on what professional kitchens are doing.
  },
  {
    name: "The Kitchn",
    type: "rss",
    url: "https://www.thekitchn.com/main.rss",
    // Practical home cooking — equipment reviews, technique explainers, and
    // seasonal recipes. Highest volume of the RSS sources; good daily browse.
  },

  // ── Reddit communities ─────────────────────────────────────────────────────
  {
    name: "r/AskCulinary",
    type: "reddit_rss",
    url: reddit("AskCulinary"),
    // Q&A answered by professional chefs and serious home cooks. Best community
    // for troubleshooting technique, understanding food science, and equipment.
  },
  {
    name: "r/GifRecipes",
    type: "reddit_rss",
    url: reddit("GifRecipes"),
    // Short-form video recipes — good for quickly scanning new dish ideas
    // and spotting trending flavour combinations.
  },
  {
    name: "r/Chefit",
    type: "reddit_rss",
    url: reddit("Chefit"),
    // Professional cooks and chefs sharing kitchen realities: plating, mise en
    // place, service stories. Industry perspective rather than home-cook optimism.
  },
  {
    name: "r/Cooking",
    type: "reddit_rss",
    url: reddit("Cooking"),
    // Large general cooking community — recipe help, technique questions, and
    // weekly ingredient challenges. Good diversity of cuisines and skill levels.
  },
];

async function main() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma('journal_mode = WAL');

  const existingUrls = new Set(
    (sqlite.prepare('SELECT url FROM social_sources').all() as { url: string }[]).map((r) => r.url),
  );

  const insert = sqlite.prepare(`
    INSERT INTO social_sources (id, name, type, url, active, last_fetched, created_at)
    VALUES (?, ?, ?, ?, 1, NULL, ?)
  `);

  const ts = Math.floor(Date.now() / 1000);
  let inserted = 0;
  let skipped = 0;

  const run = sqlite.transaction(() => {
    for (const source of SOURCES) {
      if (existingUrls.has(source.url)) {
        skipped++;
        continue;
      }
      insert.run(ulid(), source.name, source.type, source.url, ts);
      inserted++;
    }
  });

  run();
  sqlite.close();

  console.log(`✅ Social sources seeded — ${inserted} inserted, ${skipped} already existed`);
  console.log(`\nSources added:`);
  SOURCES.filter((s) => !existingUrls.has(s.url)).forEach((s) =>
    console.log(`  [${s.type}] ${s.name}`),
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
