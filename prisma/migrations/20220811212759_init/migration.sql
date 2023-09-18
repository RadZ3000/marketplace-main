CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateTable
CREATE TABLE "Listing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "collectionId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "providerNetwork" TEXT NOT NULL,
    "providerListingId" TEXT NOT NULL,
    "providerContractId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT,
    "creatorAddress" TEXT NOT NULL,
    "amountText" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" TIMESTAMPTZ(6) NOT NULL,
    "endTime" TIMESTAMPTZ(6),
    "quantity" BIGINT NOT NULL,
    "cancelledAt" TIMESTAMPTZ(6),
    "fulfilledAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "collectionId" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "listingId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "amountText" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listing_collection_token_idx" ON "Listing"("collectionId", "tokenId");

-- CreateIndex
CREATE UNIQUE INDEX "listing_provider_idx" ON "Listing"("providerNetwork", "providerListingId", "providerContractId", "provider");

-- CreateIndex
CREATE INDEX "activity_collection_token_idx" ON "Activity"("collectionId", "tokenId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
