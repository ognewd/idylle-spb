# Исправление проблемы с таблицей pages на продакшене

## Проблема
Таблица `pages` не существует в базе данных на продакшене, хотя миграция должна была примениться.

## Решение

### Вариант 1: Использовать готовый скрипт (рекомендуется)

Подключитесь к серверу и выполните:

```bash
ssh root@<YOUR_SERVER_IP>
cd /root/idylle-spb
git pull origin main
bash scripts/fix-pages-on-prod.sh
```

### Вариант 2: Выполнить команды вручную

```bash
ssh root@<YOUR_SERVER_IP>
cd /root/idylle-spb

# Применить миграцию
npx prisma db push --accept-data-loss

# Сгенерировать Prisma Client
npx prisma generate

# Создать страницы
npx tsx scripts/seed-pages.ts

# Перезапустить приложение
pm2 restart idylle-spb
```

### Вариант 3: Проверить и исправить через psql

Если миграция не применяется, можно проверить вручную:

```bash
ssh root@<YOUR_SERVER_IP>
cd /root/idylle-spb

# Проверить, существует ли таблица
psql $DATABASE_URL -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pages');"

# Если таблицы нет, применить миграцию принудительно
npx prisma db push --force-reset --accept-data-loss
npx prisma generate
npx tsx scripts/seed-pages.ts
pm2 restart idylle-spb
```

## Проверка после исправления

1. Откройте `/admin/pages` - должна открываться без ошибок
2. Должны быть видны 6 страниц
3. Проверьте логи: `pm2 logs idylle-spb --lines 50`

