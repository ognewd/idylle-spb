-- Создание таблицы settings для хранения SMTP конфигурации
CREATE TABLE IF NOT EXISTS "settings" (
  id        TEXT NOT NULL PRIMARY KEY DEFAULT 'cuid()',
  key       TEXT NOT NULL UNIQUE,
  value     TEXT NOT NULL,
  type      TEXT NOT NULL DEFAULT 'string',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Комментарии
COMMENT ON TABLE settings IS 'Таблица для хранения настроек приложения (SMTP и другие)';
COMMENT ON COLUMN settings.key IS 'Ключ настройки (например, SMTP_HOST)';
COMMENT ON COLUMN settings.value IS 'Значение настройки';
COMMENT ON COLUMN settings.type IS 'Тип настройки (string, number, boolean)';
