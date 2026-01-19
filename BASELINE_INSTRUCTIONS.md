# 📋 Инструкция: Как сделать Baseline миграций

## Что нужно сделать

Выполнить одну команду на сервере, чтобы отметить миграцию как уже применённую.

## Шаги

### 1. Подключиться к серверу по SSH

```bash
ssh root@147.45.98.110
# Введите пароль: v6kvGJiGPaw^9-
```

### 2. Перейти в директорию проекта

```bash
cd /root/idylle-spb
```

### 3. Проверить текущий статус миграций (опционально)

```bash
npx prisma migrate status
```

**Ожидаемый результат:** Ошибка или сообщение о том, что миграции не применены.

### 4. Выполнить baseline

```bash
npx prisma migrate resolve --applied 20250120000000_add_review_is_approved
```

**Что делает эта команда:**
- ✅ Добавляет запись в таблицу `_prisma_migrations`
- ✅ Отмечает миграцию как "уже применённую"
- ✅ Не выполняет SQL (миграция уже применена через `db push`)

**Ожидаемый результат:**
```
Migration 20250120000000_add_review_is_approved marked as applied.
```

### 5. Проверить статус миграций

```bash
npx prisma migrate status
```

**Ожидаемый результат:**
```
Database schema is up to date!

Following migration(s) have been applied:

migrations/
  └─ 20250120000000_add_review_is_approved/
    └─ migration.sql
```

### 6. Проверить, что `migrate deploy` теперь работает

```bash
npx prisma migrate deploy
```

**Ожидаемый результат:**
```
✅ Applied migration: 20250120000000_add_review_is_approved
✅ Database is up to date
```

## Готово! ✅

После этого:
- ✅ `migrate deploy` будет работать вместо `db push`
- ✅ Скрипт деплоя будет использовать более безопасный метод
- ✅ История миграций синхронизирована с реальным состоянием БД

## Если что-то пошло не так

### Ошибка: "Migration not found"
Проверьте имя миграции:
```bash
ls -la prisma/migrations/
```

### Ошибка: "Migration already applied"
Это нормально, значит baseline уже сделан. Проверьте статус:
```bash
npx prisma migrate status
```

### Ошибка подключения к БД
Убедитесь, что `.env` файл содержит правильный `DATABASE_URL`:
```bash
cat .env | grep DATABASE_URL
```

## Быстрая команда (всё сразу)

Если хотите выполнить всё одной командой:

```bash
cd /root/idylle-spb && npx prisma migrate resolve --applied 20250120000000_add_review_is_approved && npx prisma migrate status
```
