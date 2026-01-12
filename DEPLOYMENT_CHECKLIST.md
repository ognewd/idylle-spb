# 📋 Чеклист деплоя на продакшен

## Обязательные переменные окружения

Перед деплоем убедитесь, что все переменные окружения установлены в `.env` на сервере:

```bash
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/dbname?schema=public

# NextAuth
NEXTAUTH_SECRET=ваш_секретный_ключ
NEXTAUTH_URL=https://aromarussia.ru
NEXT_PUBLIC_BASE_URL=https://aromarussia.ru

# Загрузки файлов (ОБЯЗАТЕЛЬНО!)
UPLOADS_DIR=/var/www/uploads

# Окружение
NODE_ENV=production
```

## ✅ Проверка после деплоя

### 1. Проверка переменных окружения
```bash
cd /root/idylle-spb
cat .env | grep -E "DATABASE_URL|NEXTAUTH|UPLOADS_DIR|NEXT_PUBLIC_BASE_URL"
```

### 2. Проверка директории загрузок
```bash
# Директория должна существовать
ls -la /var/www/uploads/products/

# Права должны быть правильные
# owner: www-data:www-data
# permissions: 755
stat /var/www/uploads/products/ | grep -E "Uid|Gid|Access"
```

### 3. Проверка Nginx конфигурации
```bash
grep -A 5 "location /uploads/" /etc/nginx/sites-enabled/aromarussia.ru
# Должно быть:
# location /uploads/ {
#     alias /var/www/uploads/;
#     ...
# }
```

### 4. Проверка PM2
```bash
pm2 status
pm2 logs idylle-spb --lines 10
# Не должно быть ошибок с путями к файлам
```

### 5. Тестовая загрузка
1. Загрузите тестовое изображение через админ-панель
2. Проверьте, что файл появился:
   ```bash
   ls -lt /var/www/uploads/products/ | head -3
   ```
3. Попробуйте открыть изображение в браузере:
   `https://aromarussia.ru/uploads/products/имя_файла.jpg`

## 🚨 Частые проблемы

### Проблема: Изображения не отображаются (404)
**Причина:** Файлы сохраняются в неправильную директорию  
**Решение:**
```bash
# Проверить переменную
grep UPLOADS_DIR /root/idylle-spb/.env

# Если нет, добавить
echo "UPLOADS_DIR=/var/www/uploads" >> /root/idylle-spb/.env
pm2 restart idylle-spb --update-env
```

### Проблема: Permission denied при загрузке
**Причина:** Неправильные права на директорию  
**Решение:**
```bash
chown -R www-data:www-data /var/www/uploads/
chmod -R 755 /var/www/uploads/
```

### Проблема: Старые файлы не отображаются
**Причина:** Файлы в старом месте (`public/uploads/`)  
**Решение:**
```bash
# Переместить старые файлы
mkdir -p /var/www/uploads/products
cp -r /root/idylle-spb/public/uploads/products/* /var/www/uploads/products/
chown -R www-data:www-data /var/www/uploads/
```

## 📝 Скрипт автоматической проверки

После каждого деплоя выполните:
```bash
cd /root/idylle-spb
bash scripts/check-production.sh  # (если создадите такой скрипт)
```

## 🔄 Автоматизация

GitHub Actions workflow должен проверять:
- ✅ Все переменные окружения установлены
- ✅ Директории существуют
- ✅ Права установлены правильно
- ✅ PM2 запущен без ошибок

