-- AlterTable
ALTER TABLE "CheckoutSession" ADD COLUMN     "paymentInstructionsUrl" TEXT,
ADD COLUMN     "paymentReferenceId" TEXT,
ADD COLUMN     "paymentVerificationCode" TEXT;
