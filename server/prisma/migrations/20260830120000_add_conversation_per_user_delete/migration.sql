-- AlterTable
ALTER TABLE "conversations" ADD COLUMN     "claimantDeletedAt" TIMESTAMP(3),
ADD COLUMN     "reporterDeletedAt" TIMESTAMP(3);
