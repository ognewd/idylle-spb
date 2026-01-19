-- AlterTable: Add isApproved field for review moderation
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Make userId optional for anonymous reviews
ALTER TABLE "reviews" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable: Add userName and userEmail for anonymous reviews
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "userName" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "userEmail" TEXT;

-- Drop unique constraint on userId_productId (if exists) since userId can be null
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_userId_productId_key";
