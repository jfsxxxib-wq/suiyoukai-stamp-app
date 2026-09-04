CREATE TABLE `gate_devices` (
	`hash` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `gate_participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `gate_participants` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`family` text NOT NULL,
	`given` text NOT NULL,
	`request_hash` text NOT NULL,
	`session_hash` text NOT NULL,
	`created` text NOT NULL,
	`app_number` text,
	`version` integer DEFAULT 1 NOT NULL,
	`synced` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gate_participants_number_unique` ON `gate_participants` (`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `gate_participants_request_hash_unique` ON `gate_participants` (`request_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `gate_participants_session_hash_unique` ON `gate_participants` (`session_hash`);--> statement-breakpoint
CREATE TABLE `gate_rates` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gate_tickets` (
	`hash` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`expires` integer NOT NULL,
	`used` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `gate_participants`(`id`) ON UPDATE no action ON DELETE no action
);
