-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "offerActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerPercentage" INTEGER,
ADD COLUMN     "offerPrice" DOUBLE PRECISION;
