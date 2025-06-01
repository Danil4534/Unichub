/*
  Warnings:

  - You are about to drop the column `uploadedAt` on the `StudentFile` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `TeacherFile` table. All the data in the column will be lost.
  - Added the required column `name` to the `StudentFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `StudentFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `StudentFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `TeacherFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `TeacherFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `TeacherFile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "StudentFile" DROP CONSTRAINT "StudentFile_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TeacherFile" DROP CONSTRAINT "TeacherFile_taskId_fkey";

-- AlterTable
ALTER TABLE "StudentFile" DROP COLUMN "uploadedAt",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeacherFile" DROP COLUMN "uploadedAt",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "StudentFile" ADD CONSTRAINT "StudentFile_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherFile" ADD CONSTRAINT "TeacherFile_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
