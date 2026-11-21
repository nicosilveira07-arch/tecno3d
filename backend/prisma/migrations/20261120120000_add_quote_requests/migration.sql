-- CreateEnum
CREATE TYPE "QuoteRequestStatus" AS ENUM ('PENDING', 'QUOTED', 'ACCEPTED', 'PAID', 'REJECTED_BY_CUSTOMER');

-- AlterTable
ALTER TABLE "CheckoutSession" ADD COLUMN "quoteId" TEXT;

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "quotedPrice" DOUBLE PRECISION,
    "adminMessage" TEXT,
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'PENDING',
    "quotedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSession_quoteId_key" ON "CheckoutSession"("quoteId");

-- CreateIndex
CREATE INDEX "QuoteRequest_userId_status_idx" ON "QuoteRequest"("userId", "status");

-- CreateIndex
CREATE INDEX "QuoteRequest_status_createdAt_idx" ON "QuoteRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "CheckoutSession" ADD CONSTRAINT "CheckoutSession_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "QuoteRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;