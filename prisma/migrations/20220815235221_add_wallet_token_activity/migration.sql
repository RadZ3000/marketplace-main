-- CreateTable
CREATE TABLE "WalletTokenActivity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "collectionId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "like" BOOLEAN NOT NULL,
    "views" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletTokenActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "collection_token_wallet_activity_idx" ON "WalletTokenActivity"("collectionId", "tokenId", "walletAddress");
