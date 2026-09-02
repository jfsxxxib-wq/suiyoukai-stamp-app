CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`app_number` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "participants_app_number_check" CHECK(length("participants"."app_number") = 8 AND "participants"."app_number" NOT GLOB '*[^0-9]*')
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_app_number_idx` ON `participants` (`app_number`);
--> statement-breakpoint
CREATE TABLE `receptions` (
	`id` text PRIMARY KEY NOT NULL,
	`received_on` text NOT NULL,
	`sequence` integer NOT NULL,
	`reception_number` text NOT NULL,
	`display_name` text NOT NULL,
	`participant_id` text,
	`reception_status` text DEFAULT 'complete' NOT NULL,
	`app_link_status` text DEFAULT 'unlinked' NOT NULL,
	`stamp_status` text DEFAULT 'not_sent' NOT NULL,
	`received_at` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "receptions_sequence_check" CHECK("receptions"."sequence" BETWEEN 1 AND 999)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `receptions_number_idx` ON `receptions` (`reception_number`);
--> statement-breakpoint
CREATE UNIQUE INDEX `receptions_date_sequence_idx` ON `receptions` (`received_on`,`sequence`);
--> statement-breakpoint
CREATE INDEX `receptions_date_status_idx` ON `receptions` (`received_on`,`app_link_status`,`stamp_status`);
--> statement-breakpoint
CREATE INDEX `receptions_participant_idx` ON `receptions` (`participant_id`);
--> statement-breakpoint
CREATE TABLE `app_link_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`reception_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `app_link_tickets_token_hash_idx` ON `app_link_tickets` (`token_hash`);
--> statement-breakpoint
CREATE INDEX `app_link_tickets_reception_idx` ON `app_link_tickets` (`reception_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `stamp_events` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`reception_id` text,
	`amount` integer NOT NULL,
	`event_type` text NOT NULL,
	`status` text NOT NULL,
	`source_reference` text NOT NULL,
	`actor_id` text NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL,
	`applied_at` integer,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "stamp_events_amount_check" CHECK("stamp_events"."amount" IN (-1, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stamp_events_source_reference_idx` ON `stamp_events` (`source_reference`);
--> statement-breakpoint
CREATE INDEX `stamp_events_participant_status_idx` ON `stamp_events` (`participant_id`,`status`,`created_at`);
--> statement-breakpoint
CREATE TABLE `reception_audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reception_id` text NOT NULL,
	`action` text NOT NULL,
	`actor_id` text NOT NULL,
	`detail_json` text NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reception_audit_reception_created_idx` ON `reception_audit` (`reception_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `spreadsheet_mirror` (
	`reception_id` text PRIMARY KEY NOT NULL,
	`row_json` text NOT NULL,
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`updated_at` integer NOT NULL,
	`synced_at` integer,
	FOREIGN KEY (`reception_id`) REFERENCES `receptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `spreadsheet_mirror_sync_status_idx` ON `spreadsheet_mirror` (`sync_status`,`updated_at`);
