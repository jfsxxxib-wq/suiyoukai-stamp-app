ALTER TABLE `receptions_20260902` ADD `display_name` text;--> statement-breakpoint
CREATE UNIQUE INDEX `receptions_20260902_display_name_unique` ON `receptions_20260902` (`display_name`);--> statement-breakpoint
PRAGMA optimize;
