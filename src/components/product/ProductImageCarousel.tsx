'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/image-url';

interface ProductImageCarouselProps {
  images: string[];
  name: string;
  className?: string;
}

export function ProductImageCarousel({ images, name, className }: ProductImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

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
      {/* Main Image — компактный блок под пропорции фото, без лишнего спейса */}
      <div className="relative bg-white overflow-visible group flex items-center justify-center min-h-[240px] max-h-[420px] w-full">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={getImageUrl(images[currentIndex])}
            alt={`${name} - изображение ${currentIndex + 1}`}
            className="max-w-full max-h-[380px] w-auto h-auto object-contain"
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
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
          onClick={() => setIsZoomed(true)}
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

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={getImageUrl(images[currentIndex])}
              alt={`${name} - увеличенное изображение`}
              width={800}
              height={800}
              className="object-contain max-h-[80vh] max-w-full"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setIsZoomed(false)}
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
