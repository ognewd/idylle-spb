# Исправление UPLOADS_DIR на продакшене

## Проблема
API загрузки не использует правильную директорию для сохранения файлов на продакшене.

## Решение

### Вариант 1: Добавить в .env файл (рекомендуется)

1. Проверьте, есть ли `.env` файл:
```bash
cd /root/idylle-spb
ls -la .env
```

2. Если файл существует, добавьте переменную:
```bash
echo "UPLOADS_DIR=/var/www/uploads" >> .env
```

3. Если файла нет, создайте его:
```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@localhost:5432/idylle_spb?schema=public
NEXTAUTH_SECRET=ваш_secret
NEXTAUTH_URL=https://aromarussia.ru
NEXT_PUBLIC_BASE_URL=https://aromarussia.ru
UPLOADS_DIR=/var/www/uploads
EOF
```

4. Перезапустите PM2:
```bash
pm2 restart idylle-spb
```

### Вариант 2: Создать ecosystem.config.js

Если вы хотите использовать ecosystem.config.js для PM2:

1. Создайте файл `ecosystem.config.js`:
```bash
cd /root/idylle-spb
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'idylle-spb',
    script: 'npm',
    args: 'start',
    cwd: '/root/idylle-spb',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://user:password@localhost:5432/idylle_spb?schema=public',
      NEXTAUTH_URL: 'https://aromarussia.ru',
      NEXT_PUBLIC_BASE_URL: 'https://aromarussia.ru',
      UPLOADS_DIR: '/var/www/uploads',
      NEXTAUTH_SECRET: 'ваш_secret_здесь'
    }
  }]
};
EOF
```

2. Перезапустите PM2 с новым конфигом:
```bash
pm2 delete idylle-spb
pm2 start ecosystem.config.js
pm2 save
```

### Проверка

После применения изменений проверьте:

1. Что переменная установлена:
```bash
pm2 show idylle-spb | grep -A 10 "env:"
```

2. Попробуйте загрузить изображение через админ-панель

3. Проверьте, что файл появился в правильной директории:
```bash
ls -la /var/www/uploads/products/ | tail -5
```

4. Проверьте права доступа:
```bash
ls -la /var/www/uploads/products/
# Должно быть www-data:www-data или root:www-data
```

### Если права доступа неправильные

Исправьте права:
```bash
chown -R www-data:www-data /var/www/uploads/products/
chmod -R 755 /var/www/uploads/products/
```

