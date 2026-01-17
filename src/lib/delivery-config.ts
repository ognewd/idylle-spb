/**
 * Конфигурация доставки
 * Можно вынести в настройки/админку в будущем
 */

export const DELIVERY_CONFIG = {
  // Код города Санкт-Петербург в CDEK
  SPB_CITY_CODE: 137,
  
  // Цена доставки курьером по Санкт-Петербургу
  SPB_COURIER_PRICE: 500,
  
  // Минимальная сумма для бесплатной доставки по СПб
  SPB_FREE_DELIVERY_THRESHOLD: 15000,
  
  // Адрес бутика для самовывоза
  BOUTIQUE_ADDRESS: 'г. Санкт-Петербург, Невский пр., д. 1',
  
  // Цена самовывоза из бутика (обычно 0)
  BOUTIQUE_PICKUP_PRICE: 0,
  
  // Город отправления (склад)
  SHIP_FROM_CITY: 'Санкт-Петербург',
  SHIP_FROM_CITY_CODE: 137,
  
  // Дефолтные параметры посылки, если не указаны в товаре
  DEFAULT_PACKAGE: {
    weight: 1000, // грамм
    length: 30,   // см
    width: 20,    // см
    height: 15,   // см
  },
} as const;

/**
 * Проверяет, является ли город Санкт-Петербургом
 * @param cityCode Код города из CDEK API
 * @param cityName Название города (для fallback)
 */
export function isSaintPetersburg(cityCode?: number | null, cityName?: string): boolean {
  if (cityCode === DELIVERY_CONFIG.SPB_CITY_CODE) {
    return true;
  }
  
  if (cityName) {
    const normalized = cityName.toLowerCase().trim();
    return normalized.includes('санкт-петербург') || 
           normalized.includes('спб') || 
           normalized.includes('спб') ||
           normalized === '190000';
  }
  
  return false;
}
