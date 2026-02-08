# Исправление проблемы с загрузкой изображений (404)

## Проблема
Изображения товаров не загружаются на продакшене, возвращается 404 ошибка.

## Причина
Файлы сохраняются в неправильную директорию, если переменная `UPLOADS_DIR` не установлена в `.env` на сервере.

## Решение

### Шаг 1: Проверка и исправление на сервере

Выполните на сервере:

```bash
cd /root/idylle-spb

# Запустите скрипт автоматического исправления
bash scripts/fix-uploads-location.sh
```

Скрипт автоматически:
- Проверит наличие `UPLOADS_DIR` в `.env`
- Найдет файлы в неправильных местах
- Переместит их в правильную директорию (`/var/www/uploads/products/`)
- Установит правильные права доступа
- Перезапустит PM2

### Шаг 2: Ручная проверка (если скрипт не помог)

1. **Проверьте переменную окружения:**
```bash
grep UPLOADS_DIR /root/idylle-spb/.env
```

Если переменной нет, добавьте:
```bash
echo "UPLOADS_DIR=/var/www/uploads" >> /root/idylle-spb/.env
```

2. **Проверьте, где находятся файлы:**
```bash
# Правильное место
ls -la /var/www/uploads/products/ | head -10

# Неправильное место (если файлы там)
ls -la /root/idylle-spb/public/uploads/products/ | head -10
```

3. **Переместите файлы, если они в неправильном месте:**
```bash
mkdir -p /var/www/uploads/products
cp -r /root/idylle-spb/public/uploads/products/* /var/www/uploads/products/ 2>/dev/null || true
chown -R www-data:www-data /var/www/uploads/
chmod -R 755 /var/www/uploads/
```

4. **Проверьте конфигурацию Nginx:**
```bash
grep -A 5 "location /uploads/" /etc/nginx/sites-enabled/aromarussia.ru
```

Должно быть:
```nginx
location /uploads/ {
    alias /var/www/uploads/;
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

Если этого блока нет, добавьте его в конфиг Nginx и перезагрузите:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

5. **Перезапустите PM2:**
```bash
pm2 restart idylle-spb --update-env
```

6. **Проверьте логи:**
```bash
pm2 logs idylle-spb --lines 30
```

Ищите строки вида:
```
[Import] Saving image to: /var/www/uploads/products (UPLOADS_DIR=/var/www/uploads)
[Upload] Saving file to: /var/www/uploads/products (UPLOADS_DIR=/var/www/uploads)
```

### Шаг 3: Проверка после исправления

1. Попробуйте открыть изображение напрямую:
   `https://aromarussia.ru/uploads/products/[имя_файла].jpg`

2. Загрузите новое изображение через админ-панель и проверьте, что оно отображается.

3. Проверьте логи PM2 на наличие ошибок:
```bash
pm2 logs idylle-spb --lines 50 | grep -i "upload\|image\|error"
```

## Что было исправлено в коде

1. Добавлено логирование в функции загрузки файлов для отладки
2. Добавлена проверка существования файла после сохранения
3. Обновлены `.env.example` и `.env.production` с примером `UPLOADS_DIR`
4. Создан скрипт `scripts/fix-uploads-location.sh` для автоматического исправления

## Важно

- Переменная `UPLOADS_DIR` должна быть установлена в `.env` на сервере
- Директория `/var/www/uploads/` должна существовать и иметь права `www-data:www-data`
- Nginx должен быть настроен для раздачи файлов из `/var/www/uploads/`
- После изменения `.env` нужно перезапустить PM2 с флагом `--update-env`
