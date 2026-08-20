-- AlterTable
ALTER TABLE "StoreSettings" ADD COLUMN     "offerButtonText" TEXT,
ADD COLUMN     "offerButtonUrl" TEXT DEFAULT '/offers',
ADD COLUMN     "offerDescription" TEXT,
ADD COLUMN     "offerEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "offerEyebrow" TEXT,
ADD COLUMN     "offerTitle" TEXT;
