CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`context_used` text,
	`tokens_used` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`mode` text DEFAULT 'quick',
	`model` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `floorplan_annotations` (
	`id` text PRIMARY KEY NOT NULL,
	`floorplan_id` text,
	`equipment_id` text,
	`label` text,
	`x_pct` real NOT NULL,
	`y_pct` real NOT NULL,
	`rotation_deg` real DEFAULT 0,
	`width_pct` real DEFAULT 0.08,
	`height_pct` real DEFAULT 0.08,
	`color` text DEFAULT '#4f46e5',
	FOREIGN KEY (`floorplan_id`) REFERENCES `kitchen_floorplans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`equipment_id`) REFERENCES `kitchen_equipment`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `grocery_items` (
	`id` text PRIMARY KEY NOT NULL,
	`receipt_id` text,
	`name` text NOT NULL,
	`normalized_name` text,
	`category` text DEFAULT 'other',
	`quantity` real,
	`unit` text,
	`purchase_date` integer,
	`expiry_date` integer,
	`running_low` integer DEFAULT 0,
	`notes` text,
	`wiki_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`receipt_id`) REFERENCES `receipts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `kitchen_equipment` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`model` text,
	`category` text DEFAULT 'other',
	`subcategory` text,
	`condition` text DEFAULT 'good',
	`notes` text,
	`image_path` text,
	`purchased_date` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kitchen_floorplans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'My Kitchen',
	`image_path` text NOT NULL,
	`width_ft` real,
	`height_ft` real,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`image_path` text NOT NULL,
	`upload_date` integer NOT NULL,
	`processed` integer DEFAULT 0,
	`raw_llm_output` text,
	`item_count` integer DEFAULT 0,
	`merchant_name` text,
	`receipt_date` integer
);
--> statement-breakpoint
CREATE TABLE `recipe_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text,
	`wiki_id` text,
	`name_override` text,
	`amount` real,
	`unit` text,
	`notes` text,
	`optional` integer DEFAULT 0,
	`step_order` integer,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`wiki_id`) REFERENCES `wiki_ingredients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipe_media` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text,
	`type` text NOT NULL,
	`url_or_path` text NOT NULL,
	`caption` text,
	`is_primary` integer DEFAULT 0,
	`sort_order` integer DEFAULT 0,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipe_steps` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_id` text,
	`step_number` integer NOT NULL,
	`instruction` text NOT NULL,
	`duration_min` integer,
	`tip` text,
	`image_path` text,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`cuisine` text,
	`difficulty` text DEFAULT 'medium',
	`prep_time_min` integer,
	`cook_time_min` integer,
	`servings` integer DEFAULT 4,
	`tags` text,
	`source_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `social_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text,
	`external_id` text,
	`title` text,
	`description` text,
	`url` text NOT NULL,
	`image_url` text,
	`author` text,
	`published_at` integer,
	`fetched_at` integer NOT NULL,
	`tags` text,
	`liked` integer DEFAULT 0,
	`notes` text,
	FOREIGN KEY (`source_id`) REFERENCES `social_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `social_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`active` integer DEFAULT 1,
	`last_fetched` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wiki_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`aliases` text,
	`description` text,
	`category` text,
	`subcategory` text,
	`origin` text,
	`seasons` text,
	`flavor_profile` text,
	`image_url` text,
	`usda_fdc_id` text,
	`flavor_graph_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wiki_ingredients_name_unique` ON `wiki_ingredients` (`name`);--> statement-breakpoint
CREATE TABLE `wiki_nutrition` (
	`ingredient_id` text PRIMARY KEY NOT NULL,
	`calories` real,
	`protein_g` real,
	`carbs_g` real,
	`fat_g` real,
	`fiber_g` real,
	`sugar_g` real,
	`sodium_mg` real,
	`vitamins` text,
	`minerals` text,
	`serving_size_g` real DEFAULT 100,
	`source` text DEFAULT 'usda',
	FOREIGN KEY (`ingredient_id`) REFERENCES `wiki_ingredients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wiki_relationships` (
	`id` text PRIMARY KEY NOT NULL,
	`ingredient_a_id` text,
	`ingredient_b_id` text,
	`relationship` text NOT NULL,
	`strength` real DEFAULT 0.5,
	`shared_compounds` text,
	`notes` text,
	FOREIGN KEY (`ingredient_a_id`) REFERENCES `wiki_ingredients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ingredient_b_id`) REFERENCES `wiki_ingredients`(`id`) ON UPDATE no action ON DELETE no action
);
