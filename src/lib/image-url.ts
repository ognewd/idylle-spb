/**
 * Преобразует относительные пути изображений в полные URL
 * для работы с Next.js Image Optimization.
 * В dev при NEXT_PUBLIC_IMAGE_BASE_URL картинки из /uploads/ грузятся с прода.
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '/placeholder-product.jpg';
  }

  // Если уже полный URL (http:// или https://), возвращаем как есть
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  // Для путей из /uploads/ в dev можно грузить с прода (картинки не копируются при клонировании БД)
  const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (imageBase && cleanUrl.startsWith('/uploads/')) {
    return `${imageBase.replace(/\/$/, '')}${cleanUrl}`;
  }

  // Обычный базовый URL приложения
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  if (typeof window !== 'undefined') {
    baseUrl = window.location.origin;
  }

  return `${baseUrl}${cleanUrl}`;
}

