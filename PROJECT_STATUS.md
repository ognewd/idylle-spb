# 📊 Статус проекта idylle-spb

**Последнее обновление:** 2026-01-06

## 🎯 Общая информация

**Название проекта:** idylle-spb  
**Версия:** 0.1.0  
**Framework:** Next.js 14.0.4  
**Язык:** TypeScript  
**Стили:** Tailwind CSS  

---

## 🏗️ Архитектура

### 🔵 Локальная разработка (Local Development)

**Расположение:** MacBook Air (разработка)  
**Путь:** `/Users/dognev/idylle-spb`

#### База данных
- **Тип:** PostgreSQL (локально)
- **Подключение:** `postgresql://dognev@localhost:5432/idylle_spb`
- **Пользователь:** `dognev`
- **База данных:** `idylle_spb`
- **Порт:** `5432`

#### Приложение
- **URL:** `http://localhost:3000`
- **Команда запуска:** `npm run dev`
- **Среда:** Development
- **Переменные окружения:** `.env.local`

#### Особенности
- ✅ Hot reload включен
- ✅ Prisma Studio доступен (`npm run db:studio`)
- ✅ Расширенное логирование Prisma (query, error, warn)
- ✅ Локальные загрузки в `public/uploads/`

---

### 🟢 Продакшн (Production)

**Провайдер:** Timeweb VPS  
**IP адрес:** `147.45.98.110`  
**Домен:** `aromarussia.ru` (и `www.aromarussia.ru`)  
**Протокол:** HTTPS (Let's Encrypt SSL)

#### Инфраструктура сервера
- **ОС:** Ubuntu 24.04.3 LTS
- **Расположение:** `/root/idylle-spb`
- **SSH доступ:** `ssh root@147.45.98.110`

#### База данных
- **Тип:** PostgreSQL (на VPS)
- **Подключение:** `postgresql://idylle_user:wendw@@422ewd!@localhost:5432/idylle_spb`
- **Пользователь:** `idylle_user`
- **База данных:** `idylle_spb`
- **Порт:** `5432` (внутренний)
- **Данные:** ~1045 продуктов, 3 пользователя (мигрировано с локальной БД)

#### Приложение
- **URL:** `https://aromarussia.ru`
- **Процесс менеджер:** PM2 (`idylle-spb`)
- **Команда:** `npm start` (после `npm run build`)
- **Среда:** Production
- **Порт:** `3000` (внутренний, через Nginx)

#### Reverse Proxy
- **Веб-сервер:** Nginx
- **Конфиг:** `/etc/nginx/sites-enabled/aromarussia.ru`
- **SSL:** Let's Encrypt (Certbot)
- **Статические файлы:** `/var/www/uploads/` → `/uploads/`

#### Хранилище файлов
- **Директория:** `/var/www/uploads/products/`
- **Владелец:** `www-data:www-data`
- **Права:** `755`
- **Доступ:** `https://aromarussia.ru/uploads/products/...`

#### Переменные окружения (продакшн)
- **Файл:** `.env` и `.env.production` на сервере
- **PM2 конфиг:** `ecosystem.config.js` (определяет env vars явно)

**Основные переменные:**
```env
DATABASE_URL=postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public
NEXTAUTH_URL=https://aromarussia.ru
NEXT_PUBLIC_BASE_URL=https://aromarussia.ru
NEXTAUTH_SECRET=xIQ+KV1XzDfuKdAHrpxhiuMgUd9EBpo0dgIy/ph+zCU=
NODE_ENV=production
UPLOADS_DIR=/var/www/uploads
```

---

## 📦 Технологический стек

### Frontend
- **Next.js:** 14.0.4 (App Router)
- **React:** 18
- **TypeScript:** 5
- **Tailwind CSS:** 3.3.0
- **Radix UI:** компоненты интерфейса
- **Framer Motion:** анимации

### Backend
- **Next.js API Routes:** REST API
- **NextAuth.js:** 4.24.5 (аутентификация)
- **Prisma ORM:** 5.7.1
- **PostgreSQL:** 15
- **Nodemailer:** 6.9.7 (SMTP)

### Дополнительно
- **Stripe:** 14.10.0 (платежи)
- **Socket.io:** 4.8.1 (чат)
- **bcryptjs:** 2.4.3 (хеширование паролей)
- **jsonwebtoken:** 9.0.2 (JWT токены)

---

## 🗄️ База данных

### Модели (Prisma Schema)
- ✅ User (пользователи)
- ✅ Product (товары)
- ✅ Category (категории)
- ✅ Brand (бренды)
- ✅ Order (заказы)
- ✅ Review (отзывы)
- ✅ WishlistItem (избранное)
- ✅ Address (адреса)
- ✅ SeasonalDiscount (сезонные скидки)
- ✅ Settings (настройки)

### Статус данных

#### Локально
- База данных: `idylle_spb`
- Пользователь: `dognev`
- Данные: разработка/тестирование

#### Продакшн
- База данных: `idylle_spb`
- Пользователь: `idylle_user`
- **Данные:**
  - ~1045 продуктов
  - 3 пользователя
  - Категории, бренды, заказы
  - Миграция выполнена: локальная БД → продакшн VPS

---

## 🚀 Процесс деплоя

### Локальная разработка
```bash
# 1. Запустить локальный PostgreSQL
# 2. Установить зависимости
npm install

# 3. Настроить переменные окружения
# .env.local с DATABASE_URL для локальной БД

# 4. Применить схему Prisma
npx prisma db push

# 5. Запустить dev сервер
npm run dev
```

### Деплой на продакшн

#### Шаг 1: Локально (подготовка)
```bash
# 1. Закоммитить изменения
git add .
git commit -m "Описание изменений"
git push origin main
```

#### Шаг 2: На сервере (деплой)
```bash
# 1. Подключиться к серверу
ssh root@147.45.98.110

# 2. Перейти в директорию проекта
cd /root/idylle-spb

# 3. Получить последние изменения
git pull

# 4. Установить зависимости (если нужно)
npm install

# 5. Пересобрать приложение
npm run build

# 6. Перезапустить PM2
pm2 restart idylle-spb
```

---

## 🔐 Безопасность

### Продакшн
- ✅ HTTPS настроен (Let's Encrypt)
- ✅ SSL сертификат автоматически обновляется
- ✅ Загрузки файлов вынесены из `/root` в `/var/www/uploads`
- ✅ Правильные права доступа (`www-data:www-data`)
- ✅ Пароли в `DATABASE_URL` URL-кодированы

### Аутентификация
- NextAuth.js для пользователей
- JWT токены для админ-панели
- Хеширование паролей (bcryptjs)

---

## 📧 Email (SMTP)

### Текущий статус
- ✅ Система настройки SMTP через админку (`/admin/email/smtp`)
- ✅ Поддержка настроек через БД или переменные окружения
- ⚠️ SMTP сервер не настроен (используется Mailtrap для разработки)

### Настройка (требуется)
**Рекомендация:** Использовать Mail.ru SMTP или Yandex Mail
- **Mail.ru:** бесплатно для .ru доменов
- **Yandex Mail:** 1000 писем/день бесплатно

**Альтернатива:** Поднять свой SMTP сервер (Postfix) на VPS
- Требуется настройка DNS (SPF, DKIM, DMARC)
- Более сложная настройка

---

## 📁 Структура проекта

```
idylle-spb/
├── prisma/
│   └── schema.prisma          # Схема базы данных
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API Routes
│   │   ├── admin/            # Админ-панель
│   │   ├── catalog/          # Каталог товаров
│   │   └── ...
│   ├── components/           # React компоненты
│   ├── lib/                  # Утилиты и библиотеки
│   │   ├── prisma.ts        # Prisma Client
│   │   ├── mail.ts          # SMTP/Email
│   │   └── ...
│   └── types/               # TypeScript типы
├── public/                   # Статические файлы
│   └── uploads/             # Локальные загрузки (dev)
├── scripts/                 # Вспомогательные скрипты
├── ecosystem.config.js      # PM2 конфиг (на сервере)
├── next.config.js           # Next.js конфигурация
└── package.json             # Зависимости
```

---

## ✅ Выполненные задачи

1. ✅ Миграция на Timeweb VPS
2. ✅ Настройка PostgreSQL на сервере
3. ✅ Миграция данных с локальной БД на продакшн
4. ✅ Настройка Nginx как reverse proxy
5. ✅ Настройка SSL (HTTPS) через Let's Encrypt
6. ✅ Настройка PM2 для управления процессом
7. ✅ Перенос загрузок файлов в `/var/www/uploads`
8. ✅ Настройка Next.js Image Optimization
9. ✅ Улучшение отображения изображений товаров
10. ✅ Удаление зависимостей от Vercel/Supabase

---

## 🔄 Текущие задачи

### В процессе
- [ ] Настройка SMTP для отправки email

### Рекомендуется
- [ ] Настроить автоматические бэкапы PostgreSQL
- [ ] Настроить мониторинг (опционально)
- [ ] Оптимизировать производительность (кэширование)

---

## 🐛 Известные проблемы

Нет критических проблем. Все основные функции работают.

---

## 📞 Контакты и доступ

### Продакшн
- **URL:** https://aromarussia.ru
- **Админ-панель:** https://aromarussia.ru/admin/login
- **SSH:** `ssh root@147.45.98.110`

### Доступ к админ-панели
- Через `/admin/login`
- JWT токен сохраняется в localStorage

---

## 📈 Статистика

- **Всего API endpoints:** 48+
- **Компонентов:** 30+
- **Моделей БД:** 10+
- **Товаров на продакшн:** ~1045
- **Пользователей на продакшн:** 3

---

**Последнее обновление:** 2026-01-06
