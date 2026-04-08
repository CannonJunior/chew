ALTER TABLE `grocery_items` ADD COLUMN `price` real;
--> statement-breakpoint
ALTER TABLE `grocery_items` ADD COLUMN `removed_at` integer;
--> statement-breakpoint
ALTER TABLE `grocery_items` ADD COLUMN `removal_reason` text;
