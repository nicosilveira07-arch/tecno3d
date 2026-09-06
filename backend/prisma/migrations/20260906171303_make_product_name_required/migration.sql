/*
  Warnings:

  - Made the column `productName` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "productName" SET NOT NULL;
