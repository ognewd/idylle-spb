-- Создаем таблицу сезонных скидок
CREATE TABLE IF NOT EXISTS "seasonal_discounts" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "discount" DECIMAL(5,2) NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "applyTo" TEXT NOT NULL DEFAULT 'categories',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создаем таблицу связей сезонных скидок с категориями
CREATE TABLE IF NOT EXISTS "seasonal_discount_categories" (
  "id" TEXT PRIMARY KEY,
  "seasonalDiscountId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("seasonalDiscountId") REFERENCES "seasonal_discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Создаем таблицу связей сезонных скидок с продуктами
CREATE TABLE IF NOT EXISTS "seasonal_discount_products" (
  "id" TEXT PRIMARY KEY,
  "seasonalDiscountId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("seasonalDiscountId") REFERENCES "seasonal_discounts"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS "seasonal_discounts_startDate_idx" ON "seasonal_discounts"("startDate");
CREATE INDEX IF NOT EXISTS "seasonal_discounts_endDate_idx" ON "seasonal_discounts"("endDate");
CREATE INDEX IF NOT EXISTS "seasonal_discounts_isActive_idx" ON "seasonal_discounts"("isActive");
CREATE INDEX IF NOT EXISTS "seasonal_discount_categories_seasonalDiscountId_idx" ON "seasonal_discount_categories"("seasonalDiscountId");
CREATE INDEX IF NOT EXISTS "seasonal_discount_categories_categoryId_idx" ON "seasonal_discount_categories"("categoryId");
CREATE INDEX IF NOT EXISTS "seasonal_discount_products_seasonalDiscountId_idx" ON "seasonal_discount_products"("seasonalDiscountId");
CREATE INDEX IF NOT EXISTS "seasonal_discount_products_productId_idx" ON "seasonal_discount_products"("productId");


