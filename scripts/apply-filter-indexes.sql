-- Индексы для оптимизации фильтров
-- Примените эти индексы в Supabase SQL Editor для ускорения работы фильтров

-- Индексы для полей фильтрации
CREATE INDEX IF NOT EXISTS "products_productType_idx" ON "products"("productType");
CREATE INDEX IF NOT EXISTS "products_volume_idx" ON "products"("volume");
CREATE INDEX IF NOT EXISTS "products_purpose_idx" ON "products"("purpose");
CREATE INDEX IF NOT EXISTS "products_country_idx" ON "products"("country");

-- Составные индексы для фильтрации с isActive
CREATE INDEX IF NOT EXISTS "products_isActive_productType_idx" ON "products"("isActive", "productType");
CREATE INDEX IF NOT EXISTS "products_isActive_volume_idx" ON "products"("isActive", "volume");
CREATE INDEX IF NOT EXISTS "products_isActive_purpose_idx" ON "products"("isActive", "purpose");
CREATE INDEX IF NOT EXISTS "products_isActive_country_idx" ON "products"("isActive", "country");

