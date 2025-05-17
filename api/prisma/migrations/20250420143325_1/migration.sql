/*
  Warnings:

  - You are about to drop the column `groupId` on the `Subject` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subject" DROP CONSTRAINT "Subject_groupId_fkey";

-- AlterTable
ALTER TABLE "Subject" DROP COLUMN "groupId";

-- CreateTable
CREATE TABLE "_GroupSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GroupSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GroupSubject_B_index" ON "_GroupSubject"("B");

-- AddForeignKey
ALTER TABLE "_GroupSubject" ADD CONSTRAINT "_GroupSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GroupSubject" ADD CONSTRAINT "_GroupSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
