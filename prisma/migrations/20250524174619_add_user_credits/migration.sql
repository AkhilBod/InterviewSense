-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "lastCreditReset" TIMESTAMP(3);
