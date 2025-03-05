/*
  Warnings:

  - You are about to drop the `RichTextContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "TheNeed" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "features" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "RichTextContent";
