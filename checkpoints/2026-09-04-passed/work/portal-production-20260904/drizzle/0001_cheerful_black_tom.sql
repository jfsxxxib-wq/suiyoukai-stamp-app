CREATE TABLE `history_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`device_hash` text NOT NULL,
	`app_number` text NOT NULL,
	`completed` text,
	`synced` integer DEFAULT 0 NOT NULL
);
