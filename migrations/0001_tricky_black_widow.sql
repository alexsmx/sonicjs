CREATE TABLE `user_prompt` (
	`id` text PRIMARY KEY NOT NULL,
	`base_prompt` text,
	`input_variables` text,
	`human_template` text,
	`text` text,
	`memory_size` integer,
	`intro` text,
	`outro` text,
	`temperature` real,
	`description` text,
	`hidden` integer,
	`userId` text,
	`createdOn` integer,
	`updatedOn` integer
);
