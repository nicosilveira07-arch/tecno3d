-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "baseStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "colorHex" TEXT;

-- Preserve existing stock
UPDATE "Product"
SET "baseStock" = CASE
  WHEN "hasVariants" = true THEN 0
  ELSE "stock"
END;