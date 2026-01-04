# 🔍 Как проверить, что индексы БД применились

## Способ 1: Через Supabase Dashboard (Самый простой)

1. Откройте https://supabase.com/dashboard
2. Войдите в свой аккаунт
3. Выберите проект (ваш проект с БД)
4. Перейдите в раздел **"Database"** в левом меню
5. Откройте вкладку **"Indexes"**
6. Найдите таблицу **"products"**
7. Проверьте наличие следующих индексов:
   - ✅ `products_slug_idx` - индекс на slug
   - ✅ `products_isActive_idx` - индекс на isActive
   - ✅ `products_brandId_idx` - индекс на brandId
   - ✅ `products_price_idx` - индекс на price
   - ✅ `products_myWarehouseCode_idx` - индекс на myWarehouseCode
   - ✅ `products_isActive_brandId_idx` - комбинированный индекс

## Способ 2: Через SQL Editor в Supabase

1. Откройте Supabase Dashboard
2. Перейдите в **"SQL Editor"**
3. Выполните запрос:

```sql
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'products'
ORDER BY indexname;
```

4. Вы должны увидеть список всех индексов на таблице `products`

## Способ 3: Через Prisma (если подключена продакшн БД)

```bash
# Убедитесь, что DATABASE_URL указывает на продакшн
npm run db:check-indexes
```

**Примечание:** Для этого способа нужно, чтобы `DATABASE_URL` в `.env` указывал на продакшн Supabase.

## Что делать, если индексы не применились?

1. **Автоматически через Vercel:**
   - При деплое Vercel выполняет `prisma generate`
   - Но `prisma db push` нужно запускать вручную

2. **Вручную через Railway или Supabase:**
   ```bash
   # Если используете Railway CLI:
   railway run npx prisma db push
   
   # Или подключитесь к Supabase и выполните SQL:
   # SQL запросы для создания индексов см. в prisma/schema.prisma
   ```

3. **Прямо в Supabase SQL Editor:**
   - Откройте SQL Editor в Supabase Dashboard
   - Скопируйте SQL из `prisma/schema.prisma` (после `@@index`)
   - Или выполните:
   ```sql
   CREATE INDEX IF NOT EXISTS products_slug_idx ON products(slug);
   CREATE INDEX IF NOT EXISTS products_isActive_idx ON products("isActive");
   CREATE INDEX IF NOT EXISTS products_brandId_idx ON products("brandId");
   CREATE INDEX IF NOT EXISTS products_price_idx ON products(price);
   CREATE INDEX IF NOT EXISTS products_isActive_brandId_idx ON products("isActive", "brandId");
   ```

## Почему индексы важны?

Индексы ускоряют поиск и фильтрацию данных:
- **Без индекса:** БД проверяет каждую запись (медленно)
- **С индексом:** БД использует структуру данных для быстрого поиска (быстро)

**Пример:**
- Поиск по `slug` без индекса: ~500ms
- Поиск по `slug` с индексом: ~5ms (в 100 раз быстрее!)

