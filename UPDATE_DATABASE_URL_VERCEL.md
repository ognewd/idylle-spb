# 🔧 Обновление DATABASE_URL в Vercel

## ✅ Текущий URL (правильный формат!)

**Сейчас:**
```
postgresql://postgres.ciemcmzwwhtbrufdvbmi:%2BI2~%3DPL%24a%3C8c%2F_E@aws-1-eu-central-1.pooler.supabase.com:6543/postgres
```

**Это Connection Pooling URL** ✅ - формат правильный!

---

## 🔧 Рекомендуется добавить параметры

Для лучшей совместимости с Prisma добавьте параметры:

**Обновленный URL:**
```
postgresql://postgres.ciemcmzwwhtbrufdvbmi:%2BI2~%3DPL%24a%3C8c%2F_E@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
```

**Параметры:**
- `?pgbouncer=true` - явно указывает, что используется pgBouncer
- `&schema=public` - указывает схему базы данных

---

## 📝 Как обновить в Vercel

1. Откройте: https://vercel.com/dashboard/project/idylle-spb/settings/environment-variables

2. Найдите `DATABASE_URL`

3. Обновите значение на:
   ```
   postgresql://postgres.ciemcmzwwhtbrufdvbmi:%2BI2~%3DPL%24a%3C8c%2F_E@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public
   ```

4. Убедитесь, что выбрано: ✅ Production, ✅ Preview, ✅ Development

5. Нажмите **Save**

6. **Пересоберите проект:**
   ```bash
   vercel --prod
   ```
   Или в Dashboard: Deployments → Redeploy

---

## ⚠️ Важно

После обновления переменной окружения **обязательно пересоберите проект**, иначе изменения не применятся!

---

*Обновление: 4 января 2026*

