-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneVerificationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneVerificationCodeHash" TEXT,
ADD COLUMN     "phoneVerificationExpiresAt" TIMESTAMP(3),
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
