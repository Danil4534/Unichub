/*
  Warnings:

  - You are about to drop the column `capacity` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the `Announcement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_groupId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "capacity";

-- DropTable
DROP TABLE "Announcement";
