# Быстрое исправление таблицы pages на продакшене

## Проблема
Скрипт использует неправильный DATABASE_URL (Supabase вместо локального PostgreSQL).

## Решение

Выполните на сервере:

```bash
cd /root/idylle-spb
git pull origin main

# Применить миграцию (использует DATABASE_URL из .env)
npx prisma db push --accept-data-loss

# Сгенерировать Prisma Client
npx prisma generate

# Создать страницы
npx tsx scripts/seed-pages.ts

# Перезапустить с обновленными переменными окружения
pm2 restart idylle-spb --update-env
```

## Проверка

После выполнения команд проверьте:
- `pm2 logs idylle-spb --lines 20` - не должно быть ошибок
- Откройте `/admin/pages` - должна работать

