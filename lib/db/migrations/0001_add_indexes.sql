-- Performance indexes for foreign keys and frequently-queried columns

-- wiki_ingredients: name is already unique (implicit index), add category for filtering
CREATE INDEX IF NOT EXISTS idx_wiki_ingredients_category ON wiki_ingredients(category);
--> statement-breakpoint

-- wiki_relationships: both FK columns used in OR queries
CREATE INDEX IF NOT EXISTS idx_wiki_relationships_a ON wiki_relationships(ingredient_a_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_wiki_relationships_b ON wiki_relationships(ingredient_b_id);
--> statement-breakpoint

-- recipe sub-tables: FK lookups on every recipe detail load
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_recipe_steps_recipe ON recipe_steps(recipe_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_recipe_media_recipe ON recipe_media(recipe_id);
--> statement-breakpoint

-- recipes: title search
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes(title);
--> statement-breakpoint

-- grocery_items: category filtering, running_low widget
CREATE INDEX IF NOT EXISTS idx_grocery_items_category ON grocery_items(category);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_grocery_items_running_low ON grocery_items(running_low);
--> statement-breakpoint

-- social_posts: externalId deduplication check (currently N+1 per item)
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_posts_external_id ON social_posts(external_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_social_posts_source ON social_posts(source_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_social_posts_liked ON social_posts(liked);
--> statement-breakpoint

-- floorplan_annotations: FK lookup on every floorplan load
CREATE INDEX IF NOT EXISTS idx_floorplan_annotations_floorplan ON floorplan_annotations(floorplan_id);
--> statement-breakpoint

-- chat_messages: session lookup
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
