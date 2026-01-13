# Исправление таблиц tasks на продакшене

## Проблема
Таблица `tasks` не существует в базе данных на продакшене, что вызывает ошибку 500 при попытке загрузить задачи.

## Решение

### Вариант 1: Автоматический деплой через GitHub Actions
При следующем пуше в main миграция применится автоматически. Убедитесь, что в `.env` на сервере правильный `DATABASE_URL` (локальный PostgreSQL).

### Вариант 2: Ручное исправление на сервере

1. Подключитесь к серверу:
```bash
ssh root@your-server-ip
```

2. Перейдите в директорию проекта:
```bash
cd /root/idylle-spb
```

3. Проверьте DATABASE_URL в .env:
```bash
grep DATABASE_URL .env
```

4. Убедитесь, что DATABASE_URL указывает на локальный PostgreSQL:
```
DATABASE_URL="postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public"
```

5. Если DATABASE_URL указывает на Supabase, исправьте его:
```bash
nano .env
# Измените DATABASE_URL на локальный PostgreSQL
```

6. Примените миграцию:
```bash
# Вариант A: Используйте готовый скрипт
bash scripts/fix-tasks-on-prod.sh

# Вариант B: Вручную
npx prisma db push --accept-data-loss
npx prisma generate
pm2 restart idylle-spb --update-env
```

7. Проверьте, что таблица создана:
```bash
psql "postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public" -c "\d tasks"
```

8. Проверьте работу:
Откройте https://aromarussia.ru/admin/tasks в браузере.

## Важно
- **Мы используем локальный PostgreSQL, НЕ Supabase!**
- DATABASE_URL должен указывать на `localhost:5432`, а не на Supabase
- После применения миграции обязательно перезапустите PM2

