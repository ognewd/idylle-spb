# Применение миграции tasks на продакшене

## Важно!
Эти команды нужно выполнять **на продакшен сервере**, а не локально!

## Шаги:

1. Подключитесь к серверу через SSH:
```bash
ssh root@147.45.98.110
# или используйте ваши SSH ключи
```

2. После подключения к серверу, выполните:
```bash
cd /root/idylle-spb

# Проверьте, что вы на сервере
pwd
# Должно показать: /root/idylle-spb

# Проверьте DATABASE_URL
grep DATABASE_URL .env

# Если DATABASE_URL указывает на Supabase (aws-1-us-east-1.pooler.supabase.com), 
# нужно исправить на локальный PostgreSQL
```

3. Примените миграцию:
```bash
# Используйте готовый скрипт
bash scripts/fix-tasks-on-prod.sh

# ИЛИ вручную:
npx prisma db push --accept-data-loss
npx prisma generate
pm2 restart idylle-spb --update-env
```

4. Проверьте результат:
Откройте в браузере: https://aromarussia.ru/admin/tasks

