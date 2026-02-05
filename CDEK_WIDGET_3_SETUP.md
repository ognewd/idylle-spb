# Установка виджета СДЭК 3.0

По [официальной инструкции](https://github.com/cdek-it/widget/wiki/%D0%A3%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%BA%D0%B0-3.0) нужно сделать следующее.

## 1. Авторизация и бэкенд для расчёта (servicePath)

Виджет обращается к **серверному файлу** по URL для расчёта стоимости. Вместо PHP у нас **Next.js API**:

- **URL:** `https://ваш-сайт.ru/api/cdek-widget`  
  (локально: `http://localhost:3000/api/cdek-widget`)

Учётные данные СДЭК у вас уже есть: они задаются в **Админка → Доставка (СДЕК)** (CDEK_CLIENT_ID и CDEK_CLIENT_SECRET) или в переменных окружения. API-маршрут `/api/cdek-widget` использует их для запросов к API СДЭК.

## 2. Подключение скрипта виджета

В страницу, где будет карта СДЭК, нужно подключить скрипт. Рекомендуется в `<head>`:

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3" charset="utf-8"></script>
```

В Next.js это можно сделать через `next/script` в layout или в странице (например, доставки):

```tsx
import Script from 'next/script';

// В компоненте или layout:
<Script
  src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3"
  strategy="beforeInteractive"
  charset="utf-8"
/>
```

## 3. Ключ Яндекс.Карт

Без ключа Яндекс.Карт виджет **не отображается**.

1. Зайти в [Кабинет разработчика Яндекса](https://developer.tech.yandex.ru/).
2. Нажать «Получить ключ».
3. Выбрать сервис **«JavaScript API и HTTP Геокодер»**.
4. **Обязательно** указать в настройках ключа **HTTP Referrer** — адрес вашего сайта (например `https://idylle.spb.ru/*` или `http://localhost:3000/*` для разработки).

Подробнее: [лимиты и ключи](https://yandex.ru/dev/jsapi30/doc/ru/limit).

## 4. Размещение виджета на странице

1. Добавить контейнер с **фиксированной высотой** (иначе виджет не виден):

```tsx
<div
  id="cdek-map"
  style={{ width: '100%', minWidth: 800, height: 600 }}
/>
```

2. Инициализировать виджет **после** монтирования элемента (например, в `useEffect` или `DOMContentLoaded`):

```tsx
useEffect(() => {
  if (typeof window === 'undefined' || !window.CDEKWidget) return;
  const el = document.getElementById('cdek-map');
  if (!el) return;

  new window.CDEKWidget({
    from: 'Санкт-Петербург',
    root: 'cdek-map',
    apiKey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || 'ваш-ключ-яндекс',
    servicePath: `${window.location.origin}/api/cdek-widget`,
    defaultLocation: 'Санкт-Петербург',
    lang: 'rus',
    currency: 'RUB',
    goods: [{ weight: 1000, width: 30, height: 20, length: 15 }], // вес в граммах, размеры в см
    tariffs: {
      office: [234, 136, 138],  // до ПВЗ
      door: [233, 137, 139],   // до двери
    },
    onReady: () => console.log('Виджет СДЭК загружен'),
    onCalculate: (tariffs, address) => console.log('Расчёт:', tariffs, address),
    onChoose: (mode, tariff, address) => console.log('Выбрано:', mode, tariff, address),
  });
}, []);
```

3. Добавить типы для глобального объекта (например, в `src/types/next-auth.d.ts` или новый файл):

```ts
declare global {
  interface Window {
    CDEKWidget?: new (options: Record<string, unknown>) => unknown;
  }
}
```

## 5. Переменные окружения

В `.env` или `.env.local`:

```env
# Уже есть для СДЭК (админка / доставка)
CDEK_CLIENT_ID=...
CDEK_CLIENT_SECRET=...

# Для виджета — ключ Яндекс.Карт (доступен в браузере)
NEXT_PUBLIC_YANDEX_MAPS_API_KEY=ваш-ключ-яндекс
```

## 6. Где показывать виджет

Обычно виджет ставят:

- на страницу **Доставка** (`/delivery`);
- или в чекаут при выборе доставки СДЭК.

Сейчас у вас уже есть форма выбора СДЭК (`CdekDeliveryForm`). Виджет можно добавить **рядом** (карта + выбор ПВЗ) или на отдельную страницу «Пункты выдачи».

## Краткий чеклист

- [ ] Учётные данные СДЭК в админке или в env (уже есть).
- [ ] Реализован маршрут `POST /api/cdek-widget` (см. ниже).
- [ ] Подключён скрипт `@cdek-it/widget@3`.
- [ ] Получен ключ Яндекс.Карт и задан HTTP Referrer.
- [ ] На странице есть контейнер с `id="cdek-map"` и высотой.
- [ ] В `useEffect` вызывается `new window.CDEKWidget({ ... })`.
- [ ] В конфиге виджета указан `servicePath: origin + '/api/cdek-widget'` и `apiKey`.

## Формат запроса/ответа servicePath (виджет 3.0)

Виджет отправляет на `servicePath` POST-запрос с данными для расчёта (город, габариты и т.д.). Ответ должен совпадать с форматом, который ожидает виджет (тарифы, сроки). Маршрут `/api/cdek-widget` реализован как прокси к API СДЭК v2; при необходимости формат тела/ответа можно уточнить по сетевым запросам виджета к демо `service.php` или по документации виджета.
