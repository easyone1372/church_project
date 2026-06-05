-- Drop PostKeyword (replaced by normalized Hashtag + PostHashtag)
DROP TABLE IF EXISTS `PostKeyword`;

-- CreateTable Hashtag
CREATE TABLE `Hashtag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    UNIQUE INDEX `Hashtag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable PostHashtag
CREATE TABLE `PostHashtag` (
    `postId` INTEGER NOT NULL,
    `hashtagId` INTEGER NOT NULL,
    PRIMARY KEY (`postId`, `hashtagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey PostHashtag
ALTER TABLE `PostHashtag` ADD CONSTRAINT `PostHashtag_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `PostHashtag` ADD CONSTRAINT `PostHashtag_hashtagId_fkey` FOREIGN KEY (`hashtagId`) REFERENCES `Hashtag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Comment: make authorId nullable, add guestName
ALTER TABLE `Comment`
    MODIFY COLUMN `authorId` INTEGER NULL,
    ADD COLUMN `guestName` VARCHAR(50) NULL;
