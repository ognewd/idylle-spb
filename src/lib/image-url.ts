/**
 * Преобразует относительные пути изображений в полные URL.
 * В API можно передать baseUrl из request (origin), чтобы в каталоге картинки не вели на localhost.
 */
export function getImageUrl(
  url: string | null | undefined,
  options?: { baseUrl?: string }
): string {
  if (!url) {
    return '/placeholder-product.jpg';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanUrl = url.startsWith('/') ? url : `/${url}`;

  const imageBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (imageBase && cleanUrl.startsWith('/uploads/')) {
    return `${imageBase.replace(/\/$/, '')}${cleanUrl}`;
  }

  let baseUrl = options?.baseUrl;
  if (!baseUrl) {
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    if (typeof window !== 'undefined') {
      baseUrl = window.location.origin;
    }
  }

  return `${baseUrl.replace(/\/$/, '')}${cleanUrl}`;
}

