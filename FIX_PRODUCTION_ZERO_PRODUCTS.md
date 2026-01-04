# 🔧 Исправление: 0 товаров на production

## ❌ Проблема

На https://idylle-spb.vercel.app/aromaty-dlya-doma показывается 0 товаров.

**Health check показывает:**
- Товаров: 0 ❌
- Категорий: 5 ✅
- Брендов: 20 ✅

**Но в Supabase БД:**
- Товаров: 1048 ✅

---

## 🔍 Причина

**Vercel использует неправильный `DATABASE_URL`** или БД не подключена.

Health check показывает 0 товаров, значит Vercel подключается к другой БД (не Supabase) или DATABASE_URL не настроен.

---

## ✅ Решение

### 1. Проверить переменные окружения в Vercel

1. Откройте https://vercel.com/dashboard
2. Найдите проект `idylle-spb`
3. Перейдите в **Settings** → **Environment Variables**
4. Проверьте `DATABASE_URL`:
   - Должен быть: `postgresql://postgres:...@db.ciemcmzwwhtbrufdvbmi.supabase.co:5432/postgres`
   - Или Connection Pooling URL

### 2. Обновить DATABASE_URL в Vercel

Если DATABASE_URL неверный:

1. Скопируйте Connection String из `.supabase_connection_string.txt`
2. В Vercel Dashboard → Settings → Environment Variables
3. Обновите `DATABASE_URL`:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:%2BI2~%3DPL%24a%3C8c%2F_E@db.ciemcmzwwhtbrufdvbmi.supabase.co:5432/postgres`
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
4. Нажмите "Save"
5. **Пересоберите проект** (Vercel сделает это автоматически)

### 3. Проверить через Vercel CLI

```bash
# Посмотреть переменные
vercel env ls

# Добавить/обновить DATABASE_URL
vercel env add DATABASE_URL production
# Вставьте: postgresql://postgres:%2BI2~%3DPL%24a%3C8c%2F_E@db.ciemcmzwwhtbrufdvbmi.supabase.co:5432/postgres
```

---

## 🔍 Диагностика

Проверьте логи деплоя в Vercel:
1. Dashboard → Deployments → Выберите последний деплой
2. Откройте "Build Logs"
3. Найдите ошибки подключения к БД

---

## ⚠️ Важно

- **Локальная БД**: НЕ ТРОГАТЬ
- **Production БД**: Supabase (1048 товаров)
- После обновления `DATABASE_URL` нужно пересобрать проект

---

## 📝 После исправления

После обновления `DATABASE_URL` в Vercel:
1. Vercel автоматически пересоберет проект
2. Health check должен показать 1048 товаров
3. Страница `/aromaty-dlya-doma` должна показать товары

---

*Проблема: Vercel использует неправильный DATABASE_URL или БД не подключена*

