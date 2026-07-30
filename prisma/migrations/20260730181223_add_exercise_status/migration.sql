-- AlterTable
ALTER TABLE `lessonprogress` ADD COLUMN `exerciseStatus` ENUM('PENDING_REVIEW', 'APPROVED', 'REJECTED') NULL;
