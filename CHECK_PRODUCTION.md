# 🔍 Проверка продакшн сервера

**Дата проверки:** 2026-01-10 12:53

## ✅ Статус: РАБОТАЕТ

### Результаты проверки

1. **HTTPS доступность:**
   - ✅ Статус: `200 OK`
   - ✅ Сервер: `nginx/1.24.0 (Ubuntu)`
   - ✅ Content-Type: `text/html; charset=utf-8`

2. **HTTP редирект:**
   - ✅ Автоматический редирект на HTTPS (`301 Moved Permanently`)

3. **DNS:**
   - ✅ `aromarussia.ru` → `147.45.98.110`
   - ✅ Пинг работает (0% packet loss)

4. **API Health Check:**
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-10T12:53:17.044Z",
     "uptime": 351575.454023443,
     "environment": "production",
     "checks": {
       "database": "connected",
       "api": "ok"
     },
     "version": "0.1.0",
     "database": {
       "products": 1045,
       "categories": 3,
       "brands": 20
     }
   }
   ```

5. **База данных:**
   - ✅ Подключена
   - ✅ 1045 товаров
   - ✅ 3 категории
   - ✅ 20 брендов

---

## 🔧 Если не можете открыть домен

### Вариант 1: Проверка с вашего компьютера

```bash
# 1. Проверка DNS
nslookup aromarussia.ru

# 2. Проверка доступности
ping aromarussia.ru

# 3. Проверка HTTPS
curl -I https://aromarussia.ru

# 4. Проверка через браузер (в консоли разработчика)
# Откройте DevTools (F12) → Network tab → обновите страницу
# Посмотрите, что показывает браузер
```

### Вариант 2: Проверка на сервере

```bash
# Подключитесь к серверу
ssh root@147.45.98.110

# Проверьте PM2
pm2 status
pm2 logs idylle-spb --lines 50

# Проверьте Nginx
systemctl status nginx
nginx -t

# Проверьте порт 3000
curl http://localhost:3000

# Проверьте логи Nginx
tail -50 /var/log/nginx/error.log
tail -50 /var/log/nginx/access.log
```

### Вариант 3: Возможные проблемы

1. **DNS не обновился на вашем провайдере:**
   - Попробуйте использовать другой DNS (8.8.8.8, 1.1.1.1)
   - Очистите DNS кэш: `sudo dscacheutil -flushcache` (macOS)

2. **Блокировка провайдером:**
   - Попробуйте через VPN
   - Попробуйте с мобильного интернета

3. **Проблема с браузером:**
   - Очистите кэш браузера
   - Попробуйте в режиме инкогнито
   - Попробуйте другой браузер

4. **Проблема с SSL:**
   - Проверьте дату и время на вашем компьютере
   - Браузер может блокировать "небезопасное" соединение

5. **Файрвол/антивирус:**
   - Проверьте, не блокирует ли файрвол или антивирус соединение

---

## 📊 Текущие метрики сервера

- **Uptime:** ~351575 секунд (~4 дня)
- **Environment:** production
- **Database:** connected
- **Products:** 1045
- **Categories:** 3
- **Brands:** 20

---

## 🔗 Полезные команды

### Проверка PM2 на сервере
```bash
ssh root@147.45.98.110
pm2 status
pm2 logs idylle-spb --lines 100
pm2 restart idylle-spb  # если нужно перезапустить
```

### Проверка Nginx на сервере
```bash
ssh root@147.45.98.110
systemctl status nginx
systemctl restart nginx  # если нужно перезапустить
nginx -t  # проверка конфигурации
```

### Проверка базы данных
```bash
ssh root@147.45.98.110
cd /root/idylle-spb
npm run check:prod  # если скрипт есть
```

---

**Статус:** ✅ Сайт работает и доступен

