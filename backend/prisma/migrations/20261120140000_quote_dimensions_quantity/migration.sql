-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN "quantity" INTEGER;
ALTER TABLE "QuoteRequest" ADD COLUMN "widthCm" DOUBLE PRECISION;
ALTER TABLE "QuoteRequest" ADD COLUMN "heightCm" DOUBLE PRECISION;

UPDATE "QuoteRequest"
SET
  "quantity" = 1,
  "widthCm" = 25,
  "heightCm" = 25
WHERE "quantity" IS NULL;

ALTER TABLE "QuoteRequest" ALTER COLUMN "quantity" SET NOT NULL;
ALTER TABLE "QuoteRequest" ALTER COLUMN "widthCm" SET NOT NULL;
ALTER TABLE "QuoteRequest" ALTER COLUMN "heightCm" SET NOT NULL;

ALTER TABLE "QuoteRequest" ALTER COLUMN "description" SET DEFAULT '';