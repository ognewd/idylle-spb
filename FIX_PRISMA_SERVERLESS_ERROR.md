# 🔧 Исправление ошибки Prisma "prepared statement already exists"

## ❌ Проблема

**Ошибка:**
```
PostgresError { code: "42P05", message: "prepared statement \"s1\" already exists" }
```

**Причина:**
Prisma использует prepared statements, которые не работают с прямыми подключениями к Supabase в serverless окружении (Vercel).

---

## ✅ Решение

Использовать **Connection Pooling URL** от Supabase вместо прямого подключения.

### Шаг 1: Получить Connection Pooling URL из Supabase

1. Откройте: https://supabase.com/dashboard/project/ciemcmzwwhtbrufdvbmi
2. Перейдите в **Settings** → **Database**
3. Найдите секцию **"Connection string"**
4. Выберите вкладку **"Connection Pooling"** (Session mode или Transaction mode)
5. Скопируйте строку подключения

**Формат Connection Pooling URL:**
```
postgresql://postgres.ciemcmzwwhtbrufdvbmi:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Или:
```
postgresql://postgres.ciemcmzwwhtbrufdvbmi:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Важно:** Порт должен быть **6543** (для pooling) или **5432**, а хост должен содержать `.pooler.supabase.com`

---

### Шаг 2: Обновить DATABASE_URL в Vercel

1. Откройте: https://vercel.com/dashboard/project/idylle-spb
2. Перейдите в **Settings** → **Environment Variables**
3. Найдите `DATABASE_URL`
4. Нажмите на него для редактирования
5. Замените значение на **Connection Pooling URL** из Supabase
6. Убедитесь, что выбрано: ✅ Production, ✅ Preview, ✅ Development
7. Нажмите **Save**

---

### Шаг 3: Пересобрать проект

После обновления переменной окружения:

```bash
vercel --prod
```

Или в Vercel Dashboard:
- Проект → **Deployments** → **Redeploy** (последний деплой)

---

## 🔍 Как проверить, что используется правильный URL

**Правильный URL (Connection Pooling):**
- ✅ Содержит `.pooler.supabase.com`
- ✅ Порт: `6543` или `5432`
- ✅ Параметр: `?pgbouncer=true` (опционально, но рекомендуется)

**Неправильный URL (прямое подключение):**
- ❌ Содержит `db.ciemcmzwwhtbrufdvbmi.supabase.co`
- ❌ Порт: только `5432`
- ❌ Нет `.pooler` в хосте

---

## 📝 Текущий DATABASE_URL (нужно обновить)

Сейчас в Vercel, вероятно, используется:
```
postgresql://postgres:...@db.ciemcmzwwhtbrufdvbmi.supabase.co:5432/postgres
```

Нужно заменить на:
```
postgresql://postgres.ciemcmzwwhtbrufdvbmi:...@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

---

## ⚠️ Важно

- **Пароль:** Используйте тот же пароль, что и в прямом подключении
- **Схема:** Убедитесь, что указана схема `public` или добавьте `?schema=public`
- **Порт 6543:** Это порт для connection pooling (рекомендуется для serverless)

---

## 🔄 После исправления

После обновления `DATABASE_URL` и пересборки:

1. ✅ Ошибка "prepared statement already exists" исчезнет
2. ✅ Products API будет работать
3. ✅ Товары будут отображаться на страницах

---

*Исправление: 4 января 2026*

