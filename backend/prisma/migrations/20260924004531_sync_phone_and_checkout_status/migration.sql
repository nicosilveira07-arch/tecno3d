/*
  Warnings:

  - The values [EXPIRED] on the enum `CheckoutSessionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CheckoutSessionStatus_new" AS ENUM ('ACTIVE', 'PAYMENT_PENDING', 'COMPLETED', 'FAILED');
ALTER TABLE "public"."CheckoutSession" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CheckoutSession" ALTER COLUMN "status" TYPE "CheckoutSessionStatus_new" USING ("status"::text::"CheckoutSessionStatus_new");
ALTER TYPE "CheckoutSessionStatus" RENAME TO "CheckoutSessionStatus_old";
ALTER TYPE "CheckoutSessionStatus_new" RENAME TO "CheckoutSessionStatus";
DROP TYPE "public"."CheckoutSessionStatus_old";
ALTER TABLE "CheckoutSession" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;
