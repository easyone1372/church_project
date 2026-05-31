-- CreateTable
CREATE TABLE `Post` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `location` VARCHAR(100) NOT NULL,
    `locationTags` JSON NOT NULL,
    `price` VARCHAR(100) NOT NULL,
    `imageEmoji` VARCHAR(10) NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `tags` JSON NOT NULL,
    `keywords` JSON NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
