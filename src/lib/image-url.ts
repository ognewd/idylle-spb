/**
 * Преобразует относительные пути изображений в полные URL
 * для работы с Next.js Image Optimization
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '/placeholder-product.jpg';
  }

  // Если уже полный URL (http:// или https://), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Если относительный путь, добавляем базовый URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Убираем ведущий слеш, если есть, и добавляем к baseUrl
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${cleanUrl}`;
}

