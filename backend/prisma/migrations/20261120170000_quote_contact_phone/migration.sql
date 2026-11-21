-- AlterTable
ALTER TABLE "QuoteRequest" ADD COLUMN "contactPhone" TEXT;

UPDATE "QuoteRequest" AS q
SET "contactPhone" = COALESCE(NULLIF(TRIM(u.phone), ''), 'Sin dato')
FROM "User" AS u
WHERE q."userId" = u.id AND q."contactPhone" IS NULL;

UPDATE "QuoteRequest"
SET "contactPhone" = 'Sin dato'
WHERE "contactPhone" IS NULL OR TRIM("contactPhone") = '';

ALTER TABLE "QuoteRequest" ALTER COLUMN "contactPhone" SET NOT NULL;