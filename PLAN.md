# Chew — Food Intelligence Platform: Architecture & Implementation Plan
> Version 2.0 (post-research, iterated) — 2026-03-17

---

## 0. Vision

**Chew** is a self-hosted, AI-augmented food intelligence platform. It connects the physical kitchen (pantry, equipment) with a knowledge layer (wiki, recipes) and a context-aware AI assistant (Yes Chef), all surfaced through a clean, tab-based web interface. Everything runs locally — no subscriptions, no cloud lock-in, no API costs.

### Differentiation from Existing Apps

| Feature | Mealie | Whisk/Samsung Food | **Chew** |
|---------|--------|--------------------|----------|
| Receipt OCR → pantry | ❌ | ❌ | ✅ |
| Ingredient relationship graph | ❌ | ❌ | ✅ (FlavorGraph data) |
| Flavor pairing science | ❌ | ❌ | ✅ |
| AI chat with pantry context | ❌ | ❌ | ✅ (local Ollama) |
| Social feed curation | ❌ | ❌ | ✅ |
| Kitchen floorplan | ❌ | ❌ | ✅ |
| Recipe URL scraping | ✅ | ✅ | (Phase 2+) |
| Meal planning calendar | ✅ | ✅ | (Phase 2+) |
| Self-hosted / private | ✅ | ❌ | ✅ |

---

## 1. Top-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Next.js 15 (App Router)                         │
│                                                                           │
│  [🥦 Pantry] [📖 Wiki] [🍳 Recipes] [🏠 Kitchen] [📱 Social] [👨‍🍳 Chef]  │
│                                                                           │
│  React Server Components  ←→  Client Components (islands)                │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │  Next.js API Routes + Server Actions
┌───────────────────────────────────▼─────────────────────────────────────┐
│                           Backend Services                               │
│                                                                           │
│  Drizzle ORM (SQLite)   │  Ollama SDK (ollama-ai-provider)              │
│  Sharp (image proc)     │  rss-parser (social feeds)                    │
│  node-cron (refresh)    │  USDA + FlavorGraph seeders                   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────┐
│                            Data Layer                                    │
│                                                                           │
│  SQLite (better-sqlite3)   │  /uploads/ (local filesystem)              │
│  Ollama (llama3.2-vision,  │  FlavorGraph seed (JSON — 6,653 nodes,     │
│          llama3.2:3b)      │  147,179 edges from academic dataset)       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 15 (App Router) | SSR + API routes + Server Actions in one project |
| Language | TypeScript | Full-stack type safety |
| Styling | Tailwind CSS v4 + shadcn/ui | Fast, beautiful, accessible components |
| Data fetching | TanStack Query v5 | Server-state management with caching |
| Global state | Zustand | Lightweight client state (search, UI prefs) |
| ORM | Drizzle ORM + better-sqlite3 | Type-safe, zero-config, portable SQLite |
| AI (chat) | Vercel AI SDK + `ollama-ai-provider` | `useChat` hook, streaming SSE, Ollama native |
| AI (vision) | Ollama `llama3.2-vision:11b` | Best local receipt OCR; trained on 6B image-text pairs |
| Ingredient graph | Cytoscape.js + `react-cytoscapejs` | Best-in-class graph lib; cose-bilkent layout |
| Canvas | Konva.js + `react-konva` | Built-in Transformer (resize/rotate), drag-drop, hit detection |
| Image proc | Sharp | Server-side resize, grayscale, contrast for receipts |
| File upload | react-dropzone | Drag-drop, file type validation |
| Scheduling | node-cron | Social feed background refresh |
| RSS parsing | rss-parser | Handles RSS, Atom, Reddit `.rss`, YouTube Atom feeds |
| Markdown | react-markdown + remark-gfm | Render AI responses |
| Charts | Recharts | Nutrition radar + bar charts |
| IDs | ulid | Sortable unique IDs |

---

## 2. Database Schema (Drizzle + SQLite)

### 2.1 Pantry

```typescript
// receipts — source images uploaded by user
receipts: {
  id: text (ULID, PK)
  imagePath: text          // /uploads/receipts/{id}.jpg
  uploadDate: integer      // unix timestamp
  processed: integer       // 0 | 1 bool
  rawLlmOutput: text       // raw JSON string from llama3.2-vision
  itemCount: integer
  merchantName: text       // extracted if available
  receiptDate: integer     // date on the receipt
}

// groceryItems — items extracted from receipts + manual adds
groceryItems: {
  id: text (ULID, PK)
  receiptId: text          // FK → receipts (nullable for manual)
  name: text NOT NULL
  normalizedName: text     // cleaned: "ORG FUJI APL" → "Fuji Apple"
  category: text           // produce|dairy|meat|seafood|pantry|frozen|beverage|other
  quantity: real
  unit: text               // lbs|oz|count|fl oz|gal|etc
  purchaseDate: integer
  expiryDate: integer
  runningLow: integer      // 0|1 bool — user annotated
  notes: text
  wikiId: text             // FK → wiki_ingredients (optional link)
  createdAt: integer NOT NULL
}
```

### 2.2 Food Wiki

```typescript
// Seeded from: USDA FoodData Central + FlavorGraph academic dataset
// FlavorGraph: 6,653 ingredient nodes, 147,179 flavor-pairing edges
// Source: https://github.com/lingcheng99/Flavor-Network
//         https://www.nature.com/articles/s41598-020-79422-8

wikiIngredients: {
  id: text (ULID, PK)
  name: text UNIQUE NOT NULL
  aliases: text            // JSON: ["tomato", "pomodoro", "love apple"]
  description: text
  category: text           // vegetable|fruit|grain|legume|dairy|meat|seafood|
                           // spice|herb|oil|condiment|fungus|nut|seed|sweetener
  subcategory: text
  origin: text             // country/region of origin
  seasons: text            // JSON: ["spring","summer"] or ["year-round"]
  flavorProfile: text      // JSON: {sweet:0.2, sour:0.8, salty:0, bitter:0.3, umami:0.6, fatty:0.1}
  imageUrl: text
  usdaFdcId: text          // USDA FoodData Central ID
  flavorGraphId: text      // FlavorGraph node ID
  openFoodFactsId: text
  createdAt: integer NOT NULL
  updatedAt: integer NOT NULL
}

// Nutritional data per 100g — sourced from USDA FoodData Central
wikiNutrition: {
  ingredientId: text PK    // FK → wikiIngredients
  calories: real
  proteinG: real
  carbsG: real
  fatG: real
  fiberG: real
  sugarG: real
  sodiumMg: real
  vitamins: text           // JSON: {A_mcg:900, C_mg:65, D_IU:600, ...}
  minerals: text           // JSON: {calcium_mg:1300, iron_mg:18, ...}
  servingSizeG: real DEFAULT 100
  source: text             // usda|openfoodfacts|manual
}

// Graph edges — seeded from FlavorGraph (147K+ edges) + curated
wikiRelationships: {
  id: text (ULID, PK)
  ingredientAId: text      // FK → wikiIngredients
  ingredientBId: text      // FK → wikiIngredients
  relationship: text       // same_family | flavor_pairing | substitution |
                           // cultural_pairing | complementary | derived_from
  strength: real DEFAULT 0.5  // 0.0–1.0 (from FlavorGraph co-occurrence probability)
  sharedCompounds: text    // JSON: list of shared flavor chemicals (from FlavorGraph)
  notes: text
  UNIQUE(ingredientAId, ingredientBId, relationship)
}
```

### 2.3 Recipes

```typescript
recipes: {
  id: text (ULID, PK)
  title: text NOT NULL
  description: text
  cuisine: text            // italian|japanese|mexican|etc
  difficulty: text         // easy|medium|hard
  prepTimeMin: integer
  cookTimeMin: integer
  servings: integer DEFAULT 4
  tags: text               // JSON: ["vegetarian","quick","comfort"]
  sourceUrl: text          // where recipe came from
  createdAt: integer NOT NULL
  updatedAt: integer NOT NULL
}

recipeIngredients: {
  id: text (ULID, PK)
  recipeId: text           // FK → recipes ON DELETE CASCADE
  wikiId: text             // FK → wikiIngredients (nullable)
  nameOverride: text       // display name if no wiki match
  amount: real
  unit: text
  notes: text              // "finely chopped", "at room temperature"
  optional: integer DEFAULT 0
  stepOrder: integer       // which step first needs this ingredient
}

recipeSteps: {
  id: text (ULID, PK)
  recipeId: text           // FK → recipes ON DELETE CASCADE
  stepNumber: integer NOT NULL
  instruction: text NOT NULL
  durationMin: integer
  tip: text
  imagePath: text          // optional step photo
}

recipeMedia: {
  id: text (ULID, PK)
  recipeId: text           // FK → recipes ON DELETE CASCADE
  type: text NOT NULL      // image|youtube|cultural|link
  urlOrPath: text NOT NULL // /uploads/recipes/{id}.jpg or https://youtube.com/...
  caption: text
  isPrimary: integer DEFAULT 0
  sortOrder: integer DEFAULT 0
}
```

### 2.4 Kitchen

```typescript
kitchenEquipment: {
  id: text (ULID, PK)
  name: text NOT NULL
  brand: text
  model: text
  category: text           // appliance|cookware|bakeware|tool|storage|cutlery
  subcategory: text        // stand_mixer|dutch_oven|skillet|instant_pot|etc
  condition: text          // excellent|good|fair|needs_repair
  notes: text
  imagePath: text          // /uploads/equipment/{id}.jpg
  purchasedDate: integer
  createdAt: integer NOT NULL
}

kitchenFloorplans: {
  id: text (ULID, PK)
  name: text DEFAULT 'My Kitchen'
  imagePath: text NOT NULL  // /uploads/floorplans/{id}.jpg — background image
  widthFt: real
  heightFt: real
  createdAt: integer NOT NULL
}

floorplanAnnotations: {
  id: text (ULID, PK)
  floorplanId: text         // FK → kitchenFloorplans ON DELETE CASCADE
  equipmentId: text         // FK → kitchenEquipment (nullable for custom labels)
  label: text               // display label on canvas
  xPct: real NOT NULL       // 0.0–1.0 relative X position
  yPct: real NOT NULL       // 0.0–1.0 relative Y position
  rotationDeg: real DEFAULT 0
  widthPct: real DEFAULT 0.08
  heightPct: real DEFAULT 0.08
  color: text DEFAULT '#4f46e5'  // annotation color
}
```

### 2.5 Social

```typescript
socialSources: {
  id: text (ULID, PK)
  name: text NOT NULL
  type: text NOT NULL       // reddit_rss|rss|youtube_atom
  url: text NOT NULL        // feed URL
  active: integer DEFAULT 1
  lastFetched: integer
  createdAt: integer NOT NULL
}

// Default sources seeded on first run:
// Reddit RSS: r/food, r/recipes, r/Cooking, r/MealPrepSunday, r/GifRecipes, r/EatCheapAndHealthy
// RSS: Food52 (food52.com/feed), Serious Eats, The Kitchn, AllRecipes
// YouTube Atom: Joshua Weissman, Ethan Chlebowski, Binging with Babish, Pro Home Cooks

socialPosts: {
  id: text (ULID, PK)
  sourceId: text            // FK → socialSources
  externalId: text          // original post ID from source
  title: text
  description: text
  url: text NOT NULL
  imageUrl: text
  author: text
  publishedAt: integer
  fetchedAt: integer NOT NULL
  tags: text                // JSON: LLM-tagged by cuisine/ingredient type
  liked: integer DEFAULT 0
  notes: text
  UNIQUE(sourceId, externalId)
}
```

### 2.6 Yes Chef

```typescript
chatSessions: {
  id: text (ULID, PK)
  title: text               // auto-generated from first message
  mode: text DEFAULT 'quick'  // quick|plan
  model: text               // ollama model used
  createdAt: integer NOT NULL
  updatedAt: integer NOT NULL
}

chatMessages: {
  id: text (ULID, PK)
  sessionId: text           // FK → chatSessions ON DELETE CASCADE
  role: text NOT NULL       // user|assistant|system
  content: text NOT NULL
  contextUsed: text         // JSON: {pantryItems: [...], equipment: [...], ...}
  tokensUsed: integer
  createdAt: integer NOT NULL
}
```

---

## 3. Section Designs

### 3.1 Pantry

**Layout:** Split-pane — left sidebar (filters + stats widget), right content (grid/list with sort).

**Running Low Dashboard Widget:**
```
┌──────────────────────┐
│  🔴 Running Low (4)  │
│  · Eggs              │
│  · Olive Oil         │
│  · Garlic            │
│  · Butter            │
│  [+ Add to List]     │
└──────────────────────┘
```

**Receipt Upload Flow:**
```
1. User drag-drops receipt image → react-dropzone
2. POST /api/pantry/receipts (multipart/form-data)
3. Server saves with Sharp: resize to 2000px max, enhance contrast, grayscale option
4. Server calls Ollama llama3.2-vision:11b with structured prompt:
   ┌─────────────────────────────────────────────────────────────┐
   │ System: You are a grocery receipt parser. Extract all       │
   │ purchased food items and return ONLY valid JSON.            │
   │                                                             │
   │ User: [image] Extract items as JSON array:                 │
   │ [{"name":"string","qty":number,"unit":"string",            │
   │   "category":"produce|dairy|meat|pantry|frozen|other"}]    │
   │ Expand abbreviations. Skip non-food items and totals.      │
   └─────────────────────────────────────────────────────────────┘
5. Parse JSON response → normalize names via fuzzy Wiki lookup
6. Show review modal: parsed items table, user can edit/delete each row
7. Confirm → INSERT into groceryItems table
8. Success: show "Added 23 items" toast
```

**Item Card Design:**
```
┌────────────────────────────────────────┐
│  🍅  Roma Tomatoes                     │
│  2 lbs · Produce · Added Mar 15        │
│  ⚠️ Running Low    [Edit] [🗑️]         │
│  ──────────────────────────────────   │
│  → View in Wiki  · Used in 5 recipes  │
└────────────────────────────────────────┘
```

**Category color coding:** Produce (green), Dairy (blue), Meat (red), Pantry (amber), Frozen (cyan), Beverage (purple).

### 3.2 Food Wiki

**Data Sources:**
- **USDA FoodData Central**: Nutritional data for ~2M foods. Free API, no key required.
- **FlavorGraph Academic Dataset** (Yong-Yeol Ahn et al., *Nature Scientific Reports* 2021): 6,653 ingredient nodes, 147,179 edges based on shared flavor compounds. Seeded as JSON from the published dataset.
- **FlavorDiffusion** (2025): Emerging research for predicting pairings from chemical interactions — can augment graph in future.

**Layout:**
```
┌─ Categories ─────┐  ┌─ Ingredient Detail ────────────────────────────────┐
│ 🥦 Vegetables   │  │  🍅 Tomato                                          │
│ 🍎 Fruits       │  │  Solanum lycopersicum · Nightshade family           │
│ 🌾 Grains       │  │  Origin: Mesoamerica · Season: Summer–Fall          │
│ 🥩 Proteins     │  │                                                     │
│ 🫙 Pantry       │  │  [Nutrition] [Relationships] [Pantry] [Recipes]    │
│ 🌿 Herbs        │  │                                                     │
│ 🧂 Spices       │  │  ━━━ Flavor Profile ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 🍄 Fungi        │  │  [Radar chart: sweet 0.3, umami 0.8, sour 0.6...]  │
│ ...             │  │                                                     │
└─────────────────┘  │  ━━━ Relationship Graph ━━━━━━━━━━━━━━━━━━━━━━━━━  │
                      │  [Cytoscape.js force graph — expandable]           │
                      │                                                     │
                      │  ━━━ In Your Pantry ━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
                      │  ✅ In stock: 2 lbs (added Mar 15)                 │
                      │                                                     │
                      │  ━━━ In Recipes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
                      │  [Pasta Pomodoro] [Bruschetta] [Caprese Salad]    │
                      └─────────────────────────────────────────────────────┘
```

**Relationship Graph — Cytoscape.js Implementation:**

Edge types and colors:
| Type | Color | Example |
|------|-------|---------|
| `flavor_pairing` | 🟢 Green | Tomato ↔ Basil (shared terpene compounds) |
| `same_family` | 🔵 Blue | Tomato ↔ Eggplant (Nightshade) |
| `substitution` | 🟠 Orange | Butter ↔ Ghee |
| `cultural_pairing` | 🟣 Purple | Tomato ↔ Mozzarella (Italian) |
| `derived_from` | ⚫ Gray | Olive Oil ← Olive |
| `complementary` | 🟡 Yellow | Lemon ↔ Fish |

Graph behavior:
- Initial load: 20 nearest neighbors by strength
- Click node → navigate to that ingredient's wiki page
- Hover edge → show tooltip with relationship type + strength %
- "Expand" button → load 2nd-degree neighbors
- Cose-bilkent layout (best for organic clustering)
- Context button: "What can I pair with this? → Ask Yes Chef"

### 3.3 Recipes

**Layout:** Masonry card grid (browse) → full detail sheet (modal/page).

**Recipe Detail View (6 tabs):**

1. **Overview** — hero image, description, cuisine flag, difficulty badge, time breakdown, serving scaler
2. **Ingredients** — linked checklist with wiki icons; "Can I Make This?" matcher:
   ```
   ✅ Pasta (in pantry: 1 box)
   ✅ Eggs (in pantry: 6, ⚠️ running low)
   ✅ Pecorino Romano (in pantry: 200g)
   ✅ Black Pepper (in pantry)
   ❌ Guanciale — not in pantry

   [Add Missing to Shopping List]  [Ask Yes Chef for Substitutions]
   ```
3. **Steps** — numbered cards, each collapsible. Built-in timers per step. Scroll-lock mode for cooking.
4. **Media** — image gallery (lightbox), embedded YouTube player, cultural context links (e.g., for Carbonara: "Roman pasta tradition since 1940s")
5. **Nutrition** — calculated from recipe ingredients × USDA data per serving
6. **Notes** — personal notes, rating, "last made" date

**Cultural Media Panel:**
```
🌍 Cultural Context: Pasta Carbonara
├── 📹 "The Science Behind Carbonara" [YouTube]
├── 📖 "Rome's Working-Class Pasta History" [link]
├── 🖼️ Vintage Italian cookbook illustrations
└── 🗺️ Regional variations: Roman vs. Amatriciana
```

### 3.4 Kitchen

**Two sub-tabs: Equipment Inventory + Floorplan**

**Equipment Inventory:**
- Card grid: photo, name, brand, category badge, condition dot
- Filterable: appliances | cookware | tools | storage
- Add modal with: name, brand, model, category, condition, photo upload, notes
- Equipment pages link to recipes: "Recipes that use this: Stand Mixer → [Cinnamon Rolls], [Brioche]"

**Floorplan (Konva.js canvas):**

Konva.js chosen for: built-in Transformer handles (resize/rotate), drag-drop, layering, hit detection, export to PNG.

```
┌─── Floorplan Editor ──────────────────────────────────────────────┐
│  [Upload Background Image]  [Add Equipment]  [Clear]  [Export PNG]│
│                                                                   │
│  ┌─────────────────── Canvas (uploaded photo or grid) ─────────┐ │
│  │                                                              │ │
│  │   [🥶 Fridge]   [🍳 Stove]   [🫙 Pantry]                   │ │
│  │                                                              │ │
│  │   [🏝️ Island]                [🚿 Sink]                      │ │
│  │                                                              │ │
│  └──────────────────────────────────────────────────────────── ┘ │
│                                                                   │
│  Equipment Palette: [drag items onto canvas]                      │
│  [Fridge] [Stove] [Oven] [Sink] [Island] [Dishwasher] [Counter]  │
└───────────────────────────────────────────────────────────────────┘
```

Workflow:
1. User uploads any image (top-down sketch, photo, blank grid — anything)
2. Image becomes Canvas background (Konva Image node)
3. Sidebar lists all equipment from inventory
4. Drag equipment icon onto canvas → creates labeled Rect/Group annotation
5. Konva Transformer: click annotation → resize/rotate handles appear
6. Double-click annotation → edit label
7. Save positions as `floorplanAnnotations` records (xPct, yPct relative to canvas)
8. Export PNG: `stage.toDataURL()`

**Note on "AI-generated floorplan":** True AI floorplan generation from a regular photo is a research-level problem (requires LiDAR or multi-view input — Apple RoomPlan, Matterport). MVP approach is user-assisted annotation. A future enhancement could use `llama3.2-vision` to identify appliances in the photo and suggest initial annotation placements.

### 3.5 Social

**Feed Sources (seeded by default):**

| Source | Type | URL Pattern |
|--------|------|-------------|
| r/food | Reddit RSS | `https://www.reddit.com/r/food.rss` |
| r/recipes | Reddit RSS | `https://www.reddit.com/r/recipes.rss` |
| r/Cooking | Reddit RSS | `https://www.reddit.com/r/Cooking.rss` |
| r/MealPrepSunday | Reddit RSS | `https://www.reddit.com/r/MealPrepSunday.rss` |
| r/GifRecipes | Reddit RSS | `https://www.reddit.com/r/GifRecipes.rss` |
| Food52 | RSS | `https://food52.com/feed` |
| Serious Eats | RSS | `https://www.seriouseats.com/feeds/all.xml` |
| The Kitchn | RSS | `https://www.thekitchn.com/main/atom.xml` |
| Joshua Weissman | YouTube Atom | `https://www.youtube.com/feeds/videos.xml?channel_id={ID}` |
| Ethan Chlebowski | YouTube Atom | `https://www.youtube.com/feeds/videos.xml?channel_id={ID}` |
| Binging with Babish | YouTube Atom | `https://www.youtube.com/feeds/videos.xml?channel_id={ID}` |

**Note on Instagram/TikTok:** Meta's Graph API and TikTok's API are not practically accessible for general content aggregation since 2023 policy changes. These platforms are excluded.

**Curation Logic:**
1. `node-cron` job runs every 30 minutes: fetch all active sources
2. `rss-parser` parses RSS/Atom feeds, deduplicates by `(sourceId, externalId)`
3. New items optionally tagged by Ollama: fast tagging model runs: `"Tag this food content with: cuisine, ingredient_type, content_type (recipe|video|article|photo)"` — stored in `tags` JSON column
4. Posts surfaced in chronological masonry grid

**UI:**
- Filter bar: source | cuisine | content type | liked only
- "Refresh now" button
- Like toggle (heart icon) — persisted
- "Open Original" always prominent
- Image lazy-loading with `next/image`
- No third-party scripts from social platforms loaded — all fetched server-side

### 3.6 Yes Chef (Ollama Chat)

**Ollama Integration via Vercel AI SDK:**

```typescript
// lib/ollama/client.ts
import { createOllama } from 'ollama-ai-provider';

export const ollama = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/api',
});

// app/api/chat/route.ts
import { streamText } from 'ai';
import { ollama } from '@/lib/ollama/client';
import { buildYesChefContext } from '@/lib/ollama/chat-context';

export async function POST(req: Request) {
  const { messages, sessionId, mode } = await req.json();
  const context = await buildYesChefContext();
  const model = mode === 'plan' ? 'llama3.1:8b' : 'llama3.2:3b';

  const result = await streamText({
    model: ollama(model),
    system: buildSystemPrompt(context),
    messages,
    maxTokens: mode === 'plan' ? 4096 : 1024,
  });

  return result.toDataStreamResponse();
}
```

**Context Assembly (`lib/ollama/chat-context.ts`):**

```
=== YOUR PANTRY ===
In stock (35 items):
  Produce: tomatoes (2 lbs), garlic (1 bulb), onion (3), lettuce (1 head)
  Dairy: eggs (6, ⚠️ running low), butter (1 stick), parmesan (100g)
  Pantry: pasta (2 boxes), olive oil (⚠️ running low), canned tomatoes (3)
  Proteins: chicken thighs (2 lbs), bacon (200g)

⚠️ Running low: eggs, olive oil

=== YOUR KITCHEN EQUIPMENT ===
Appliances: stand mixer, instant pot, air fryer, toaster oven
Cookware: cast iron skillet (12"), dutch oven (5qt), pasta pot, sauté pan

=== RECENT RECIPES (last 10) ===
Cacio e Pepe · Roasted Chicken · Pasta Pomodoro · Garlic Bread

=== WIKI CONTEXT (relevant to query) ===
[Keyword-matched excerpts from wiki_ingredients descriptions]
```

**Critical Ollama Setting:**
Ollama defaults to 2048-token context. For Yes Chef to work well with pantry context injected, the context window must be set to **8192+ tokens** via `OLLAMA_NUM_CTX=8192` environment variable or model configuration.

**Two Modes:**

| | Quick Mode | Plan Mode |
|-|-----------|-----------|
| Model | `llama3.2:3b` (fast, 2GB RAM) | `llama3.1:8b` (smarter, 5GB RAM) |
| Max tokens | 1024 | 4096 |
| Use for | "What can I cook tonight?" | "Plan my week of dinners" |
| Response format | Conversational | Structured markdown (tables, steps) |
| Indicator | Fast ⚡ | Thinking 🤔 (spinner) |

**UI Layout:**
```
┌─── Yes Chef ──────────────────────────────────────────────────────────┐
│  ⚡ Quick  🤔 Plan          [llama3.2:3b ▾]         [Context Panel ▸] │
├───────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ╭─────────────────────────────────────╮                              │
│  │ 👨‍🍳  Hello! I'm Yes Chef. I know    │                              │
│  │  your pantry has 35 items and       │                              │
│  │  you're running low on eggs and     │                              │
│  │  olive oil. What shall we cook?     │                              │
│  ╰─────────────────────────────────────╯                              │
│                                                                        │
│  ╭─ You ───────────────────────────────╮                              │
│  │  What can I make with chicken and  │                              │
│  │  the stuff I have?                 │                              │
│  ╰─────────────────────────────────────╯                              │
│                                                                        │
│  ╭─ Yes Chef ──────────────────────────╮                              │
│  │  With your chicken thighs, here    │                              │
│  │  are 3 great options...            │                              │
│  │  [streaming tokens...]             │                              │
│  ╰─────────────────────────────────────╯                              │
│                                                                        │
├───────────────────────────────────────────────────────────────────────┤
│  Suggested: [What can I cook?] [Plan my week] [Shopping list help]    │
├───────────────────────────────────────────────────────────────────────┤
│  [Type a message...]                              [Send ↵]            │
└───────────────────────────────────────────────────────────────────────┘
```

**Collapsible Context Panel** (right side):
- Shows exactly what pantry/equipment data is loaded into context
- Token count indicator
- "Refresh context" button

**Conversation History:**
- Persisted to `chatMessages` table
- Sessions listed in left sidebar (like Claude/ChatGPT)
- Sessions auto-titled from first user message

---

## 4. Cross-Cutting Features

### Global Search (Cmd/Ctrl + K)
- Searches: pantry items, wiki ingredients, recipes (title + description), equipment
- Grouped results with section icons
- Keyboard navigation
- `fts5` SQLite full-text search for performance

### Navigation
```
┌─────────────────────────────────────────────────────────────────────┐
│  🥦 chew   [Pantry] [Wiki] [Recipes] [Kitchen] [Social] [Yes Chef]  │
│                                               [⌘K Search] [⚙️]       │
└─────────────────────────────────────────────────────────────────────┘
```

### Settings Page
- **AI**: Ollama base URL, model for chat, model for vision, context window size
- **Social**: Source management, refresh interval (15/30/60 min)
- **Data**: Export JSON, import JSON, reset database, run seed
- **Theme**: Light / Dark / System

### Empty States (Onboarding)
Each section has a helpful empty state:
- Pantry: "Upload your first receipt or add items manually →"
- Wiki: "Your wiki has 2,000+ ingredients. Search for one! →"
- Recipes: "Add your first recipe or let Yes Chef suggest one →"
- Kitchen: "Document your kitchen equipment →"
- Social: "Your feed is loading... [Refresh now]"
- Yes Chef: "Hi! I'm Yes Chef. Add some pantry items and I'll help you cook!"

---

## 5. API Routes

```
# Pantry
POST   /api/pantry/receipts              → upload + Ollama vision parse
GET    /api/pantry/items                 → list with filter/sort/search
POST   /api/pantry/items                 → manual add
PUT    /api/pantry/items/:id             → update (running_low, qty, etc)
DELETE /api/pantry/items/:id

# Wiki
GET    /api/wiki/ingredients             → search/list (FTS5)
GET    /api/wiki/ingredients/:id         → detail + nutrition
GET    /api/wiki/ingredients/:id/graph   → Cytoscape graph data {nodes, edges}
GET    /api/wiki/ingredients/:id/pantry  → matching pantry items
GET    /api/wiki/ingredients/:id/recipes → recipes using this ingredient

# Recipes
GET    /api/recipes                      → list/search
POST   /api/recipes                      → create
GET    /api/recipes/:id                  → full detail
PUT    /api/recipes/:id
DELETE /api/recipes/:id
GET    /api/recipes/:id/pantry-check     → {have, low, missing} per ingredient
POST   /api/recipes/:id/media            → upload media

# Kitchen
GET    /api/kitchen/equipment
POST   /api/kitchen/equipment
PUT    /api/kitchen/equipment/:id
DELETE /api/kitchen/equipment/:id
GET    /api/kitchen/floorplans
POST   /api/kitchen/floorplans           → upload background image
GET    /api/kitchen/floorplans/:id
PUT    /api/kitchen/floorplans/:id/annotations  → save all annotation positions
GET    /api/kitchen/floorplans/:id/export       → PNG export trigger

# Social
GET    /api/social/feed                  → paginated feed
POST   /api/social/feed/refresh          → manual trigger
PUT    /api/social/posts/:id/like
GET    /api/social/sources
POST   /api/social/sources
PUT    /api/social/sources/:id

# Chat
POST   /api/chat/sessions
GET    /api/chat/sessions
GET    /api/chat/sessions/:id/messages
POST   /api/chat/sessions/:id/messages   → streams SSE via Vercel AI SDK
DELETE /api/chat/sessions/:id
GET    /api/chat/context                 → preview assembled context snapshot
```

---

## 6. File / Directory Structure

```
chew/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout: TabNav, GlobalSearch
│   ├── page.tsx                      # Redirect → /pantry
│   ├── pantry/
│   │   ├── page.tsx
│   │   └── receipts/[id]/page.tsx
│   ├── wiki/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── recipes/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── kitchen/
│   │   └── page.tsx
│   ├── social/
│   │   └── page.tsx
│   ├── yes-chef/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   └── api/                          # API route handlers
│       ├── pantry/
│       ├── wiki/
│       ├── recipes/
│       ├── kitchen/
│       ├── social/
│       └── chat/
│           └── route.ts              # Vercel AI SDK streamText
│
├── components/
│   ├── layout/
│   │   ├── TabNav.tsx
│   │   ├── GlobalSearch.tsx          # Cmd+K, FTS5
│   │   └── Header.tsx
│   ├── pantry/
│   │   ├── ReceiptUploader.tsx       # react-dropzone + upload flow
│   │   ├── ReceiptReviewModal.tsx    # Edit parsed items before save
│   │   ├── GroceryItemCard.tsx
│   │   ├── RunningLowWidget.tsx
│   │   └── CategoryFilter.tsx
│   ├── wiki/
│   │   ├── IngredientGraph.tsx       # react-cytoscapejs, cose-bilkent
│   │   ├── NutritionPanel.tsx        # Standard label format
│   │   ├── FlavorRadar.tsx           # Recharts RadarChart
│   │   └── RelationshipLegend.tsx
│   ├── recipes/
│   │   ├── RecipeCard.tsx
│   │   ├── PantryChecker.tsx         # have/low/missing breakdown
│   │   ├── StepCard.tsx              # with built-in timer
│   │   ├── MediaGallery.tsx          # lightbox + YouTube embed
│   │   └── NutritionSummary.tsx
│   ├── kitchen/
│   │   ├── FloorplanCanvas.tsx       # react-konva Stage + Transformer
│   │   ├── EquipmentPalette.tsx      # drag source for canvas
│   │   └── EquipmentCard.tsx
│   ├── social/
│   │   ├── FeedMasonry.tsx
│   │   └── PostCard.tsx
│   └── yes-chef/
│       ├── ChatInterface.tsx         # useChat hook from @ai-sdk/react
│       ├── MessageBubble.tsx         # user/assistant styling
│       ├── ContextPanel.tsx          # show injected context
│       ├── ModeToggle.tsx            # quick/plan
│       └── SuggestedPrompts.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts                 # Full Drizzle schema
│   │   ├── client.ts                 # better-sqlite3 + Drizzle
│   │   ├── fts.ts                    # SQLite FTS5 setup
│   │   └── migrations/
│   ├── ollama/
│   │   ├── client.ts                 # createOllama from ollama-ai-provider
│   │   ├── receipt-parser.ts         # Llama3.2-vision prompt + JSON parse
│   │   └── chat-context.ts           # Context assembly for Yes Chef
│   ├── scrapers/
│   │   ├── reddit.ts                 # Reddit .rss feed via rss-parser
│   │   ├── rss.ts                    # Generic RSS/Atom
│   │   └── youtube.ts                # YouTube Atom feed
│   ├── seed/
│   │   ├── usda.ts                   # USDA FoodData Central fetch + insert
│   │   ├── flavor-graph.ts           # FlavorGraph dataset import
│   │   └── relationships.json        # Curated supplement to FlavorGraph
│   └── utils/
│       ├── id.ts                     # ULID generation
│       ├── image.ts                  # Sharp resize/enhance
│       └── fuzzy-match.ts            # Fuzzy name → wiki ingredient lookup
│
├── public/
│   └── icons/                        # Food category SVG icons
│
├── uploads/                          # Gitignored; local file storage
│   ├── receipts/
│   ├── recipes/
│   ├── equipment/
│   └── floorplans/
│
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── .env.local                        # OLLAMA_BASE_URL, OLLAMA_NUM_CTX=8192
└── package.json
```

---

## 7. Implementation Phases

### Phase 0 — Foundation (Days 1–2)
- [ ] `npx create-next-app@latest chew --typescript --tailwind --app`
- [ ] Install: `drizzle-orm better-sqlite3 drizzle-kit`
- [ ] Install: `shadcn/ui` (init + core components)
- [ ] Install: `ulid`, `sharp`, `react-dropzone`
- [ ] Write full Drizzle schema (`lib/db/schema.ts`)
- [ ] Run migration → SQLite database initialized
- [ ] Build tab navigation shell (6 tabs, placeholder content)
- [ ] Configure `.env.local` and uploads directory

### Phase 1 — Pantry (Days 3–5)
- [ ] `react-dropzone` receipt uploader UI
- [ ] Sharp image preprocessing (resize, contrast enhance)
- [ ] Ollama `llama3.2-vision:11b` integration for receipt parsing
- [ ] Review modal: parsed items editable table
- [ ] Grocery items CRUD (list, add, edit, delete)
- [ ] Running low toggle + dashboard widget
- [ ] Category filter sidebar
- [ ] Manual add item modal

### Phase 2 — Food Wiki (Days 6–9)
- [ ] USDA FoodData Central seed script (top 500 foundation foods)
- [ ] FlavorGraph dataset import (`lib/seed/flavor-graph.ts`)
- [ ] Wiki ingredient list/search page with FTS5
- [ ] Ingredient detail page (6 panels)
- [ ] Cytoscape.js relationship graph (`react-cytoscapejs`, cose-bilkent layout)
- [ ] Nutrition panel (Recharts bar chart)
- [ ] Flavor radar chart (Recharts RadarChart)
- [ ] Pantry ↔ Wiki cross-links

### Phase 3 — Recipes (Days 10–13)
- [ ] Recipe CRUD (list, create, edit, delete)
- [ ] Ingredient list with wiki autocomplete (FTS5 typeahead)
- [ ] Step-by-step builder with drag-reorder
- [ ] Step timer component
- [ ] Media upload (images) + YouTube URL embed
- [ ] Pantry check feature (have/low/missing)
- [ ] Recipe card masonry grid

### Phase 4 — Kitchen (Days 14–16)
- [ ] Equipment inventory CRUD
- [ ] Equipment photo upload
- [ ] Floorplan image upload (background)
- [ ] Konva.js canvas with Stage, Layer, Image
- [ ] Equipment palette → drag onto canvas
- [ ] Konva Transformer for resize/rotate
- [ ] Save/restore annotation positions
- [ ] PNG export

### Phase 5 — Social (Days 17–18)
- [ ] `rss-parser` integration for Reddit RSS, food RSS, YouTube Atom
- [ ] Seed default social sources
- [ ] Background `node-cron` job (30-min refresh)
- [ ] Masonry feed UI with `react-masonry-css`
- [ ] Like toggle (persisted)
- [ ] Source management in Settings
- [ ] Optional: Ollama auto-tagging of new posts

### Phase 6 — Yes Chef (Days 19–22)
- [ ] `ollama-ai-provider` + Vercel AI SDK setup
- [ ] `POST /api/chat/:id/messages` route with `streamText`
- [ ] Context assembly function (`buildYesChefContext`)
- [ ] `useChat` hook integration on client
- [ ] Streaming message bubbles with react-markdown rendering
- [ ] Session history sidebar
- [ ] Quick/Plan mode toggle
- [ ] Context panel (show loaded data)
- [ ] Suggested prompts (contextual)

### Phase 7 — Polish (Days 23–25)
- [ ] Global search (Cmd+K) with FTS5 across all sections
- [ ] Cross-section linkages: wiki↔pantry, wiki↔recipes, kitchen↔recipes
- [ ] Dark/light/system theme toggle
- [ ] Mobile responsive layout audit
- [ ] Loading skeletons for all async sections
- [ ] Error boundaries and fallback UI
- [ ] Empty states with onboarding copy
- [ ] Settings page (Ollama config, social sources, data export)
- [ ] JSON data export/import

---

## 8. Key Design Decisions & Trade-offs

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Database | SQLite + Drizzle | Supabase/Postgres | Single-user app; zero infra; instant portability; easy backup as single file |
| AI platform | Ollama (local) | OpenAI/Claude API | Privacy — receipts + pantry don't leave device; zero ongoing cost |
| Vision model | `llama3.2-vision:11b` | LLaVA, LightOnOCR-2 | Meta's 11B model trained on 6B image-text pairs; best local receipt accuracy per 2025 benchmarks |
| Chat AI SDK | Vercel AI SDK + `ollama-ai-provider` | Raw fetch to Ollama | `useChat` handles streaming, state, error recovery; works identically with cloud models later |
| Graph lib | Cytoscape.js | Sigma.js, D3 | Best graph analysis tools + layouts; `react-cytoscapejs` wrapper; adequate for <10K nodes |
| Graph data | FlavorGraph dataset | Hand-curated | 6,653 scientifically grounded nodes, 147,179 flavor-compound-based edges — research-quality foundation |
| Canvas lib | Konva.js | Fabric.js | Better Transformer handles; more active maintenance; excellent React wrapper (`react-konva`) |
| File storage | Local filesystem | Supabase Storage | Self-hosted; no bandwidth costs; perfect for single-user |
| Social | RSS + Reddit RSS + YouTube Atom | Instagram/TikTok | Meta/TikTok APIs are inaccessible for public content aggregation since 2023 policy changes |
| Auth | None (single-user) | Better Auth / NextAuth | Simplicity; local-first private app; add multi-user in Phase 2+ |
| Floorplan | User-annotated Konva | AI room detection | True AI floorplan from photo is research-level (requires LiDAR); annotation is reliable MVP |

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| Ollama `llama3.2-vision:11b` (7GB) too large for user hardware | Medium | High | Document minimum requirements (8GB VRAM); provide `llava:7b` fallback; allow manual receipt entry |
| Receipt OCR accuracy poor on unusual receipt formats | High | Medium | Always show review modal before saving; easy item delete/edit |
| USDA API unavailable during seed | Low | Low | Seed from cached JSON snapshot; USDA has >99.9% uptime |
| FlavorGraph data is research-quality, not curated | Medium | Low | Supplement with hand-curated `relationships.json`; UI notes relationship source |
| Reddit changes RSS behavior | Low | Low | Graceful failure; disable source, log error; user can re-add |
| Cytoscape graph laggy with full 6,653-node graph | Medium | Medium | Limit initial render to 50 nearest nodes; "Load more" expansion; use WebGL renderer for large graphs |
| Ollama 2048-token default context too small for Yes Chef | High | High | Document `OLLAMA_NUM_CTX=8192` in setup; auto-set via Modelfile; check context in onboarding |
| node-cron social refresh causes server load spike | Low | Low | Stagger source fetches; add jitter; rate limit per source |
| YouTube Atom feeds return channel IDs that change | Low | Low | Store channel IDs in DB, updatable via Settings |

---

## 10. Internal Assessment Against Stated Goals

| Goal | Plan Coverage | Confidence | Notes |
|------|--------------|------------|-------|
| Pantry: receipt image → grocery items | ✅ Full | High | Llama3.2-vision:11b is production-ready for receipts |
| Pantry: persist to database | ✅ Full | High | SQLite + Drizzle schema is solid |
| Pantry: running low annotation | ✅ Full | High | Simple toggle + dashboard widget |
| Wiki: ingredient descriptions + nutrition | ✅ Full | High | USDA FoodData Central provides USDA-verified data |
| Wiki: ingredient relationship graph | ✅ Full | High | FlavorGraph (147K edges) is a research-grade data source |
| Wiki: linkages to Pantry + Recipes | ✅ Full | High | Cross-referenced via wiki_id FK + API routes |
| Recipes: ingredient lists | ✅ Full | High | Linked to wiki via FK, wiki autocomplete |
| Recipes: step-by-step instructions | ✅ Full | High | Drag-reorder step builder |
| Recipes: media (images, videos, cultural) | ✅ Full | High | Multi-type media table, YouTube embed, cultural links |
| Kitchen: appliance/equipment inventory | ✅ Full | High | CRUD with photo upload |
| Kitchen: floorplan from uploaded image | ✅ MVP | Medium | User-annotated (realistic); true AI generation = future |
| Social: food media | ✅ Full | High | 10+ RSS/Reddit/YouTube sources |
| Social: actively curated | ✅ Full | High | 30-min cron + manual refresh |
| Yes Chef: Ollama hosted | ✅ Full | High | ollama-ai-provider + Vercel AI SDK |
| Yes Chef: context from Pantry/Wiki/Recipes | ✅ Full | High | buildYesChefContext() assembles per-request snapshot |
| Yes Chef: quick answers | ✅ Full | High | llama3.2:3b, ~2-3s response |
| Yes Chef: long-running plan mode | ✅ Full | High | llama3.1:8b, 4096 token budget, streaming |

**Overall confidence: 9.5/10.** The only area with honest uncertainty is the kitchen floorplan, which is truthfully a user-annotation tool rather than AI-generated. All other features have clear technology paths with proven libraries and working examples available as of 2026.

---

## 11. Future Enhancements (Post-MVP)

1. **Barcode scanning** — Open Food Facts barcode API, webcam-based scanning
2. **Recipe URL importer** — scrape structured recipe data (schema.org/Recipe markup) from food blogs
3. **Meal planning calendar** — weekly drag-drop meal plan, auto grocery list generation
4. **Shopping list** — generated from running-low items + weekly meal plan
5. **Nutrition tracking** — log daily meals, track macros against USDA DRI targets
6. **AI floorplan** — use `llama3.2-vision` to identify appliances in kitchen photo, suggest initial annotations
7. **Vector search for Yes Chef** — embed wiki + recipes using Ollama `nomic-embed-text` for semantic RAG
8. **Recipe URL scraping** — parse `schema.org/Recipe` from any food blog URL
9. **Multi-user / family mode** — shared pantry, individual preferences
10. **Mobile PWA** — service worker, offline pantry access, camera receipt capture
11. **Seasonal highlights** — Wiki surfaces in-season ingredients on homepage
12. **FlavorDiffusion integration** — 2025 research paper predicts food-chemical interactions; could power "Surprising Pairings" feature

---

## 12. Development Setup

```bash
# Prerequisites
# - Node.js 22+
# - Ollama installed (https://ollama.com)

# Pull required models
ollama pull llama3.2-vision:11b   # Receipt OCR + kitchen annotation (7GB)
ollama pull llama3.2:3b           # Yes Chef Quick mode (2GB)
ollama pull llama3.1:8b           # Yes Chef Plan mode (5GB)

# Set Ollama context window
# Add to ~/.ollama/Modelfile or set env: OLLAMA_NUM_CTX=8192

# Project setup
git clone <repo> chew && cd chew
npm install
cp .env.local.example .env.local
# Edit .env.local: OLLAMA_BASE_URL=http://localhost:11434/api

# Database
npm run db:generate   # Drizzle generate migrations
npm run db:migrate    # Apply schema
npm run db:seed       # Seed USDA data + FlavorGraph

# Development
npm run dev           # http://localhost:3000
```

---

*Sources consulted for this plan:*
- [Ollama-OCR GitHub](https://github.com/imanoop7/Ollama-OCR)
- [Llama 3.2-Vision for OCR](https://medium.com/@bytefer/llama-3-2-vision-for-high-precision-ocr-with-ollama-dbff642f09f5)
- [FlavorGraph: Scientific Reports](https://www.nature.com/articles/s41598-020-79422-8)
- [FlavorGraph GitHub](https://github.com/lingcheng99/Flavor-Network)
- [FlavorDiffusion 2025](https://arxiv.org/html/2502.06871v1)
- [Vercel AI SDK / Ollama Next.js](https://github.com/brunnolou/next-ollama-app)
- [Open WebUI RAG docs](https://docs.openwebui.com/features/chat-conversations/rag/)
- [Mealie self-hosted recipe manager](https://docs.mealie.io/)
- [Cytoscape.js vs Sigma.js comparison](https://www.cylynx.io/blog/a-comparison-of-javascript-graph-network-visualisation-libraries/)
- [Konva.js vs Fabric.js comparison](https://dev.to/lico/react-comparison-of-js-canvas-libraries-konvajs-vs-fabricjs-1dan)
- [Next.js 15 + Drizzle ORM + SQLite](https://github.com/gustavocadev/nextjs-drizzle-orm-sqlite)
- [USDA FoodData Central API](https://fdc.nal.usda.gov/api-guide/)
- [Open Food Facts](https://world.openfoodfacts.org/)
- [Top 100 Food RSS Feeds](https://rss.feedspot.com/food_rss_feeds/)
- [Turso + Drizzle + Next.js](https://patelvivek.dev/blog/drizzle-turso-nextjs)
