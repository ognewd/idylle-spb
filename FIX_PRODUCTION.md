# 🔧 Исправление продакшена на VPS

## Проблемы обнаружены:

1. ❌ **DATABASE_URL** — подключение к БД не работает (проверьте хост, пользователь, пароль).

2. ❌ **NEXTAUTH_URL** указывает на Vercel (`https://idylle-spb.vercel.app`)
   - Должен указывать на ваш VPS домен: `https://idylle.spb.ru`

## Решение:

### 1. Проверьте базу данных на VPS

Если база данных на самом VPS, нужно обновить `DATABASE_URL`:

```bash
# На VPS проверьте, запущен ли PostgreSQL
ssh user@your-vps
sudo systemctl status postgresql

# Проверьте подключение
psql -U postgres -d idylle_spb -h localhost
```

### 2. Создайте файл `.env.production` на VPS

```bash
# На VPS в директории проекта создайте .env.production
DATABASE_URL="postgresql://user:password@localhost:5432/idylle_spb?schema=public"
NEXTAUTH_URL="https://idylle.spb.ru"
NEXTAUTH_SECRET="your-secret-key-here"
NODE_ENV="production"
```

### 3. Если используете Docker на VPS

Обновите `docker-compose.yml` с правильными переменными:

```yaml
environment:
  - DATABASE_URL=postgresql://postgres:password@postgres:5432/idylle_spb
  - NEXTAUTH_URL=https://idylle.spb.ru
  - NEXTAUTH_SECRET=your-secret-key
```

### 4. Если база данных на удаленном сервере

Обновите `DATABASE_URL` с правильным хостом и портом:

```bash
DATABASE_URL="postgresql://user:password@your-db-host:5432/idylle_spb?schema=public"
```

### 5. Примените миграции на продакшене

```bash
# На VPS
cd /path/to/project
npx prisma db push
npx prisma generate
```

### 6. Перезапустите приложение

```bash
# Если используете PM2
pm2 restart idylle-spb

# Если используете Docker
docker-compose restart app

# Если используете systemd
sudo systemctl restart idylle-spb
```

### 7. Проверьте работу

```bash
# Локально с правильными переменными
npm run check:prod

# Или на VPS
curl https://idylle.spb.ru/api/products/basic
```

## Быстрая проверка на VPS:

```bash
# 1. Проверьте переменные окружения
cat .env.production

# 2. Проверьте подключение к БД
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"User\";"

# 3. Проверьте, запущено ли приложение
curl http://localhost:3000/api/products/basic

# 4. Проверьте логи
pm2 logs idylle-spb
# или
docker-compose logs app
```

