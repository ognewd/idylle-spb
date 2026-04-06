-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "dealerProfileId" TEXT,
ADD COLUMN     "orderType" TEXT NOT NULL DEFAULT 'retail';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "dealer_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contacts" TEXT NOT NULL,
    "requisites" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_brand_accesses" (
    "id" TEXT NOT NULL,
    "dealerProfileId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_brand_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_product_discounts" (
    "id" TEXT NOT NULL,
    "dealerProfileId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_product_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_category_discounts" (
    "id" TEXT NOT NULL,
    "dealerProfileId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_category_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dealer_requests" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contacts" TEXT NOT NULL,
    "requisites" TEXT NOT NULL,
    "brands" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "managerNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dealer_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dealer_profiles_userId_key" ON "dealer_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_brand_accesses_dealerProfileId_brandId_key" ON "dealer_brand_accesses"("dealerProfileId", "brandId");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_product_discounts_dealerProfileId_productId_key" ON "dealer_product_discounts"("dealerProfileId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "dealer_category_discounts_dealerProfileId_categoryId_key" ON "dealer_category_discounts"("dealerProfileId", "categoryId");

-- AddForeignKey
ALTER TABLE "dealer_profiles" ADD CONSTRAINT "dealer_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_brand_accesses" ADD CONSTRAINT "dealer_brand_accesses_dealerProfileId_fkey" FOREIGN KEY ("dealerProfileId") REFERENCES "dealer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_brand_accesses" ADD CONSTRAINT "dealer_brand_accesses_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_product_discounts" ADD CONSTRAINT "dealer_product_discounts_dealerProfileId_fkey" FOREIGN KEY ("dealerProfileId") REFERENCES "dealer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_product_discounts" ADD CONSTRAINT "dealer_product_discounts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_category_discounts" ADD CONSTRAINT "dealer_category_discounts_dealerProfileId_fkey" FOREIGN KEY ("dealerProfileId") REFERENCES "dealer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dealer_category_discounts" ADD CONSTRAINT "dealer_category_discounts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_dealerProfileId_fkey" FOREIGN KEY ("dealerProfileId") REFERENCES "dealer_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

