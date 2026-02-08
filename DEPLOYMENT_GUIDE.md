# 🚀 Руководство по деплою

## Автоматический деплой через GitHub Actions

При каждом пуше в ветку `main` автоматически запускается деплой на продакшн сервер.

### Что происходит при деплое:

1. **Получение кода** - `git pull origin main`
2. **Сохранение конфигурации** - `ecosystem.config.cjs` сохраняется перед `git reset`
3. **Обновление переменных окружения** - `DATABASE_URL` из `.env` автоматически синхронизируется в `ecosystem.config.cjs`
4. **Установка зависимостей** - `npm ci` или `npm install`
5. **Применение миграций Prisma** - `npx prisma migrate deploy`
6. **Сборка приложения** - `npm run build`
7. **Перезапуск PM2** - приложение перезапускается с обновленной конфигурацией

### Важно:

- ✅ **`.env` файл НЕ коммитится в Git** (он в `.gitignore`)
- ✅ **`ecosystem.config.cjs` сохраняется** между деплоями (не перезаписывается из Git)
- ✅ **`DATABASE_URL` автоматически обновляется** из `.env` в `ecosystem.config.cjs` при каждом деплое

## Ручной деплой (если нужно)

Если нужно задеплоить вручную на сервере:

```bash
# 1. Подключитесь к серверу
ssh root@147.45.98.110

# 2. Перейдите в директорию проекта
cd /root/idylle-spb

# 3. Получите последние изменения
git pull origin main

# 4. Обновите переменные окружения в ecosystem.config.cjs (если нужно)
bash scripts/update-ecosystem-env.sh

# 5. Установите зависимости
npm ci --prefer-offline --no-audit || npm install --no-audit

# 6. Примените миграции
npx prisma migrate deploy || npx prisma db push --accept-data-loss

# 7. Соберите приложение
npm run build

# 8. Перезапустите PM2
pm2 restart idylle-spb
```

## Проверка после деплоя

После деплоя проверьте:

```bash
# 1. Статус PM2
pm2 status

# 2. Логи приложения
pm2 logs idylle-spb --lines 50

# 3. Health check
curl http://localhost:3000/api/health

# 4. API товаров
curl http://localhost:3000/api/products?limit=5

# 5. Диагностика (если что-то не работает)
bash scripts/diagnose-issue.sh
```

## Если что-то пошло не так

### Проблема: DATABASE_URL не обновляется

```bash
# Запустите скрипт обновления вручную
cd /root/idylle-spb
bash scripts/update-ecosystem-env.sh
pm2 restart idylle-spb
```

### Проблема: Дубликаты DATABASE_URL в ecosystem.config.cjs

```bash
# Запустите скрипт исправления
cd /root/idylle-spb
bash scripts/fix-db-connection.sh
```

### Проблема: Приложение не запускается

```bash
# Проверьте логи
pm2 logs idylle-spb --lines 100

# Проверьте синтаксис ecosystem.config.cjs
node -c ecosystem.config.cjs

# Проверьте статус
pm2 status
```

## Структура файлов

- **`.env`** - переменные окружения (НЕ коммитится, хранится только на сервере)
- **`ecosystem.config.cjs`** - конфигурация PM2 (НЕ коммитится, сохраняется между деплоями)
- **`ecosystem.config.cjs.example`** - пример конфигурации (коммитится в Git)
- **`.github/workflows/deploy.yml`** - автоматический деплой через GitHub Actions

## Переменные окружения

Основные переменные, которые должны быть в `.env`:

```bash
# База данных (локальная PostgreSQL на сервере)
DATABASE_URL="postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public"

# NextAuth
NEXTAUTH_URL="https://aromarussia.ru"
NEXTAUTH_SECRET="your-secret-key"

# Загрузки файлов
UPLOADS_DIR="/var/www/uploads"
```

## Часто задаваемые вопросы

**Q: Нужно ли обновлять `.env` вручную после деплоя?**  
A: Нет, `.env` не изменяется при деплое. Обновляется только `ecosystem.config.cjs` из `.env`.

**Q: Что делать, если после деплоя товары не отображаются?**  
A: Запустите `bash scripts/diagnose-issue.sh` для диагностики. Проверьте, что `DATABASE_URL` правильный в `.env` и `ecosystem.config.cjs`.

**Q: Как откатить деплой?**  
A: Используйте `git reset --hard <commit-hash>` и перезапустите PM2. Или откатите через GitHub UI.

**Q: Нужно ли перезапускать PM2 вручную после деплоя?**  
A: Нет, PM2 перезапускается автоматически при деплое через GitHub Actions.
