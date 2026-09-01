CREATE TABLE `teachers` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `match_records` (
	`id` text PRIMARY KEY NOT NULL,
	`played_on` text NOT NULL,
	`played_at` text,
	`participant_id` text,
	`participant_name` text NOT NULL,
	`rank` text,
	`teacher_id` text NOT NULL,
	`handicap_type` text,
	`stone_count` integer,
	`reverse_komi_half_points` integer,
	`reverse_komi_recipient` text DEFAULT 'black' NOT NULL,
	`result` text,
	`source` text NOT NULL,
	`source_reference` text,
	`created_by` text NOT NULL,
	`updated_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `teachers`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT `match_records_stone_count_check` CHECK (`stone_count` IS NULL OR (`stone_count` BETWEEN 2 AND 9)),
	CONSTRAINT `match_records_reverse_komi_check` CHECK (`reverse_komi_half_points` IS NULL OR `reverse_komi_half_points` > 0),
	CONSTRAINT `match_records_handicap_pair_check` CHECK ((`handicap_type` IS NULL AND `stone_count` IS NULL) OR (`handicap_type` = 'sen' AND `stone_count` IS NULL) OR (`handicap_type` = 'stones' AND `stone_count` BETWEEN 2 AND 9))
);
--> statement-breakpoint
CREATE INDEX `match_records_teacher_date_time_idx` ON `match_records` (`teacher_id`,`played_on`,`played_at`);
--> statement-breakpoint
CREATE INDEX `match_records_date_time_idx` ON `match_records` (`played_on`,`played_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `match_records_source_reference_idx` ON `match_records` (`source_reference`);
--> statement-breakpoint
CREATE TABLE `match_record_audit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`match_id` text NOT NULL,
	`action` text NOT NULL,
	`actor_id` text NOT NULL,
	`snapshot_json` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `match_records`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `match_record_audit_match_created_idx` ON `match_record_audit` (`match_id`,`created_at`);
--> statement-breakpoint
DROP TABLE `test_receptions`;
