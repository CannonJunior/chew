CREATE TABLE `recipe_ratings` (
	`recipe_id` text PRIMARY KEY NOT NULL REFERENCES `recipes`(`id`),
	`picture` integer,
	`quality` integer,
	`uniqueness` integer,
	`updated_at` integer NOT NULL
);
