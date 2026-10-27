CREATE TABLE `ownerVerifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`propertyType` enum('flat','house','apartment','pg','studio') NOT NULL,
	`proofType` enum('government_id','ownership_document','gst_certificate','rental_authorization') NOT NULL,
	`proofUrl` varchar(1000) NOT NULL,
	`proofFileName` varchar(255) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`submittedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `ownerVerifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `accountType` enum('renter','owner') DEFAULT 'renter' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `onboardingComplete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ownerVerifications` ADD CONSTRAINT `ownerVerifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;