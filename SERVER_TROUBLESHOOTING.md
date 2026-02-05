# Диагностика проблем с сервером

## Проверка доступности сервера

### 1. Проверка ping
```bash
ping <YOUR_SERVER_IP>
```
Если ping не проходит - проблема с сетью или сервер выключен.

### 2. Проверка HTTP/HTTPS
```bash
curl -I https://aromarussia.ru
```
Если сайт не отвечает - возможно, только веб-сервер упал.

### 3. Проверка SSH
```bash
ssh -v root@<YOUR_SERVER_IP>
```
Флаг `-v` покажет детали подключения, где именно происходит ошибка.

## Возможные причины проблем

1. **Сервер выключен/перезагружается** - нужно проверить через панель управления VPS (Timeweb)
2. **Проблемы с сетью/DDOS** - временные проблемы провайдера
3. **Исчерпаны ресурсы** - сервер перегружен, нужно проверить через панель
4. **Проблемы с SSH сервисом** - решается перезагрузкой сервера

## Что делать

### Вариант 1: Проверить через панель управления Timeweb
1. Войдите в панель управления Timeweb
2. Перейдите в раздел VPS
3. Проверьте статус сервера
4. Если сервер выключен - включите его
5. Проверьте использование ресурсов (CPU, RAM, Disk)

### Вариант 2: Если есть консоль через панель (VNC/KVM)
1. Подключитесь через консоль в панели управления
2. Проверьте статус системы
3. Перезагрузите сервер при необходимости

### Вариант 3: Подождать
Иногда бывают временные проблемы с сетью, которые решаются автоматически через несколько минут.

## Подключение к БД на проде упало

### 1. Проверить, что PostgreSQL запущен (если БД на том же сервере)

```bash
ssh root@<YOUR_SERVER_IP>
sudo systemctl status postgresql
# или
sudo service postgresql status
```

Если сервис не активен:
```bash
sudo systemctl start postgresql
# или
sudo service postgresql start
```

### 2. Проверить DATABASE_URL на сервере

```bash
cd /root/idylle-spb
grep DATABASE_URL .env
```

Формат должен быть: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

- Если БД на этом же сервере: `HOST` обычно `localhost`.
- Пароль в URL должен быть URL-encoded (например `@` → `%40`, `!` → `%21`).

### 3. Проверить подключение с сервера

**Через psql:**
```bash
cd /root/idylle-spb
export $(grep -v '^#' .env | xargs)
psql "$DATABASE_URL" -c "SELECT 1"
```

**Через скрипт проекта:**
```bash
cd /root/idylle-spb
npx tsx scripts/check-prod-connection.ts
```

Скрипт подхватит `.env` и выведет ошибку, если подключение не удалось.

### 4. Частые причины

| Причина | Что сделать |
|--------|--------------|
| PostgreSQL не запущен | `sudo systemctl start postgresql` |
| Неверный пароль/пользователь в `.env` | Исправить `DATABASE_URL` в `.env`, перезапустить приложение |
| БД на другом хосте недоступна | Проверить сеть, файрвол, что хост жив |
| Закончилось место на диске | `df -h`, почистить логи/бэкапы, перезапустить PostgreSQL |
| Слишком много соединений | Перезапустить PostgreSQL и приложение: `sudo systemctl restart postgresql` и `pm2 restart idylle-spb` |

### 5. После исправления

```bash
cd /root/idylle-spb
pm2 restart idylle-spb --update-env
pm2 logs idylle-spb --lines 30
```

---

## После восстановления доступа

Когда доступ восстановится, выполните:

```bash
ssh root@<YOUR_SERVER_IP>
cd /root/idylle-spb
pm2 status
pm2 logs idylle-spb --lines 50
```

Если приложение не запущено:
```bash
cd /root/idylle-spb
pm2 restart idylle-spb || pm2 start ecosystem.config.js
```

