# 📧 Настройка SMTP для отправки писем

У вас уже есть готовая админка для настройки SMTP (`/admin/email/smtp`). Есть два варианта:

## 🎯 Вариант 1: Внешний SMTP сервис (РЕКОМЕНДУЕТСЯ)

**Плюсы:**
- ✅ Быстро и просто
- ✅ Не нужно настраивать DNS
- ✅ Надежная доставляемость
- ✅ Не нужно управлять сервером

**Варианты:**

### Mail.ru SMTP
1. Зарегистрируйте почту на Mail.ru (например, `noreply@mail.ru`)
2. Настройки:
   - **Host:** `smtp.mail.ru`
   - **Port:** `465` (SSL) или `587` (TLS)
   - **User:** ваша почта
   - **Pass:** пароль от почты
   - **From:** ваша почта

### Yandex SMTP
1. Зарегистрируйте почту на Yandex (например, `noreply@yandex.ru`)
2. Настройки:
   - **Host:** `smtp.yandex.ru`
   - **Port:** `465` (SSL) или `587` (TLS)
   - **User:** ваша почта
   - **Pass:** пароль от почты (или пароль приложения)
   - **From:** ваша почта
3. **Важно:** Нужно включить "Пароли приложений" в настройках Яндекс ID

### Gmail SMTP
1. Создайте Google аккаунт
2. Включите "Двухэтапную аутентификацию"
3. Создайте "Пароль приложения"
4. Настройки:
   - **Host:** `smtp.gmail.com`
   - **Port:** `587` (TLS)
   - **User:** ваша почта Gmail
   - **Pass:** пароль приложения
   - **From:** ваша почта

**Как настроить:**
1. Войдите в админку: `/admin/email/smtp`
2. Введите настройки выше
3. Нажмите "Test Connection" для проверки
4. Нажмите "Send Test Email" для отправки тестового письма

---

## 🛠️ Вариант 2: Свой SMTP сервер (Postfix) на VPS

**Плюсы:**
- ✅ Полный контроль
- ✅ Отправка от своего домена (например, `noreply@aromarussia.ru`)
- ✅ Нет ограничений по количеству писем

**Минусы:**
- ❌ Сложнее настроить
- ❌ Нужно настроить DNS (SPF, DKIM, DMARC)
- ❌ Требуется время на "прогрев" репутации домена
- ❌ Нужно следить за безопасностью

### Пошаговая инструкция

#### Шаг 1: Установка Postfix

```bash
ssh root@<YOUR_SERVER_IP>

# Обновить систему
apt update && apt upgrade -y

# Установить Postfix
apt install postfix -y

# Во время установки выберите:
# - Internet Site
# - System mail name: aromarussia.ru
```

#### Шаг 2: Базовая настройка Postfix

```bash
# Редактировать конфигурацию
nano /etc/postfix/main.cf
```

Добавьте/измените следующие строки:

```conf
# Основные настройки
myhostname = aromarussia.ru
mydomain = aromarussia.ru
myorigin = $mydomain
inet_interfaces = localhost
inet_protocols = ipv4

# Настройки сети
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain

# Ограничения
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
relayhost =

# Безопасность
smtpd_banner = $myhostname ESMTP
smtpd_helo_required = yes
smtpd_helo_restrictions = permit_mynetworks, reject_invalid_helo_hostname, permit

# TLS
smtpd_tls_cert_file = /etc/ssl/certs/ssl-cert-snakeoil.pem
smtpd_tls_key_file = /etc/ssl/private/ssl-cert-snakeoil.key
smtpd_use_tls = yes
smtpd_tls_auth_only = yes
smtpd_tls_security_level = may

# Ограничение размера писем
message_size_limit = 52428800

# Логирование
mail.log
```

Сохраните файл (Ctrl+O, Enter, Ctrl+X).

#### Шаг 3: Настройка SASL для аутентификации

```bash
# Установить SASL
apt install libsasl2-modules sasl2-bin -y

# Создать пароль для SMTP
saslpasswd2 -c -u aromarussia.ru noreply
# Введите пароль (запомните его!)

# Проверить пользователя
sasldblistusers2

# Настроить Postfix для использования SASL
echo "smtpd_sasl_auth_enable = yes
smtpd_sasl_security_options = noanonymous
smtpd_sasl_local_domain = \$myhostname
smtpd_recipient_restrictions = permit_mynetworks, permit_sasl_authenticated, reject_unauth_destination" >> /etc/postfix/main.cf
```

#### Шаг 4: Настройка firewall (если используется)

```bash
# Проверить статус firewall
ufw status

# Если firewall активен, разрешить SMTP
ufw allow 25/tcp
ufw allow 587/tcp
ufw allow 465/tcp
```

#### Шаг 5: Перезапуск Postfix

```bash
# Перезапустить Postfix
systemctl restart postfix
systemctl enable postfix

# Проверить статус
systemctl status postfix

# Проверить логи
tail -f /var/log/mail.log
```

#### Шаг 6: Настройка DNS записей

Нужно добавить DNS записи для улучшения доставляемости:

##### SPF запись (TXT)

Добавьте в DNS вашего домена (через панель Timeweb):

```
Тип: TXT
Имя: @ (или оставьте пустым)
Значение: v=spf1 mx a ip4:<YOUR_SERVER_IP> ~all
TTL: 3600
```

##### DKIM (опционально, но рекомендуется)

Для DKIM нужно установить OpenDKIM:

```bash
apt install opendkim opendkim-tools -y

# Создать ключи
mkdir -p /etc/opendkim/keys/aromarussia.ru
opendkim-genkey -D /etc/opendkim/keys/aromarussia.ru/ -d aromarussia.ru -s default
chown -R opendkim:opendkim /etc/opendkim/keys

# Настроить OpenDKIM
nano /etc/opendkim.conf
```

Добавьте:

```conf
Domain aromarussia.ru
KeyFile /etc/opendkim/keys/aromarussia.ru/default.private
Selector default
```

Затем добавьте DNS запись DKIM (значение из файла `default.txt`):

```
Тип: TXT
Имя: default._domainkey
Значение: (из файла default.txt)
```

##### DMARC (рекомендуется)

Добавьте DNS запись:

```
Тип: TXT
Имя: _dmarc
Значение: v=DMARC1; p=quarantine; rua=mailto:postmaster@aromarussia.ru
```

#### Шаг 7: Настройка в админке

1. Войдите в админку: `/admin/email/smtp`
2. Введите настройки:
   - **Host:** `localhost` (или `127.0.0.1`)
   - **Port:** `587` (или `25`)
   - **User:** `noreply@aromarussia.ru`
   - **Pass:** (пароль, который вы задали через saslpasswd2)
   - **From:** `noreply@aromarussia.ru`
3. Нажмите "Test Connection"
4. Нажмите "Send Test Email"

#### Шаг 8: Тестирование

```bash
# Тест отправки письма с сервера
echo "Test email" | mail -s "Test Subject" your-email@example.com

# Проверить логи
tail -f /var/log/mail.log
```

---

## 🎯 Рекомендация

**Для начала рекомендую Вариант 1 (внешний SMTP):**
- Быстро работает
- Не нужно настраивать DNS
- Надежная доставляемость

**Вариант 2 (свой Postfix) стоит использовать если:**
- Нужно отправлять письма от своего домена
- Нужно отправлять очень много писем
- Есть время на настройку и поддержку

---

## 📝 Примечания

1. Если используете свой домен (`@aromarussia.ru`), нужно:
   - Настроить MX записи в DNS
   - Настроить SPF, DKIM, DMARC
   - Подождать 24-48 часов для распространения DNS

2. Если письма попадают в спам:
   - Проверьте SPF/DKIM/DMARC записи
   - Убедитесь, что домен не в черных списках
   - Проверьте логи Postfix

3. Ограничения:
   - Mail.ru/Yandex: ~1000 писем/день бесплатно
   - Gmail: ~500 писем/день
   - Свой Postfix: без ограничений, но нужно следить за репутацией

Какой вариант вы хотите попробовать?

