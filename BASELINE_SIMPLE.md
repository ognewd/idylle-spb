# 🎯 Baseline миграций: Простая инструкция

## ❓ Зачем это нужно?

**Проблема:**
- Миграция `20250120000000_add_review_is_approved` уже применена к базе данных (через `db push`)
- Но Prisma не знает об этом, потому что нет записи в таблице `_prisma_migrations`
- Из-за этого `npx prisma migrate deploy` выдаёт ошибку `P3005`

**Решение:**
- Нужно "обмануть" Prisma, сказав: "Эта миграция уже применена"
- Это называется **baseline** (базовая линия)

**Результат:**
- ✅ Prisma будет знать, что миграция применена
- ✅ `migrate deploy` будет работать корректно
- ✅ Скрипт деплоя не будет падать с ошибкой

---

## 📋 Что сделать на сервере (пошагово)

### Шаг 1: Подключиться к серверу

```bash
ssh root@<YOUR_SERVER_IP>
# Пароль: v6kvGJiGPaw^9-
```

### Шаг 2: Перейти в директорию проекта

```bash
cd /root/idylle-spb
```

### Шаг 3: Добавить DATABASE_URL в .env

**Проблема:** В `.env` нет `DATABASE_URL`, который нужен Prisma.

**Решение:** Добавить строку подключения к локальной PostgreSQL:

```bash
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/idylle_spb?schema=public"' >> .env
```

**Проверка:**
```bash
tail -1 .env
# Должно показать: DATABASE_URL="postgresql://idylle_user:..."
```

### Шаг 4: Выполнить baseline

Эта команда отметит миграцию как уже применённую:

```bash
npx prisma migrate resolve --applied 20250120000000_add_review_is_approved
```

**Ожидаемый результат:**
```
Migration 20250120000000_add_review_is_approved marked as applied.
```

### Шаг 5: Проверить статус

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

---

## ✅ Готово!

Теперь:
- ✅ Prisma знает о применённой миграции
- ✅ `migrate deploy` будет работать
- ✅ Скрипт деплоя не будет падать

---

## 🔧 Все команды одной строкой

Если хотите выполнить всё сразу:

```bash
cd /root/idylle-spb && \
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/idylle_spb?schema=public"' >> .env && \
npx prisma migrate resolve --applied 20250120000000_add_review_is_approved && \
npx prisma migrate status
```

---

## ⚠️ Если что-то пошло не так

### Ошибка: "FATAL: Tenant or user not found"
- Проверьте, что `DATABASE_URL` добавлен в `.env`: `cat .env | grep DATABASE_URL`
- Убедитесь, что PostgreSQL запущен: `systemctl status postgresql`

### Ошибка: "Migration not found"
- Проверьте имя миграции: `ls -la prisma/migrations/`
- Используйте правильное имя из директории

### Ошибка: "Migration already applied"
- Это нормально! Baseline уже сделан
- Проверьте статус: `npx prisma migrate status`
