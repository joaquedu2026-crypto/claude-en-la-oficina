/*
  Warnings:

  - You are about to drop the column `branch` on the `Catalog` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Catalog` table. All the data in the column will be lost.
  - You are about to drop the column `showInGallery` on the `Catalog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Catalog" DROP COLUMN "branch",
DROP COLUMN "category",
DROP COLUMN "showInGallery";

-- CreateTable
CREATE TABLE "BranchLink" (
    "id" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchLink_pkey" PRIMARY KEY ("id")
);
