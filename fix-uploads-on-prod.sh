#!/bin/bash

# Скрипт для исправления загрузки изображений на продакшене
# Выполните: bash fix-uploads-on-prod.sh

set -e

echo "🔧 Исправление загрузки изображений..."

cd /root/idylle-spb

# 1. Проверяем и добавляем UPLOADS_DIR в .env
if ! grep -q "UPLOADS_DIR" .env 2>/dev/null; then
    echo "📝 Добавляю UPLOADS_DIR в .env..."
    echo "UPLOADS_DIR=/var/www/uploads" >> .env
else
    echo "✅ UPLOADS_DIR уже есть в .env"
fi

# 2. Создаем директорию для загрузок
echo "📁 Создаю директорию для загрузок..."
mkdir -p /var/www/uploads/products
chown -R www-data:www-data /var/www/uploads/
chmod -R 755 /var/www/uploads/

# 3. Перемещаем старые файлы из public/uploads (если есть)
if [ -d "/root/idylle-spb/public/uploads/products" ] && [ "$(ls -A /root/idylle-spb/public/uploads/products 2>/dev/null)" ]; then
    echo "📦 Перемещаю старые файлы из public/uploads..."
    cp -r /root/idylle-spb/public/uploads/products/* /var/www/uploads/products/ 2>/dev/null || true
    chown -R www-data:www-data /var/www/uploads/
    echo "✅ Старые файлы перемещены"
else
    echo "ℹ️  Старых файлов не найдено"
fi

# 4. Проверяем конфигурацию Nginx
echo "🔍 Проверяю конфигурацию Nginx..."
if grep -q "location /uploads/" /etc/nginx/sites-enabled/aromarussia.ru 2>/dev/null; then
    echo "✅ Nginx настроен для /uploads/"
else
    echo "⚠️  Предупреждение: проверьте настройки Nginx для /uploads/"
fi

# 5. Перезапускаем PM2 с обновленными переменными
echo "🔄 Перезапускаю PM2..."
pm2 restart idylle-spb --update-env

# 6. Проверяем статус
echo "📊 Статус PM2:"
pm2 status

# 7. Показываем последние файлы в директории
echo ""
echo "📂 Последние файлы в /var/www/uploads/products/:"
ls -lt /var/www/uploads/products/ 2>/dev/null | head -5 || echo "Директория пуста"

echo ""
echo "✅ Готово! Теперь попробуйте загрузить изображение через админ-панель."

