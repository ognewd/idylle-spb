-- SQL скрипт для применения недостающих индексов на таблице products
-- Выполните этот скрипт в Supabase SQL Editor

-- Проверяем существующие индексы
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'products' 
ORDER BY indexname;

-- Применяем недостающие индексы (только если их нет)

-- Индекс для slug (для быстрого поиска по slug)
CREATE INDEX IF NOT EXISTS "products_slug_idx" ON "products"("slug");

-- Индекс для isActive (для фильтрации активных товаров)
CREATE INDEX IF NOT EXISTS "products_isActive_idx" ON "products"("isActive");

-- Индекс для brandId (для фильтрации по бренду)
CREATE INDEX IF NOT EXISTS "products_brandId_idx" ON "products"("brandId");

-- Индекс для price (для сортировки по цене)
CREATE INDEX IF NOT EXISTS "products_price_idx" ON "products"(price);

-- Комбинированный индекс для isActive и brandId (для частых запросов)
CREATE INDEX IF NOT EXISTS "products_isActive_brandId_idx" ON "products"("isActive", "brandId");

-- Проверяем результат
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'products' 
ORDER BY indexname;

