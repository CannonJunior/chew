import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';

// ── Pantry ──────────────────────────────────────────────────────────────────

export const receipts = sqliteTable('receipts', {
  id: text('id').primaryKey(),
  imagePath: text('image_path').notNull(),
  uploadDate: integer('upload_date').notNull(),
  processed: integer('processed').default(0),
  rawLlmOutput: text('raw_llm_output'),
  itemCount: integer('item_count').default(0),
  merchantName: text('merchant_name'),
  receiptDate: integer('receipt_date'),
});

export const groceryItems = sqliteTable('grocery_items', {
  id: text('id').primaryKey(),
  receiptId: text('receipt_id').references(() => receipts.id),
  name: text('name').notNull(),
  normalizedName: text('normalized_name'),
  category: text('category').default('other'),
  quantity: real('quantity'),
  unit: text('unit'),
  price: real('price'),
  purchaseDate: integer('purchase_date'),
  expiryDate: integer('expiry_date'),
  runningLow: integer('running_low').default(0),
  remainingPct: real('remaining_pct').default(100),
  removedAt: integer('removed_at'),
  removalReason: text('removal_reason'), // 'consumed' | 'disposed'
  notes: text('notes'),
  wikiId: text('wiki_id'),
  createdAt: integer('created_at').notNull(),
});

// ── Food Wiki ────────────────────────────────────────────────────────────────

export const wikiIngredients = sqliteTable('wiki_ingredients', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  aliases: text('aliases'), // JSON array
  description: text('description'),
  category: text('category'),
  subcategory: text('subcategory'),
  origin: text('origin'),
  seasons: text('seasons'), // JSON array
  flavorProfile: text('flavor_profile'), // JSON object
  imageUrl: text('image_url'),
  usdaFdcId: text('usda_fdc_id'),
  flavorGraphId: text('flavor_graph_id'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const wikiNutrition = sqliteTable('wiki_nutrition', {
  ingredientId: text('ingredient_id').primaryKey().references(() => wikiIngredients.id),
  calories: real('calories'),
  proteinG: real('protein_g'),
  carbsG: real('carbs_g'),
  fatG: real('fat_g'),
  fiberG: real('fiber_g'),
  sugarG: real('sugar_g'),
  sodiumMg: real('sodium_mg'),
  vitamins: text('vitamins'), // JSON
  minerals: text('minerals'), // JSON
  servingSizeG: real('serving_size_g').default(100),
  source: text('source').default('usda'),
});

export const wikiRelationships = sqliteTable('wiki_relationships', {
  id: text('id').primaryKey(),
  ingredientAId: text('ingredient_a_id').references(() => wikiIngredients.id),
  ingredientBId: text('ingredient_b_id').references(() => wikiIngredients.id),
  relationship: text('relationship').notNull(),
  strength: real('strength').default(0.5),
  sharedCompounds: text('shared_compounds'), // JSON array
  notes: text('notes'),
});

// ── Recipes ──────────────────────────────────────────────────────────────────

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  cuisine: text('cuisine'),
  difficulty: text('difficulty').default('medium'),
  prepTimeMin: integer('prep_time_min'),
  cookTimeMin: integer('cook_time_min'),
  servings: integer('servings').default(4),
  tags: text('tags'), // JSON array
  sourceUrl: text('source_url'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').references(() => recipes.id),
  wikiId: text('wiki_id').references(() => wikiIngredients.id),
  nameOverride: text('name_override'),
  amount: real('amount'),
  unit: text('unit'),
  notes: text('notes'),
  optional: integer('optional').default(0),
  stepOrder: integer('step_order'),
});

export const recipeSteps = sqliteTable('recipe_steps', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').references(() => recipes.id),
  stepNumber: integer('step_number').notNull(),
  instruction: text('instruction').notNull(),
  durationMin: integer('duration_min'),
  tip: text('tip'),
  imagePath: text('image_path'),
});

export const recipeMedia = sqliteTable('recipe_media', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').references(() => recipes.id),
  type: text('type').notNull(), // image|youtube|cultural|link
  urlOrPath: text('url_or_path').notNull(),
  caption: text('caption'),
  isPrimary: integer('is_primary').default(0),
  sortOrder: integer('sort_order').default(0),
});

// 1-5 ratings for liked recipes; used to weight future recipe search/generation
export const recipeRatings = sqliteTable('recipe_ratings', {
  recipeId: text('recipe_id').primaryKey().references(() => recipes.id),
  picture: integer('picture'),   // visual appeal of the dish photo
  quality: integer('quality'),   // perceived recipe quality / taste
  uniqueness: integer('uniqueness'), // how novel/interesting the dish is
  updatedAt: integer('updated_at').notNull(),
});

// ── Kitchen ──────────────────────────────────────────────────────────────────

export const kitchenEquipment = sqliteTable('kitchen_equipment', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand'),
  model: text('model'),
  category: text('category').default('other'),
  subcategory: text('subcategory'),
  condition: text('condition').default('good'),
  notes: text('notes'),
  imagePath: text('image_path'),
  productUrl: text('product_url'),
  purchasedDate: integer('purchased_date'),
  createdAt: integer('created_at').notNull(),
});

export const kitchenFloorplans = sqliteTable('kitchen_floorplans', {
  id: text('id').primaryKey(),
  name: text('name').default('My Kitchen'),
  imagePath: text('image_path').notNull(),
  widthFt: real('width_ft'),
  heightFt: real('height_ft'),
  createdAt: integer('created_at').notNull(),
});

export const floorplanAnnotations = sqliteTable('floorplan_annotations', {
  id: text('id').primaryKey(),
  floorplanId: text('floorplan_id').references(() => kitchenFloorplans.id),
  equipmentId: text('equipment_id').references(() => kitchenEquipment.id),
  label: text('label'),
  xPct: real('x_pct').notNull(),
  yPct: real('y_pct').notNull(),
  rotationDeg: real('rotation_deg').default(0),
  widthPct: real('width_pct').default(0.08),
  heightPct: real('height_pct').default(0.08),
  color: text('color').default('#4f46e5'),
});

export const kitchenWishlist = sqliteTable('kitchen_wishlist', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand'),
  category: text('category').default('tool'),
  priority: text('priority').default('medium'), // high | medium | low
  estimatedPrice: real('estimated_price'),
  notes: text('notes'),
  url: text('url'),
  imageUrl: text('image_url'),
  acquired: integer('acquired').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: integer('created_at').notNull(),
});

// ── Social ───────────────────────────────────────────────────────────────────

export const socialSources = sqliteTable('social_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // reddit_rss|rss|youtube_atom
  url: text('url').notNull(),
  active: integer('active').default(1),
  lastFetched: integer('last_fetched'),
  createdAt: integer('created_at').notNull(),
});

export const socialPosts = sqliteTable('social_posts', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').references(() => socialSources.id),
  externalId: text('external_id'),
  title: text('title'),
  description: text('description'),
  url: text('url').notNull(),
  imageUrl: text('image_url'),
  author: text('author'),
  publishedAt: integer('published_at'),
  fetchedAt: integer('fetched_at').notNull(),
  tags: text('tags'), // JSON array
  liked: integer('liked').default(0),
  notes: text('notes'),
});

// ── Yes Chef ─────────────────────────────────────────────────────────────────

export const chatSessions = sqliteTable('chat_sessions', {
  id: text('id').primaryKey(),
  title: text('title'),
  mode: text('mode').default('quick'),
  model: text('model'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').references(() => chatSessions.id),
  role: text('role').notNull(), // user|assistant|system
  content: text('content').notNull(),
  contextUsed: text('context_used'), // JSON
  tokensUsed: integer('tokens_used'),
  createdAt: integer('created_at').notNull(),
});
