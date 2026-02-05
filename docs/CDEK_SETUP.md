# Настройка СДЭК (sdek-api-lib)

## Переменные окружения

В `.env.local` (или в админке → Доставка СДЭК) задайте:

| Переменная | Описание | Пример (тест) |
|------------|----------|----------------|
| `CDEK_CLIENT_ID` | Account (идентификатор) | из личного кабинета СДЭК |
| `CDEK_CLIENT_SECRET` | Secure password | из личного кабинета СДЭК |
| `CDEK_TEST_MODE` | `true` — тест api.edu.cdek.ru, иначе прод | `true` |
| `CDEK_API_TEST_URL` | URL тестовой среды **без** `/v2` | `https://api.edu.cdek.ru` |
| `CDEK_API_URL` | URL боевой среды **без** `/v2` | `https://api.cdek.ru` |

Библиотека сама добавляет путь `/v2` к baseUrl.

## Тестовая учётная запись (api.edu.cdek.ru)

- **Account** → `CDEK_CLIENT_ID`
- **Secure password** → `CDEK_CLIENT_SECRET`

Учётные данные тестовой среды указываются в личном кабинете СДЭК (раздел Интеграция).

## Проверка

```bash
# Запустить приложение
npm run dev

# Проверить авторизацию, расчёт тарифов и ПВЗ
curl -s http://localhost:3000/api/delivery/cdek/test
```

Ожидается `"overall": "SUCCESS"` и заполненные тесты auth, calculation, pvz.

## API-маршруты

- `GET /api/delivery/cdek/test` — проверка подключения к СДЭК
- `GET /api/cdek/cities?query=...` — подсказки городов
- `GET /api/delivery/cdek/pvz?city=...` — пункты выдачи по городу
- `POST /api/delivery/cdek/calculate` — расчёт стоимости доставки
- `POST /api/cdek-widget` — бэкенд для виджета СДЭК 3.0 (servicePath)
