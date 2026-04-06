'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-url';
import { ImageLightbox } from './ImageLightbox';

const SWIPE_THRESHOLD = 50;

interface ProductImageCarouselProps {
  images: string[];
  name: string;
  className?: string;
}

export function ProductImageCarousel({ images, name, className }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchCurrentX = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || images.length <= 1) return;
    const onMove = (e: TouchEvent) => {
      touchCurrentX.current = e.touches[0].clientX;
      const deltaX = Math.abs(touchCurrentX.current - touchStartX.current);
      if (deltaX > 10) e.preventDefault();
    };
    el.addEventListener('touchmove', onMove, { passive: false });
    return () => el.removeEventListener('touchmove', onMove);
  }, [images.length]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    const deltaX = touchCurrentX.current - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD) prevImage();
    else if (deltaX < -SWIPE_THRESHOLD) nextImage();
  }, [prevImage, nextImage]);

  if (images.length === 0) {
    return (
      <div className={cn('flex min-h-[240px] max-h-[320px] items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 backdrop-blur-sm', className)}>
        <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <ImageIcon className="h-20 w-20 opacity-50" />
          <p className="text-lg text-center px-4">Изображение еще не добавлено</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image — свайп на мобильном листает фото, не скроллит страницу */}
      <div
        ref={containerRef}
        className="group relative flex min-h-[240px] max-h-[420px] w-full items-center justify-center overflow-visible"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="relative w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex min-h-[220px] items-center justify-center p-2 sm:min-h-[280px] sm:p-4">
            <img
              src={getImageUrl(images[currentIndex])}
              alt={`${name} - изображение ${currentIndex + 1}`}
              className="max-h-[380px] w-auto max-w-full object-contain"
            />
          </div>

        {/* Navigation Arrows — на мобильном видны всегда (нет hover), на десктопе по hover */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 border border-white/40 bg-white/90 opacity-100 shadow-xl backdrop-blur-md transition-all hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 z-10 h-10 w-10 -translate-y-1/2 border border-white/40 bg-white/90 opacity-100 shadow-xl backdrop-blur-md transition-all hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Zoom Button */}
        <Button
          variant="secondary"
          size="icon"
          aria-label="Увеличить фото"
          className="absolute right-2 top-2 z-10 border border-white/40 bg-white/90 opacity-0 shadow-lg backdrop-blur-md transition-opacity hover:bg-white group-hover:opacity-100"
          onClick={() => setIsLightboxOpen(true)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToImage(index)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-neutral-50 transition-all duration-200',
                index === currentIndex
                  ? 'border-neutral-900 shadow-sm'
                  : 'border-neutral-200 opacity-90 hover:border-neutral-400 hover:opacity-100'
              )}
            >
              <img
                src={getImageUrl(image)}
                alt={`${name} - миниатюра ${index + 1}`}
                className="h-full w-full object-contain p-0.5"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox для полноэкранного просмотра изображения */}
      {images.length > 0 && (
        <ImageLightbox
          images={images}
          currentIndex={currentIndex}
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          productName={name}
        />
      )}
    </div>
  );
}
