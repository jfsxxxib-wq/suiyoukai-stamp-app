CREATE TABLE `reception_sequences` (
	`event_key` text PRIMARY KEY NOT NULL,
	`last_number` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE `test_receptions` ADD `client_request_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `test_receptions_client_request_id_unique` ON `test_receptions` (`client_request_id`);