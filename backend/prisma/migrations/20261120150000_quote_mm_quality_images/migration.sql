-- CreateTable
CREATE TABLE "QuoteRequestImage" (
    "id" TEXT NOT NULL,
    "quoteRequestId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteRequestImage_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN "widthMm" INTEGER;
ALTER TABLE "QuoteRequest" ADD COLUMN "heightMm" INTEGER;
ALTER TABLE "QuoteRequest" ADD COLUMN "quality" INTEGER;

UPDATE "QuoteRequest"
SET
  "widthMm" = GREATEST(1, ROUND(COALESCE("widthCm", 25) * 10)::INTEGER),
  "heightMm" = GREATEST(1, ROUND(COALESCE("heightCm", 25) * 10)::INTEGER),
  "quality" = 100
WHERE "widthMm" IS NULL;

INSERT INTO "QuoteRequestImage" ("id", "quoteRequestId", "imageUrl", "imagePublicId", "sortOrder", "createdAt")
SELECT
  "id" || '-img-0',
  "id",
  "imageUrl",
  "imagePublicId",
  0,
  NOW()
FROM "QuoteRequest"
WHERE "imageUrl" IS NOT NULL AND "imagePublicId" IS NOT NULL;

ALTER TABLE "QuoteRequest" ALTER COLUMN "widthMm" SET NOT NULL;
ALTER TABLE "QuoteRequest" ALTER COLUMN "heightMm" SET NOT NULL;
ALTER TABLE "QuoteRequest" ALTER COLUMN "quality" SET NOT NULL;

ALTER TABLE "QuoteRequest" DROP COLUMN "widthCm";
ALTER TABLE "QuoteRequest" DROP COLUMN "heightCm";
ALTER TABLE "QuoteRequest" DROP COLUMN "imageUrl";
ALTER TABLE "QuoteRequest" DROP COLUMN "imagePublicId";

-- CreateIndex
CREATE INDEX "QuoteRequestImage_quoteRequestId_sortOrder_idx" ON "QuoteRequestImage"("quoteRequestId", "sortOrder");

-- AddForeignKey
ALTER TABLE "QuoteRequestImage" ADD CONSTRAINT "QuoteRequestImage_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;