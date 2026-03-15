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
      <div className={cn("bg-muted rounded-lg flex items-center justify-center min-h-[240px] max-h-[320px]", className)}>
        <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
          <ImageIcon className="h-20 w-20 opacity-50" />
          <p className="text-lg text-center px-4">Изображение еще не добавлено</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Image — свайп на мобильном листает фото, не скроллит страницу */}
      <div
        ref={containerRef}
        className="relative bg-white overflow-visible group flex items-center justify-center min-h-[240px] max-h-[420px] w-full"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={getImageUrl(images[currentIndex])}
            alt={`${name} - изображение ${currentIndex + 1}`}
            className="max-w-full max-h-[380px] w-auto h-auto object-contain"
          />
        </div>

        {/* Navigation Arrows — на мобильном видны всегда (нет hover), на десктопе по hover */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
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
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsLightboxOpen(true)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 overflow-visible transition-opacity",
                index === currentIndex
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              <img
                src={getImageUrl(image)}
                alt={`${name} - миниатюра ${index + 1}`}
                className="w-full h-full"
                style={{ objectFit: 'contain' }}
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
