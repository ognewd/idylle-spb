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

4. Убедитесь, что в `.env` задан DATABASE_URL (PostgreSQL):
```
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

5. Примените миграцию:
```bash
# Вариант A: Используйте готовый скрипт
bash scripts/fix-tasks-on-prod.sh

# Вариант B: Вручную
npx prisma db push --accept-data-loss
npx prisma generate
pm2 restart idylle-spb --update-env
```

6. Проверьте, что таблица создана (подставьте свой DATABASE_URL):
```bash
psql "$DATABASE_URL" -c "\d tasks"
```

7. Проверьте работу:
Откройте https://aromarussia.ru/admin/tasks в браузере.

## Важно
- После применения миграции обязательно перезапустите PM2

