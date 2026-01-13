# Исправление проблемы с task_messages на продакшене

## Проблема
Ошибка: `The column task_messages.fileUrl does not exist in the current database.`

## Решение

Выполните на сервере через SSH:

```bash
ssh root@147.45.98.110
cd /root/idylle-spb

# Применить миграцию Prisma
export DATABASE_URL="postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public"
npx prisma db push --accept-data-loss
npx prisma generate

# Перезапустить приложение
pm2 restart idylle-spb --update-env
```

Или используйте готовый скрипт:

```bash
bash scripts/fix-task-messages-on-prod.sh
```

## Что будет сделано:
1. Добавлены колонки `fileUrl`, `fileName` в таблицу `task_messages`
2. Добавлена колонка `updatedAt` в таблицу `task_messages`
3. Колонка `message` сделана nullable (можно отправлять только файл)
4. Prisma Client перегенерирован
5. Приложение перезапущено

После этого ошибка должна исчезнуть.

