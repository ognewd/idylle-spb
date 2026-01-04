# 🔧 Обновление DATABASE_URL в Vercel

## ❌ Проблема

Production показывает 0 товаров, хотя в Supabase БД есть 1048 товаров.

**Причина:** Vercel использует старый/неправильный `DATABASE_URL`

---

## ✅ Решение: Обновить DATABASE_URL в Vercel

### Вариант 1: Через Vercel Dashboard (рекомендуется)

1. **Откройте Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Найдите проект `idylle-spb`

2. **Перейдите в Settings:**
   - Нажмите на проект → **Settings** → **Environment Variables**

3. **Найдите `DATABASE_URL`:**
   - Текущий: настроен 31 день назад
   - Нужно обновить на Supabase connection string

4. **Обновите DATABASE_URL:**
   - **Вариант A: Connection String (URI)**
     ```
     postgresql://postgres:%2BI2~%3DPL%24a%3C8c%2F_E@db.ciemcmzwwhtbrufdvbmi.supabase.co:5432/postgres
     ```
   
   - **Вариант B: Connection Pooling (лучше для production)**
     - Откройте Supabase Dashboard → Settings → Database
     - Скопируйте Connection Pooling URL
     - Формат: `postgresql://postgres.xxxxx:...@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

5. **Настройте переменную:**
   - Нажмите на `DATABASE_URL` или создайте новую
   - **Value**: Вставьте Supabase connection string
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Нажмите "Save"

6. **Пересоберите проект:**
   - Vercel автоматически запустит новый деплой
   - Или вручную: Deployments → "Redeploy"

### Вариант 2: Через Vercel CLI

```bash
# Посмотреть текущие переменные
vercel env ls

# Удалить старый DATABASE_URL (опционально)
vercel env rm DATABASE_URL production

# Добавить новый DATABASE_URL
vercel env add DATABASE_URL production
# Вставьте: postgresql://postgres:%2BI2~%3DPL%24a%3C8c%2F_E@db.ciemcmzwwhtbrufdvbmi.supabase.co:5432/postgres

# Также для Preview и Development
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development
```

---

## 🔍 Получить Connection Pooling URL из Supabase

1. Откройте https://supabase.com/dashboard/project/ciemcmzwwhtbrufdvbmi
2. Перейдите в **Settings** → **Database**
3. Найдите секцию **"Connection string"**
4. Выберите вкладку **"Connection Pooling"**
5. Скопируйте строку (формат: `postgresql://postgres.xxxxx:...@aws-0-...pooler.supabase.com:6543/postgres`)
6. Замените `[YOUR-PASSWORD]` на пароль: `+I2~=PL$a<8c/_E`

**Connection Pooling URL лучше для production**, так как:
- ✅ Более надежное подключение
- ✅ Лучше для serverless функций (Vercel)
- ✅ Меньше нагрузка на БД

---

## 📊 После обновления

1. **Проверьте health check:**
   ```
   https://idylle-spb.vercel.app/api/health
   ```
   Должен показать: `"products": 1048`

2. **Проверьте страницу:**
   ```
   https://idylle-spb.vercel.app/aromaty-dlya-doma
   ```
   Должны отображаться товары

3. **Проверьте логи:**
   - Vercel Dashboard → Deployments → Build Logs
   - Убедитесь, что нет ошибок подключения

---

## ⚠️ Важно

- **Локальная БД**: НЕ ТРОГАТЬ (`postgresql://dognev@localhost:5432/idylle_spb`)
- **Production БД**: Supabase (обновить `DATABASE_URL` в Vercel)
- После обновления переменных Vercel автоматически пересоберет проект

---

## 🔑 Пароль для Supabase

Если нужно, пароль: `+I2~=PL$a<8c/_E`

---

*После обновления DATABASE_URL товары должны появиться на production*

