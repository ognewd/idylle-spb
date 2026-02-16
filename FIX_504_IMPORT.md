# 504 Gateway Time-out при импорте товаров

## Чек-лист: что сделать в проде

1. **Зайти на сервер**
   ```bash
   ssh root@147.45.98.110
   ```

2. **Открыть конфиг nginx**
   ```bash
   nano /etc/nginx/sites-enabled/aromarussia.ru
   ```

3. **Найти блок `location /`** (тот, где есть `proxy_pass http://127.0.0.1:3000`). Внутри этого блока добавить три строки (если их ещё нет):
   ```nginx
   proxy_connect_timeout 600s;
   proxy_send_timeout 600s;
   proxy_read_timeout 600s;
   ```
   Вставьте их после других `proxy_set_header` и перед закрывающей `}`.

4. **Проверить конфиг и перезагрузить nginx**
   ```bash
   nginx -t && systemctl reload nginx
   ```

5. **Закоммитить и задеплоить код** (если ещё не деплоили правку с `maxDuration` в `apply/route.ts`):
   ```bash
   # у себя локально
   git add src/app/api/admin/import/apply/route.ts && git commit -m "fix: increase import apply timeout (maxDuration)" && git push
   # на сервере
   ssh root@147.45.98.110 "cd /root/idylle-spb && git pull && npm run build && pm2 restart idylle-spb"
   ```

После этого импорт в админке не должен обрываться по 504.

---

## Почему возникает

Эндпоинт **`/api/admin/import/apply`** выполняет тяжёлую работу:

- Обрабатывает **много товаров** подряд (создание/обновление в БД).
- Для каждого товара может **скачивать изображения по URL** (до 30 секунд на одно фото).

Если товаров и картинок много, один запрос может выполняться **несколько минут**.  
**Nginx** по умолчанию ждёт ответ от бэкенда **60 секунд** (`proxy_read_timeout`). Когда время выходит, nginx обрывает соединение и отдаёт **504 Gateway Time-out**, хотя приложение ещё продолжает работу.

## Что сделать

### 1. Увеличить таймауты в Nginx (обязательно)

На сервере отредактируйте конфиг сайта (например `/etc/nginx/sites-enabled/aromarussia.ru`).

**Вариант A.** Увеличить таймауты для всего API:

В блоке `location`, который проксирует запросы к приложению (например `location /` или `location /api`), добавьте или измените:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Увеличить таймауты для долгих запросов (импорт товаров)
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
}
```

**Вариант B.** Увеличить таймауты только для админского импорта:

```nginx
location /api/admin/import/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;
    proxy_read_timeout 600s;
}

# Остальной location / как обычно, со стандартными таймаутами
location / {
    proxy_pass http://127.0.0.1:3000;
    # ... остальные директивы
}
```

`600s` = 10 минут. При необходимости можно поставить больше (например `900s`).

Проверка и применение:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 2. В приложении уже выставлено `maxDuration`

В `src/app/api/admin/import/apply/route.ts` задано `export const maxDuration = 300` (5 минут), чтобы платформа не убивала обработчик раньше времени. Главное ограничение — именно nginx: пока не увеличите `proxy_read_timeout`, 504 будет возвращаться через 60 секунд.

## Кратко

| Причина | Действие |
|--------|----------|
| Nginx ждёт ответ 60 сек и обрывает запрос | Увеличить `proxy_read_timeout` (и при необходимости `proxy_connect_timeout`, `proxy_send_timeout`) до 600s в конфиге nginx для этого сайта. |
| Долгая работа импорта | Нормально при большом числе товаров и картинок; таймаут nginx должен это учитывать. |

После изменений в nginx импорт должен успевать завершаться без 504.
