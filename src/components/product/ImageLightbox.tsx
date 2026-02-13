'use client';

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/lib/image-url';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: Array<{ url: string; alt?: string }> | string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export function ImageLightbox({ images, currentIndex: initialIndex, isOpen, onClose, productName = '' }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Нормализуем изображения
  const normalizedImages = images.map((img: any) => {
    if (typeof img === 'string') {
      return { url: getImageUrl(img), alt: productName };
    }
    return { url: getImageUrl(img.url || img), alt: img.alt || productName };
  });

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : normalizedImages.length - 1));
  }, [normalizedImages.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < normalizedImages.length - 1 ? prev + 1 : 0));
  }, [normalizedImages.length]);

  // Блокируем прокрутку и скрываем все элементы при открытии
  useEffect(() => {
    if (!isOpen) return;
    
    // Сохраняем текущую позицию прокрутки
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    // Сохраняем оригинальные inline стили body для восстановления
    const originalBodyStyle = {
      position: document.body.style.position || '',
      top: document.body.style.top || '',
      left: document.body.style.left || '',
      width: document.body.style.width || '',
    };
    
    // Устанавливаем position: fixed для блокировки прокрутки
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = `-${scrollX}px`;
    document.body.style.width = '100%';
    
    // Добавляем CSS класс для скрытия элементов и блокировки прокрутки
    document.body.classList.add('image-lightbox-open');
    document.documentElement.classList.add('image-lightbox-open');
    
    // Обработчик клавиатуры для навигации и закрытия
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
        // Блокируем клавиши прокрутки
        e.preventDefault();
      }
    };
    
    // Блокируем прокрутку через wheel и touch
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    // Добавляем обработчики только на window (достаточно для блокировки)
    const options = { capture: true, passive: false };
    window.addEventListener('keydown', handleKeyDown, options);
    window.addEventListener('wheel', handleWheel, options);
    window.addEventListener('touchmove', handleTouchMove, options);
    
    return () => {
      // Удаляем обработчики
      window.removeEventListener('keydown', handleKeyDown, options);
      window.removeEventListener('wheel', handleWheel, options);
      window.removeEventListener('touchmove', handleTouchMove, options);
      
      // Удаляем CSS классы - элементы покажутся автоматически через CSS
      document.body.classList.remove('image-lightbox-open');
      document.documentElement.classList.remove('image-lightbox-open');
      
      // Восстанавливаем оригинальные стили body
      if (originalBodyStyle.position) {
        document.body.style.position = originalBodyStyle.position;
      } else {
        document.body.style.removeProperty('position');
      }
      if (originalBodyStyle.top) {
        document.body.style.top = originalBodyStyle.top;
      } else {
        document.body.style.removeProperty('top');
      }
      if (originalBodyStyle.left) {
        document.body.style.left = originalBodyStyle.left;
      } else {
        document.body.style.removeProperty('left');
      }
      if (originalBodyStyle.width) {
        document.body.style.width = originalBodyStyle.width;
      } else {
        document.body.style.removeProperty('width');
      }
      
      // Восстанавливаем позицию прокрутки
      requestAnimationFrame(() => {
        window.scrollTo(scrollX, scrollY);
      });
    };
  }, [isOpen, goToPrevious, goToNext, onClose]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || normalizedImages.length === 0 || !mounted) return null;

  const lightboxContent = (
    <div
      data-lightbox="true"
      className="fixed inset-0 bg-black flex items-center justify-center"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        touchAction: 'none',
        overscrollBehavior: 'none',
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.98)',
        margin: 0,
        padding: 0,
      }}
    >
      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[201] p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        aria-label="Закрыть"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Навигация по изображениям */}
      {normalizedImages.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[201] p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Предыдущее изображение"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[201] p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Следующее изображение"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Индикатор текущего изображения */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[201] px-4 py-2 rounded-full bg-black/50 text-white text-sm">
            {currentIndex + 1} / {normalizedImages.length}
          </div>
        </>
      )}

      {/* Изображение */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={normalizedImages[currentIndex]?.url}
          alt={normalizedImages[currentIndex]?.alt || productName}
          className="max-w-full max-h-[90vh] object-contain"
          style={{
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-product.jpg';
          }}
        />
      </div>

      {/* Миниатюры внизу (если больше одного изображения) */}
      {normalizedImages.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[201] flex gap-2 px-4">
          {normalizedImages.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                "w-16 h-16 rounded overflow-hidden border-2 transition-all",
                index === currentIndex
                  ? "border-white scale-110"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img
                src={image.url}
                alt={image.alt || `${productName} - миниатюра ${index + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Используем Portal для рендеринга вне основной структуры DOM
  return createPortal(lightboxContent, document.body);
}
