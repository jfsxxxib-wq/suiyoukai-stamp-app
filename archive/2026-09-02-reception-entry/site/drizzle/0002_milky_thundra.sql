CREATE TABLE `reception_sequences_20260902` (
	`event_key` text PRIMARY KEY NOT NULL,
	`last_number` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `receptions_20260902` (
	`id` text PRIMARY KEY NOT NULL,
	`reception_code` text NOT NULL,
	`status` text NOT NULL,
	`resume_token_hash` text NOT NULL,
	`client_request_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receptions_20260902_reception_code_unique` ON `receptions_20260902` (`reception_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `receptions_20260902_resume_token_hash_unique` ON `receptions_20260902` (`resume_token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `receptions_20260902_client_request_id_unique` ON `receptions_20260902` (`client_request_id`);--> statement-breakpoint
CREATE INDEX `receptions_20260902_status_updated_idx` ON `receptions_20260902` (`status`,`updated_at`);
--> statement-breakpoint
PRAGMA optimize;
