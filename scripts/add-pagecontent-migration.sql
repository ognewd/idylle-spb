-- Миграция: Добавление поля pageContent в таблицу categories
-- Выполнить на продакшн сервере

-- Проверяем, существует ли уже поле
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'pageContent'
    ) THEN
        -- Добавляем поле pageContent
        ALTER TABLE categories 
        ADD COLUMN "pageContent" TEXT;
        
        RAISE NOTICE 'Поле pageContent успешно добавлено в таблицу categories';
    ELSE
        RAISE NOTICE 'Поле pageContent уже существует в таблице categories';
    END IF;
END $$;

