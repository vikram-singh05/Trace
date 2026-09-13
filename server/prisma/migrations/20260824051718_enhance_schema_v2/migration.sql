-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ITEM_MODERATED';

-- AlterTable
ALTER TABLE "claims" ADD COLUMN     "autoScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "isReviewed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "verification_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "verification_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_answers" (
    "id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "claimId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "claim_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_questions_itemId_idx" ON "verification_questions"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "claim_answers_claimId_questionId_key" ON "claim_answers"("claimId", "questionId");

-- CreateIndex
CREATE INDEX "claims_claimantId_idx" ON "claims"("claimantId");

-- CreateIndex
CREATE INDEX "claims_itemId_idx" ON "claims"("itemId");

-- CreateIndex
CREATE INDEX "items_reporterId_idx" ON "items"("reporterId");

-- CreateIndex
CREATE INDEX "items_type_status_idx" ON "items"("type", "status");

-- CreateIndex
CREATE INDEX "items_categoryId_idx" ON "items"("categoryId");

-- CreateIndex
CREATE INDEX "items_deletedAt_idx" ON "items"("deletedAt");

-- CreateIndex
CREATE INDEX "items_dateOccurred_idx" ON "items"("dateOccurred");

-- CreateIndex
CREATE INDEX "matches_lostItemId_idx" ON "matches"("lostItemId");

-- CreateIndex
CREATE INDEX "matches_foundItemId_idx" ON "matches"("foundItemId");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "verification_questions" ADD CONSTRAINT "verification_questions_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_answers" ADD CONSTRAINT "claim_answers_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_answers" ADD CONSTRAINT "claim_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "verification_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
