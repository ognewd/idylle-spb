/**
 * Преобразует относительные пути изображений в полные URL.
 * В API можно передать baseUrl из request (origin), чтобы в каталоге картинки не вели на localhost.
 * 
 * Логика:
 * - Если URL уже полный (http/https) - возвращаем как есть
 * - Для /uploads/ путей на проде возвращаем относительный путь (Nginx раздаст напрямую)
 * - Для других путей формируем полный URL с baseUrl
 */
export function getImageUrl(
  url: string | null | undefined,
  options?: { baseUrl?: string }
): string {
  if (!url) {
    return '/placeholder-product.jpg';
  }

  // Если URL уже полный, возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  // Для /uploads/ путей на проде возвращаем относительный путь
  // Nginx раздаст файлы напрямую из /var/www/uploads/ без проксирования через Next.js
  // Это работает быстрее и надежнее
  if (cleanUrl.startsWith('/uploads/')) {
    // Если задан NEXT_PUBLIC_IMAGE_BASE_URL, используем его
    const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
    if (imageBase) {
      return `${imageBase.replace(/\/$/, '')}${cleanUrl}`;
    }
    
    // На клиенте: для продакшена формируем полный URL, для dev - относительный
    if (typeof window !== 'undefined') {
      const isProduction = process.env.NODE_ENV === 'production';
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // В продакшене всегда формируем полный URL для надежности
      if (isProduction && !isLocalhost) {
        return `${window.location.origin}${cleanUrl}`;
      }
      
      // В dev режиме возвращаем относительный путь
      return cleanUrl;
    }
    
    // На сервере в API: если передан baseUrl (из request origin), используем его
    // Это нужно для localhost и других случаев, когда нужен полный URL
    if (options?.baseUrl) {
      // Проверяем, это localhost или dev режим - формируем полный URL
      const isLocalhost = options.baseUrl.includes('localhost') || options.baseUrl.includes('127.0.0.1');
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isLocalhost || isDevelopment) {
        // Для localhost/dev всегда формируем полный URL
        return `${options.baseUrl.replace(/\/$/, '')}${cleanUrl}`;
      }
      
      // В продакшене тоже формируем полный URL для надежности
      return `${options.baseUrl.replace(/\/$/, '')}${cleanUrl}`;
    }
    
    // На сервере без baseUrl: в продакшене используем NEXT_PUBLIC_BASE_URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (baseUrl && process.env.NODE_ENV === 'production') {
      return `${baseUrl.replace(/\/$/, '')}${cleanUrl}`;
    }
    
    // Fallback: возвращаем относительный путь
    return cleanUrl;
  }

  // Для других путей (не /uploads/) формируем полный URL
  let baseUrl = options?.baseUrl;
  if (!baseUrl) {
    // На сервере используем переменную окружения, на клиенте - window.location.origin
    if (typeof window !== 'undefined') {
      baseUrl = window.location.origin;
    } else {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    }
  }

  return `${baseUrl.replace(/\/$/, '')}${cleanUrl}`;
}

