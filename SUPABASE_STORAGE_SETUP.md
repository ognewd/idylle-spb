# Настройка Supabase Storage для загрузки изображений

## Шаг 1: Получить ключи из Supabase Dashboard

1. Откройте [Supabase Dashboard](https://app.supabase.com/)
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Найдите следующие значения:
   - **Project URL** (это `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (это `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role key** (это `SUPABASE_SERVICE_ROLE_KEY`) - ⚠️ **ВАЖНО: храните в секрете!**

## Шаг 2: Создать Storage Bucket

1. В Supabase Dashboard перейдите в **Storage**
2. Нажмите **New bucket**
3. Настройки:
   - **Name:** `products`
   - **Public bucket:** ✅ Включено (чтобы изображения были доступны публично)
   - **File size limit:** 10 MB (или нужное вам значение)
   - **Allowed MIME types:** `image/jpeg,image/png,image/webp,image/gif`
4. Нажмите **Create bucket**

## Шаг 3: Настроить политики доступа (RLS Policies)

1. Перейдите в **Storage** → **Policies** для bucket `products`
2. Создайте политику для загрузки файлов:

   **Policy name:** `Allow authenticated uploads`
   **Policy definition:**
   ```sql
   -- Позволяет аутентифицированным пользователям загружать файлы
   (bucket_id = 'products'::text) AND (auth.role() = 'authenticated'::text)
   ```

   **Allowed operation:** ✅ INSERT

3. Создайте политику для чтения файлов:

   **Policy name:** `Allow public read`
   **Policy definition:**
   ```sql
   -- Позволяет всем читать файлы (так как bucket публичный)
   (bucket_id = 'products'::text)
   ```

   **Allowed operation:** ✅ SELECT

## Шаг 4: Добавить переменные окружения

### Локально (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### На Vercel:

1. Откройте ваш проект в [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте все три переменные:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (⚠️ не делайте её публичной!)

## Шаг 5: Перезапустить приложение

После добавления переменных окружения:
- Локально: перезапустите `npm run dev`
- На Vercel: новый деплой произойдет автоматически

## Проверка работы

1. Попробуйте загрузить изображение в админ-панели
2. Проверьте в Supabase Dashboard → **Storage** → **products**, что файл появился
3. Проверьте, что изображение отображается на сайте

## Структура файлов в Storage

Файлы сохраняются в путь: `products/products/{timestamp}-{random}.{extension}`

Например: `products/products/1703123456789-abc123def456.jpg`

## Важные замечания

- ⚠️ **Service Role Key** имеет полный доступ к вашему проекту - храните её в секрете!
- Используйте Service Role Key только на сервере (в API routes), никогда на клиенте
- Anon Key безопасно использовать на клиенте
- Рекомендуется настроить RLS (Row Level Security) политики для безопасности
- Бесплатный тариф Supabase включает 1 GB хранилища

