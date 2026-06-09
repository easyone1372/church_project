-- AlterTable User: remove password, make email nullable
ALTER TABLE `User`
    DROP COLUMN `password`,
    MODIFY COLUMN `email` VARCHAR(255) NULL;

-- CreateTable OAuthAccount
CREATE TABLE `OAuthAccount` (
    `id`                VARCHAR(191) NOT NULL,
    `provider`          VARCHAR(20)  NOT NULL,
    `providerAccountId` VARCHAR(100) NOT NULL,
    `accessToken`       TEXT         NULL,
    `refreshToken`      TEXT         NULL,
    `expiresAt`         INTEGER      NULL,
    `createdAt`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `userId`            INTEGER      NOT NULL,

    UNIQUE INDEX `OAuthAccount_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OAuthAccount` ADD CONSTRAINT `OAuthAccount_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
