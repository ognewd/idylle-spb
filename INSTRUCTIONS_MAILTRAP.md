# Важно! Используйте SANDBOX для тестирования

В Mailtrap есть ДВА режима:

❌ LIVE (live.smtp.mailtrap.io) - для реальной отправки (нужен платный аккаунт)
✅ SANDBOX (sandbox.smtp.mailtrap.io) - для тестирования (бесплатно)

Используйте SANDBOX!

## Как получить SANDBOX настройки:

1. Откройте Mailtrap
2. Кликните "Email Testing" в левом меню
3. Выберите "Sandboxes"
4. Откройте "My Inbox" (или создайте новый inbox)
5. Перейдите на вкладку "SMTP Settings"
6. Выберите "Nodemailer" в списке интеграций
7. Скопируйте настройки:
   - Host: будет sandbox.smtp.mailtrap.io
   - Port: 2525
   - Username: длинная строка
   - Password: очень длинная строка

8. Отправьте мне эти 4 значения, и я обновлю .env.local
