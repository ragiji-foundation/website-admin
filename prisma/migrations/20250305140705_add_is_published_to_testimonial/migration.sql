/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Testimonial` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Testimonial" DROP COLUMN "updatedAt",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false;
