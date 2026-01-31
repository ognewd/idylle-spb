-- Обновляем название категории "Подарок" -> "Подарки"
UPDATE categories 
SET name = 'Подарки' 
WHERE slug = 'podarki';

-- Проверяем результат
SELECT id, name, slug FROM categories WHERE slug = 'podarki';
