# 🔧 Исправление ошибки 502 Bad Gateway

## 🔍 Диагностика

### 1. Проверьте статус PM2

```bash
ssh root@147.45.98.110
cd /root/idylle-spb
pm2 status
```

**Ожидается:** Процесс `idylle-spb` должен быть в статусе `online`.

**Если статус `errored` или `stopped`:**
```bash
# Посмотрите логи
pm2 logs idylle-spb --lines 100

# Перезапустите приложение
pm2 restart idylle-spb

# Если не помогает, удалите и создайте заново
pm2 delete idylle-spb
cd /root/idylle-spb
pm2 start ecosystem.config.js
pm2 save
```

### 2. Проверьте логи PM2

```bash
pm2 logs idylle-spb --lines 50
```

**Что искать:**
- Ошибки компиляции
- Ошибки подключения к БД
- Ошибки Prisma
- Порт уже занят (`EADDRINUSE`)

### 3. Проверьте, слушает ли приложение порт 3000

```bash
netstat -tlnp | grep 3000
# ИЛИ
ss -tlnp | grep 3000
```

**Ожидается:** Должен быть процесс, слушающий `localhost:3000` или `0.0.0.0:3000`.

**Если порт не слушается:**
- Приложение не запущено или упало
- Проверьте логи PM2 (шаг 2)

### 4. Проверьте логи Nginx

```bash
tail -50 /var/log/nginx/error.log
```

**Что искать:**
- `connect() failed (111: Connection refused)`
- `upstream prematurely closed connection`

### 5. Проверьте статус Nginx

```bash
systemctl status nginx
```

**Ожидается:** Статус `active (running)`.

---

## 🔧 Быстрое решение

### Вариант 1: Перезапустить приложение

```bash
ssh root@147.45.98.110
cd /root/idylle-spb
pm2 restart idylle-spb
pm2 logs idylle-spb --lines 20
```

### Вариант 2: Если ошибка после деплоя

```bash
ssh root@147.45.98.110
cd /root/idylle-spb

# Проверьте, что миграция Prisma применена
npx prisma db push

# Перегенерируйте Prisma Client
npx prisma generate

# Пересоберите приложение
npm run build

# Перезапустите PM2
pm2 restart idylle-spb

# Проверьте логи
pm2 logs idylle-spb --lines 50
```

### Вариант 3: Полный перезапуск

```bash
ssh root@147.45.98.110
cd /root/idylle-spb

# Остановите PM2
pm2 stop idylle-spb

# Удалите процесс
pm2 delete idylle-spb

# Очистите кэш (опционально)
rm -rf .next node_modules/.prisma

# Перегенерируйте Prisma Client
npx prisma generate

# Пересоберите
npm run build

# Запустите заново
pm2 start ecosystem.config.js
pm2 save

# Проверьте статус
pm2 status
pm2 logs idylle-spb --lines 20
```

---

## 🐛 Частые проблемы и решения

### Проблема 1: Приложение не компилируется

**Причина:** Ошибки в коде или несовместимость зависимостей.

**Решение:**
```bash
# Проверьте логи сборки
npm run build

# Если есть ошибки - исправьте их локально, закоммитьте и запушьте
# Затем на сервере: git pull && npm run build && pm2 restart idylle-spb
```

### Проблема 2: Prisma Client не сгенерирован

**Причина:** После изменения схемы не был выполнен `prisma generate`.

**Решение:**
```bash
npx prisma generate
npm run build
pm2 restart idylle-spb
```

### Проблема 3: База данных недоступна

**Причина:** Неправильный `DATABASE_URL` или БД не запущена.

**Решение:**
```bash
# Проверьте статус PostgreSQL
systemctl status postgresql

# Проверьте DATABASE_URL в ecosystem.config.js
cat ecosystem.config.js | grep DATABASE_URL

# Проверьте подключение к БД
sudo -u postgres psql -d idylle_spb -c "SELECT 1;"
```

### Проблема 4: Порт 3000 занят другим процессом

**Причина:** Другой процесс использует порт 3000.

**Решение:**
```bash
# Найдите процесс на порту 3000
lsof -i :3000
# ИЛИ
fuser 3000/tcp

# Убейте процесс (если это старый экземпляр)
kill -9 <PID>

# Перезапустите PM2
pm2 restart idylle-spb
```

---

## ✅ Проверка после исправления

1. **Проверьте статус PM2:**
   ```bash
   pm2 status
   ```
   Должен быть `online`.

2. **Проверьте логи:**
   ```bash
   pm2 logs idylle-spb --lines 10
   ```
   Не должно быть ошибок.

3. **Проверьте сайт:**
   - Откройте `https://aromarussia.ru`
   - Должна открыться главная страница
   - Попробуйте открыть страницу продукта

4. **Проверьте API:**
   ```bash
   curl -I https://aromarussia.ru/api/health
   ```
   Должен вернуть `200 OK`.

---

## 📞 Если ничего не помогает

1. Соберите информацию:
   ```bash
   pm2 status
   pm2 logs idylle-spb --lines 100
   tail -50 /var/log/nginx/error.log
   systemctl status nginx
   systemctl status postgresql
   ```

2. Проверьте, что все сервисы запущены:
   ```bash
   systemctl status nginx
   systemctl status postgresql
   pm2 status
   ```

3. Проверьте конфигурацию Nginx:
   ```bash
   nginx -t
   ```

