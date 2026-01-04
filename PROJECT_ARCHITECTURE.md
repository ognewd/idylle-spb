# 🏗️ Архитектура проекта Idylle SPB

## 📋 Общая структура

Проект построен на **Next.js 14+ с App Router**, использует **TypeScript**, **PostgreSQL** через **Prisma ORM**, и **React** с **Tailwind CSS**.

---

## 🔧 Технологический стек

### Backend:
- **Next.js App Router** - серверный рендеринг и API routes
- **Prisma ORM** - работа с PostgreSQL
- **NextAuth.js** - аутентификация
- **bcryptjs** - хеширование паролей
- **JWT** - токены для админ-панели

### Frontend:
- **React 18+** - UI библиотека
- **TypeScript** - типизация
- **Tailwind CSS** - стилизация
- **shadcn/ui** - компоненты UI
- **Lucide React** - иконки

### База данных:
- **PostgreSQL 15.14** (локально)
- **Prisma Schema** - схема БД

---

## 📁 Структура проекта

```
idylle-spb/
├── src/
│   ├── app/                    # Next.js App Router страницы
│   │   ├── page.tsx           # Главная страница
│   │   ├── catalog/           # Каталог товаров
│   │   ├── admin/             # Админ-панель
│   │   ├── api/               # API endpoints
│   │   ├── auth/              # Страницы аутентификации
│   │   └── ...
│   ├── components/            # React компоненты
│   │   ├── layout/           # Header, Footer, AdminToolbar
│   │   ├── product/          # ProductCard, ProductInfo, ProductFilters
│   │   ├── admin/            # Компоненты админки
│   │   └── ...
│   ├── contexts/             # React Context
│   │   ├── CartContext.tsx   # Управление корзиной
│   │   └── WishlistContext.tsx # Управление избранным
│   ├── lib/                  # Утилиты
│   │   ├── prisma.ts         # Prisma клиент
│   │   └── auth.ts           # NextAuth конфигурация
│   └── ...
├── prisma/
│   └── schema.prisma         # Схема базы данных
└── public/                   # Статические файлы
```

---

## 🔄 Как работает проект на локальном сервере

### 1. Запуск сервера

```bash
npm run dev
```

**Что происходит:**
- Next.js запускает dev сервер на `http://localhost:3000`
- Используется `DATABASE_URL` из `.env.local` для подключения к PostgreSQL
- Сервер работает в режиме разработки с hot-reload

### 2. База данных

**Подключение:**
- PostgreSQL на `localhost:5432`
- База данных: `idylle_spb`
- Пользователь: `dognev`
- Connection String: `postgresql://dognev@localhost:5432/idylle_spb`

**Схема:**
- Управляется через Prisma (`prisma/schema.prisma`)
- Таблицы: Users, Products, Categories, Brands, Orders, Reviews, и др.

**Текущие данные:**
- ✅ 1045 товаров
- ✅ 3 категории
- ✅ 20 брендов
- ✅ Администраторы (super_admin, admin)

### 3. Архитектура запросов

#### Frontend → Backend:

```
Браузер → Next.js Server → API Route → Prisma → PostgreSQL
```

**Пример запроса товаров:**
1. Пользователь открывает `/catalog`
2. React компонент делает `fetch('/api/products')`
3. API Route (`src/app/api/products/route.ts`) обращается к Prisma
4. Prisma делает SQL запрос к PostgreSQL
5. Данные возвращаются через API → React компонент → UI

### 4. Основные страницы и маршруты

#### Публичные страницы:

**`/` (Главная)**
- Компонент: `src/app/page.tsx`
- Функции: Hero секция, категории, популярные товары

**`/catalog` (Каталог)**
- Компонент: `src/app/catalog/page.tsx`
- Функции: Список товаров, фильтры, поиск, пагинация

**`/catalog/[slug]` (Страница товара)**
- Компонент: `src/app/catalog/[slug]/page.tsx`
- Функции: Детальная информация о товаре, изображения, варианты, добавление в корзину

**`/aromaty-dlya-doma` (Категория)**
- Компонент: `src/app/aromaty-dlya-doma/page.tsx`
- Функции: Товары категории, фильтры, ленивая загрузка

**`/uyut-i-interer` (Категория)**
- Компонент: `src/app/uyut-i-interer/page.tsx`

**`/podarki` (Категория)**
- Компонент: `src/app/podarki/page.tsx`

**`/wishlist` (Избранное)**
- Компонент: `src/app/wishlist/page.tsx`
- Функции: Список избранных товаров (localStorage)

**`/cart` (Корзина)**
- Компонент: `src/app/cart/page.tsx`
- Функции: Управление корзиной (localStorage)

#### Админ-панель:

**`/admin/login`**
- Аутентификация через JWT
- Токен сохраняется в `localStorage` как `admin_token`

**`/admin`**
- Главная страница админки

**`/admin/products`**
- Управление товарами (CRUD)
- Поиск, фильтры, импорт из Excel

**`/admin/categories`**
- Управление категориями

**`/admin/brands`**
- Управление брендами

**`/admin/orders`**
- Управление заказами

**`/admin/seasonal-discounts`**
- Сезонные скидки

### 5. API Endpoints

**Публичные API:**

- `GET /api/products` - Список товаров с фильтрацией
- `GET /api/products/[slug]` - Детали товара
- `GET /api/filters` - Фильтры для каталога
- `GET /api/categories` - Список категорий
- `GET /api/brands` - Список брендов
- `GET /api/health` - Health check

**Админ API (требует авторизацию):**

- `GET /api/admin/products` - Список товаров (админ)
- `POST /api/admin/products` - Создать товар
- `PUT /api/admin/products/[id]` - Обновить товар
- `DELETE /api/admin/products/[id]` - Удалить товар
- `POST /api/admin/upload` - Загрузка изображений
- `POST /api/admin/import/parse` - Парсинг Excel
- `POST /api/admin/login` - Вход в админку

### 6. State Management

#### React Context:

**CartContext** (`src/contexts/CartContext.tsx`)
- Управление корзиной покупок
- Хранение в `localStorage` как `cart`
- Функции: `addItem`, `removeItem`, `updateQuantity`, `clearCart`

**WishlistContext** (`src/contexts/WishlistContext.tsx`)
- Управление избранным
- Хранение в `localStorage` как `wishlist_items_v1`
- Функции: `add`, `remove`, `toggle`, `isInWishlist`

**SessionProvider** (NextAuth)
- Управление сессиями пользователей

### 7. Фильтрация и поиск

#### Клиентская фильтрация:
- Работает через URL параметры (`?filter_category=...&filter_brand=...`)
- Использует `useSearchParams()` из Next.js

#### Серверная фильтрация:
- API `/api/products` принимает query параметры
- Prisma строит `where` условия
- Фильтры: категория, бренд, цена, пол, тип аромата, назначение, страна

#### Поиск:
- В админке: серверный поиск через Prisma `contains`
- В каталоге: через фильтры

### 8. Ленивая загрузка (Infinite Scroll)

**Реализация:**
- Использует `IntersectionObserver` API
- При скролле вниз загружаются следующие страницы
- API поддерживает пагинацию: `?page=1&limit=24`

**Страницы с ленивой загрузкой:**
- `/catalog`
- `/aromaty-dlya-doma`
- `/uyut-i-interer`
- `/podarki`

### 9. Загрузка изображений

**Процесс:**
1. Админ выбирает файлы через `<input type="file">`
2. Файлы отправляются на `/api/admin/upload` как `FormData`
3. Сервер сохраняет файлы в `public/uploads/products/`
4. Возвращается URL: `/uploads/products/filename.jpg`

### 10. Аутентификация

**Админ-панель:**
- JWT токены (хранятся в `localStorage`)
- Проверка через `Authorization: Bearer <token>`
- Роли: `admin`, `super_admin`

**Пользователи (NextAuth):**
- Сессии через NextAuth.js
- Поддержка OAuth (Google, VK - если настроено)

### 11. Обработка ошибок

- Next.js Error Boundaries
- Try-catch в API routes
- Логирование в консоль (development)
- Обработка 404 через `not-found.tsx`

---

## 🔄 Типичный поток данных

### Пример: Просмотр товара

```
1. Пользователь открывает /catalog/diffuzor-oud-nobile
   ↓
2. Next.js рендерит src/app/catalog/[slug]/page.tsx
   ↓
3. Server Component делает fetch('http://localhost:3000/api/products/diffuzor-oud-nobile')
   ↓
4. API Route: src/app/api/products/[slug]/route.ts
   ↓
5. Prisma: prisma.product.findUnique({ where: { slug } })
   ↓
6. PostgreSQL: SELECT * FROM products WHERE slug = 'diffuzor-oud-nobile'
   ↓
7. Данные возвращаются → API → Server Component → React → UI
```

### Пример: Добавление в корзину

```
1. Пользователь нажимает "В корзину"
   ↓
2. React компонент вызывает CartContext.addItem()
   ↓
3. Данные добавляются в state
   ↓
4. useEffect сохраняет в localStorage как 'cart'
   ↓
5. UI обновляется (показывается счетчик в Header)
```

---

## 📊 База данных

### Основные таблицы:

- **users** - Пользователи (админы, клиенты)
- **products** - Товары
- **categories** - Категории
- **brands** - Бренды
- **product_categories** - Связь товаров и категорий (many-to-many)
- **product_images** - Изображения товаров
- **product_variants** - Варианты товаров (объемы, размеры)
- **orders** - Заказы
- **order_items** - Товары в заказах
- **reviews** - Отзывы
- **seasonal_discounts** - Сезонные скидки

### Связи:
- Product ↔ Category (many-to-many)
- Product ↔ Brand (many-to-one)
- Product ↔ Images (one-to-many)
- Product ↔ Variants (one-to-many)
- User ↔ Orders (one-to-many)

---

## 🎨 UI Компоненты

**Используются из shadcn/ui:**
- Button, Card, Input, Badge, Dialog, Tabs, и др.

**Кастомные компоненты:**
- ProductCard - карточка товара
- ProductInfo - детальная информация о товаре
- ProductFilters - фильтры каталога
- AdminToolbar - панель администратора
- Header, Footer - навигация

---

## 🔐 Безопасность

- Пароли хешируются через bcrypt (10-12 rounds)
- JWT токены для админки
- Проверка ролей в API routes
- Валидация данных на сервере

---

## 📝 Переменные окружения

**`.env.local` (локальная разработка):**
```
DATABASE_URL="postgresql://dognev@localhost:5432/idylle_spb"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🚀 Production Ready

Проект готов к деплою:
- ✅ Очищен от хардкод URL
- ✅ Переменные окружения настроены
- ✅ Git синхронизирован
- ⏳ Ожидает: подключение Supabase и Vercel

---

*Обновлено: 2025-01-04*

