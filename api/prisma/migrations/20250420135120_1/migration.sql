/*
  Warnings:

  - You are about to drop the `_GroupToSubject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `groupId` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_GroupToSubject" DROP CONSTRAINT "_GroupToSubject_A_fkey";

-- DropForeignKey
ALTER TABLE "_GroupToSubject" DROP CONSTRAINT "_GroupToSubject_B_fkey";

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "groupId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_GroupToSubject";

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
