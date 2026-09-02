CREATE TABLE `test_receptions` (
	`id` text PRIMARY KEY NOT NULL,
	`reception_code` text NOT NULL,
	`display_name` text NOT NULL,
	`status` text NOT NULL,
	`resume_token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `test_receptions_reception_code_unique` ON `test_receptions` (`reception_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `test_receptions_resume_token_unique` ON `test_receptions` (`resume_token`);--> statement-breakpoint
CREATE INDEX `test_receptions_status_updated_idx` ON `test_receptions` (`status`,`updated_at`);