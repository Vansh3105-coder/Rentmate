CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`title` varchar(160) NOT NULL,
	`propertyType` enum('flat','house','apartment','pg','studio') NOT NULL,
	`city` varchar(120) NOT NULL,
	`locality` varchar(160) NOT NULL,
	`monthlyRent` int NOT NULL,
	`bedrooms` int NOT NULL DEFAULT 1,
	`furnishing` enum('unfurnished','semi_furnished','fully_furnished') NOT NULL DEFAULT 'unfurnished',
	`description` text,
	`imageUrl` varchar(1000),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `properties` ADD CONSTRAINT `properties_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;