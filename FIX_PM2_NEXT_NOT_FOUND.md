# Исправление ошибки "next: not found" в PM2

## Проблема
PM2 не может найти команду `next`, что приводит к ошибке:
```
sh: 1: next: not found
```

## Причина
PM2 запускает `npm start`, который вызывает `next start`, но `next` не найден в PATH, потому что:
1. Зависимости не установлены или повреждены
2. PM2 не может найти `next` в `node_modules/.bin/`
3. Конфигурация PM2 использует неправильный путь

## Решение

### Вариант 1: Автоматическое исправление (рекомендуется)

Выполните на сервере:

```bash
cd /root/idylle-spb
bash scripts/fix-pm2-next-not-found.sh
```

Скрипт автоматически:
- Проверит и установит зависимости
- Проверит наличие `next`
- Обновит конфигурацию PM2
- Перезапустит приложение

### Вариант 2: Ручное исправление

1. **Проверьте зависимости:**
```bash
cd /root/idylle-spb
ls -la node_modules/.bin/next
```

Если файла нет:
```bash
npm ci --prefer-offline --no-audit
```

2. **Обновите ecosystem.config.cjs:**

Если файл существует, проверьте его содержимое. Он должен использовать полный путь к `next`:
```javascript
module.exports = {
  apps: [{
    name: 'idylle-spb',
    cwd: '/root/idylle-spb',
    script: '/root/idylle-spb/node_modules/.bin/next',
    args: 'start',
    interpreter: 'node',
    // ... остальные настройки
  }],
};
```

Если файла нет, создайте его из примера:
```bash
cp ecosystem.config.cjs.example ecosystem.config.cjs
# Отредактируйте с правильными переменными окружения
nano ecosystem.config.cjs
```

3. **Перезапустите PM2:**
```bash
pm2 delete idylle-spb
pm2 start ecosystem.config.cjs
```

Или, если нет ecosystem.config.cjs:
```bash
pm2 delete idylle-spb
pm2 start /root/idylle-spb/node_modules/.bin/next --name idylle-spb -- start --update-env
```

4. **Проверьте статус:**
```bash
pm2 status
pm2 logs idylle-spb --lines 20
```

## Что было исправлено

1. **Обновлен `ecosystem.config.cjs.example`:**
   - Использует полный путь к `next`: `/root/idylle-spb/node_modules/.bin/next`
   - Добавлены настройки автоперезапуска и логирования

2. **Обновлен `.github/workflows/deploy.yml`:**
   - Добавлена проверка установки зависимостей перед запуском PM2
   - Добавлена проверка наличия `next` после установки
   - Улучшен fallback для запуска PM2

3. **Создан скрипт `scripts/fix-pm2-next-not-found.sh`:**
   - Автоматически проверяет и исправляет проблему
   - Переустанавливает зависимости при необходимости
   - Обновляет конфигурацию PM2

## Дополнительно: Установка sharp

Next.js рекомендует установить `sharp` для оптимизации изображений в production:

```bash
cd /root/idylle-spb
npm install sharp --save
pm2 restart idylle-spb --update-env
```

Это устранит предупреждение:
```
⚠ For production Image Optimization with Next.js, the optional 'sharp' package is strongly recommended.
```

## Проверка после исправления

1. Проверьте статус PM2:
```bash
pm2 status
```
Должно быть: `idylle-spb | online`

2. Проверьте логи:
```bash
pm2 logs idylle-spb --lines 30
```
Не должно быть ошибок `next: not found`

3. Проверьте доступность сайта:
```bash
curl -I http://localhost:3000
```

## Если проблема остается

1. Проверьте, что Node.js установлен:
```bash
node --version
npm --version
```

2. Проверьте права доступа:
```bash
ls -la /root/idylle-spb/node_modules/.bin/next
```

3. Попробуйте запустить вручную:
```bash
cd /root/idylle-spb
./node_modules/.bin/next start
```

Если это работает, проблема в конфигурации PM2.
