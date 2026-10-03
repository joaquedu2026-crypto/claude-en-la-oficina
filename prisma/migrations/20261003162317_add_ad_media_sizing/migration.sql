-- AlterTable
ALTER TABLE "Ad" ADD COLUMN     "fullWidth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mediaHeight" INTEGER,
ADD COLUMN     "mediaWidth" INTEGER;
