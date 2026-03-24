CREATE TABLE `kitchen_wishlist` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text,
	`category` text DEFAULT 'tool',
	`priority` text DEFAULT 'medium',
	`estimated_price` real,
	`notes` text,
	`url` text,
	`image_url` text,
	`acquired` integer DEFAULT 0,
	`sort_order` integer DEFAULT 0,
	`created_at` integer NOT NULL
);
