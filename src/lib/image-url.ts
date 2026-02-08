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
    
    // На клиенте возвращаем относительный путь - браузер сам добавит origin
    if (typeof window !== 'undefined') {
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
    }
    
    // На проде (без baseUrl или с production baseUrl) возвращаем относительный путь
    // Nginx раздаст файлы напрямую
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

