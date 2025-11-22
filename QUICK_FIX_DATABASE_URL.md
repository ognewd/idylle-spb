# 🚀 Быстрое исправление DATABASE_URL

## 📍 Где найти Connection Pooling URL

### Быстрый путь:

1. **Откройте:** https://supabase.com/dashboard
2. **Выберите проект:** `idylle-spb`
3. **Перейдите:** Settings → Database
4. **Найдите:** "Connection Pooling" или "Connection string"
5. **Выберите:** "Session mode"
6. **Скопируйте:** Connection String (кнопка "Copy")

### Формат должен быть:

```
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

## ✅ Где обновить в Vercel

1. **Откройте:** https://vercel.com/dognevs-projects/idylle-spb/settings/environment-variables
2. **Найдите:** `DATABASE_URL` для Production
3. **Нажмите:** ✏️ (редактировать)
4. **Вставьте:** Connection Pooling URL из Supabase
5. **Сохраните:** "Save"

## 🔍 Проверка

**Правильный формат содержит:**
- ✅ `postgres.` (с точкой)
- ✅ `.pooler.supabase.com`
- ✅ `?pgbouncer=true`

**Неправильный формат:**
- ❌ `postgres:` (без точки)
- ❌ `db.[project].supabase.co`
- ❌ Нет `?pgbouncer=true`

## 🚀 После обновления

Запустите деплой:
```bash
vercel --prod
```

Или подождите автоматической пересборки.

