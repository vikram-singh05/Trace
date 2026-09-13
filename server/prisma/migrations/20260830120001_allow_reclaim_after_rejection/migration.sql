-- DropIndex
DROP INDEX "claims_itemId_claimantId_key";

-- CreateIndex
CREATE INDEX "claims_itemId_claimantId_idx" ON "claims"("itemId", "claimantId");
