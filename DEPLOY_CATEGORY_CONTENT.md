# 🚀 Деплой изменений категорий на продакшн

## 📋 Пошаговая инструкция

### 1. Подключитесь к серверу

```bash
ssh root@<YOUR_SERVER_IP>
```

### 2. Перейдите в директорию проекта

```bash
cd /root/idylle-spb
```

### 3. Получите последние изменения из Git

```bash
git pull
```

### 4. Примените миграцию Prisma (добавление поля `pageContent`)

```bash
# Вариант 1: Использовать Prisma (рекомендуется)
npx prisma db push

# ИЛИ Вариант 2: Выполнить SQL напрямую (если db push не работает)
sudo -u postgres psql -d idylle_spb -c "ALTER TABLE categories ADD COLUMN IF NOT EXISTS \"pageContent\" TEXT;"
```

### 5. Перегенерируйте Prisma Client

```bash
npx prisma generate
```

### 6. Соберите приложение

```bash
npm run build
```

### 7. Перезапустите PM2

```bash
pm2 restart idylle-spb
```

### 8. Проверьте статус

```bash
# Проверить статус PM2
pm2 status

# Посмотреть логи (последние 50 строк)
pm2 logs idylle-spb --lines 50

# Проверить, что поле pageContent добавлено в БД
sudo -u postgres psql -d idylle_spb -c "\d categories" | grep pageContent
```

---

## ✅ Проверка после деплоя

1. **Проверьте админку:**
   - Откройте `https://aromarussia.ru/admin/categories`
   - Откройте любую категорию для редактирования
   - Должны быть видны поля:
     - "Краткое описание" (Textarea)
     - "Контент страницы категории" (HTML редактор)

2. **Проверьте страницы категорий:**
   - `https://aromarussia.ru/catalog?category=aromaty-dlya-doma`
   - `https://aromarussia.ru/aromaty-dlya-doma`
   - `https://aromarussia.ru/uyut-i-interer`
   - Должны отображаться данные из базы (если заполнены в админке)

---

## 🔧 Если возникли проблемы

### Проблема: `npx prisma db push` выдает ошибку

**Решение:**
```bash
# Выполните SQL напрямую
sudo -u postgres psql -d idylle_spb -c "ALTER TABLE categories ADD COLUMN IF NOT EXISTS \"pageContent\" TEXT;"
npx prisma generate
```

### Проблема: Поле уже существует

**Решение:**
Это нормально, миграция использует `IF NOT EXISTS`, поэтому ничего не произойдет.

### Проблема: Приложение не запускается после деплоя

**Решение:**
```bash
# Проверьте логи
pm2 logs idylle-spb --lines 100

# Перезапустите PM2 с обновлением переменных окружения
pm2 restart idylle-spb --update-env

# Если не помогает, пересоздайте процесс
pm2 delete idylle-spb
cd /root/idylle-spb
pm2 start ecosystem.config.js
pm2 save
```

---

## 📝 Краткая команда (все в одной строке)

```bash
ssh root@<YOUR_SERVER_IP> "cd /root/idylle-spb && git pull && npx prisma db push && npx prisma generate && npm run build && pm2 restart idylle-spb"
```

Но лучше выполнять по шагам, чтобы видеть, если что-то пойдет не так.

---

## 📌 Важно

- **Миграция Prisma** (`npx prisma db push`) добавляет поле `pageContent` в таблицу `categories` если его еще нет
- **Prisma Client** (`npx prisma generate`) нужно перегенерировать после изменений схемы
- **Сборка** (`npm run build`) включает Prisma Client генерацию автоматически, но лучше сделать явно
- После деплоя все категории будут использовать `description` и `pageContent` из базы данных

