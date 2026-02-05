# 🚀 Настройка автоматического деплоя

## 📋 Варианты автоматического деплоя

### Вариант 1: GitHub Actions (рекомендуется) ✅

Автоматический деплой при каждом push в ветку `main`.

#### Шаги настройки:

1. **Создайте SSH ключ для GitHub Actions (на вашем компьютере):**

```bash
# Создайте SSH ключ специально для деплоя
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/idylle_deploy

# Покажите публичный ключ (его нужно будет добавить на сервер)
cat ~/.ssh/idylle_deploy.pub
```

2. **Добавьте публичный ключ на сервер:**

```bash
# На сервере выполните:
ssh root@<YOUR_SERVER_IP>

# Добавьте публичный ключ в authorized_keys
echo "ВАШ_ПУБЛИЧНЫЙ_КЛЮЧ_ИЗ_ПРЕДЫДУЩЕЙ_КОМАНДЫ" >> ~/.ssh/authorized_keys

# Установите правильные права
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

3. **Добавьте Secrets в GitHub:**

- Перейдите в ваш репозиторий на GitHub: `https://github.com/ognewd/idylle-spb`
- Перейдите в `Settings` → `Secrets and variables` → `Actions`
- Нажмите `New repository secret`
- Добавьте следующие secrets:

```
SERVER_HOST = <YOUR_SERVER_IP>
SERVER_USER = root
SERVER_SSH_KEY = <содержимое файла ~/.ssh/idylle_deploy (приватный ключ)>
SERVER_PORT = 22 (или ваш порт SSH)
```

**Как получить приватный ключ:**
```bash
cat ~/.ssh/idylle_deploy
# Скопируйте весь вывод (включая -----BEGIN OPENSSH PRIVATE KEY----- и -----END OPENSSH PRIVATE KEY-----)
```

4. **Файл workflow уже создан:**

Файл `.github/workflows/deploy.yml` уже создан и готов к использованию.

5. **Проверьте работу:**

- Сделайте любой commit и push в `main`
- Перейдите в `Actions` вкладку на GitHub
- Увидите запуск workflow "Deploy to Production"
- Следите за выполнением

---

### Вариант 2: Git Hook на сервере (альтернатива)

Автоматический деплой при push на сервер (через bare репозиторий).

#### Шаги настройки:

```bash
# На сервере
ssh root@<YOUR_SERVER_IP>

# Создайте bare репозиторий
cd /root
git clone --bare https://github.com/ognewd/idylle-spb.git idylle-spb-bare.git
cd idylle-spb-bare.git

# Создайте post-receive hook
cat > hooks/post-receive << 'EOF'
#!/bin/bash
cd /root/idylle-spb
git --git-dir=/root/idylle-spb-bare.git --work-tree=/root/idylle-spb checkout -f main
cd /root/idylle-spb
npm install
npx prisma db push --accept-data-loss || true
npx prisma generate
npm run build
pm2 restart idylle-spb || pm2 start ecosystem.config.js || true
EOF

chmod +x hooks/post-receive
```

**Локально добавить remote:**
```bash
git remote add deploy root@<YOUR_SERVER_IP>:/root/idylle-spb-bare.git
```

**Деплой:**
```bash
git push deploy main
```

---

## ✅ Рекомендуемый вариант: GitHub Actions

**Плюсы:**
- ✅ Не требует прямого доступа к серверу из вашего компьютера
- ✅ История деплоев видна в GitHub
- ✅ Можно запускать вручную из GitHub UI
- ✅ Можно откатывать при ошибках
- ✅ Не нужно менять git remotes

**Минусы:**
- ⚠️ Требует настройки SSH ключей

---

## 🔒 Безопасность

### Для GitHub Actions:

1. **SSH ключ только для чтения/деплоя:**
   - Используйте отдельный SSH ключ только для деплоя
   - Не используйте свой основной SSH ключ

2. **GitHub Secrets:**
   - Все чувствительные данные хранятся в Secrets
   - Они не видны в логах workflow

3. **Ограничение доступа:**
   - Можно создать отдельного пользователя на сервере только для деплоя
   - Ограничить его правами только для директории проекта

---

## 📝 Использование

### После настройки GitHub Actions:

1. **Автоматический деплой:**
   - Просто делайте `git push` в `main` ветку
   - Деплой запустится автоматически

2. **Ручной запуск:**
   - Перейдите в `Actions` на GitHub
   - Выберите workflow "Deploy to Production"
   - Нажмите "Run workflow"

3. **Проверка статуса:**
   - Смотрите логи в `Actions` → выбранный workflow
   - Все шаги видны в реальном времени

---

## 🐛 Устранение проблем

### Проблема: SSH подключение не работает

**Решение:**
```bash
# Проверьте, что ключ добавлен на сервер
ssh -i ~/.ssh/idylle_deploy root@<YOUR_SERVER_IP>

# Если не работает, проверьте права на ключ
chmod 600 ~/.ssh/idylle_deploy
```

### Проблема: Workflow не запускается

**Решение:**
- Проверьте, что файл `.github/workflows/deploy.yml` закоммичен
- Проверьте, что вы пушите в ветку `main`
- Проверьте, что все Secrets заполнены в GitHub

### Проблема: Деплой падает на каком-то шаге

**Решение:**
- Смотрите логи в GitHub Actions
- Все ошибки видны в логах workflow
- Можно исправить и запустить заново

---

## 🎯 Итог

После настройки GitHub Actions:

1. **Делаете изменения локально**
2. **Коммитите и пушите в `main`**
3. **Деплой запускается автоматически** 🚀
4. **Проверяете статус в GitHub Actions**
5. **Сайт обновляется автоматически** ✅

**Никаких ручных команд на сервере больше не нужно!** 🎉

