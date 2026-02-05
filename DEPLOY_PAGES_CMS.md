# Деплой системы управления страницами (Pages CMS) на продакшн

## Шаги для деплоя

На продакшн-сервере нужно выполнить следующие команды:

```bash
# 1. Подключиться к серверу
ssh root@<YOUR_SERVER_IP>

# 2. Перейти в директорию проекта
cd /root/idylle-spb

# 3. Получить последние изменения из Git
git pull origin main

# 4. Применить изменения схемы Prisma к базе данных
npx prisma db push

# 5. Сгенерировать Prisma Client
npx prisma generate

# 6. Создать страницы по умолчанию
npx tsx scripts/seed-pages.ts

# 7. Перезапустить приложение PM2
pm2 restart idylle-spb
```

## Альтернативный вариант (все в одной команде)

```bash
cd /root/idylle-spb && git pull origin main && npx prisma db push && npx prisma generate && npx tsx scripts/seed-pages.ts && pm2 restart idylle-spb
```

## Проверка

После выполнения команд проверьте:
1. Страница `/admin/pages` должна открываться без ошибок
2. Должны быть видны 6 страниц: about, delivery, contacts, privacy, terms, cookies
3. Логи PM2: `pm2 logs idylle-spb --lines 50`

