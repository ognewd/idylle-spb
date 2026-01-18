'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StickyImageContainerProps {
  children: React.ReactNode;
  contentContainerId?: string;
  headerOffset?: number;
  className?: string;
}

export function StickyImageContainer({ 
  children, 
  contentContainerId = 'product-info-container',
  headerOffset = 96, // Высота хедера (примерно 96px для sticky header)
  className 
}: StickyImageContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWrapperHeight = () => {
      const contentContainer = document.getElementById(contentContainerId);
      const wrapperElement = wrapperRef.current;

      if (!contentContainer || !wrapperElement) return;

      // Проверяем, находимся ли мы на десктопе (lg breakpoint и выше)
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

      if (!isDesktop) {
        // На мобильной версии не устанавливаем высоту - пусть контент определяет естественную высоту
        wrapperElement.style.height = 'auto';
        return;
      }

      // На десктопе получаем высоту правого контейнера
      const contentHeight = contentContainer.offsetHeight;
      
      // Устанавливаем высоту wrapper равной высоте правого контента
      // Это позволит sticky элементу останавливаться в конце правого контента
      wrapperElement.style.height = `${contentHeight}px`;
    };

    // Обновляем при монтировании и изменении размера
    updateWrapperHeight();
    
    window.addEventListener('resize', updateWrapperHeight);
    
    // Используем ResizeObserver для отслеживания изменений размеров контента
    const resizeObserver = new ResizeObserver(() => {
      updateWrapperHeight();
    });
    
    const contentContainer = document.getElementById(contentContainerId);
    if (contentContainer) {
      resizeObserver.observe(contentContainer);
    }

    // Небольшая задержка для первой инициализации (после рендера)
    const timeoutId = setTimeout(updateWrapperHeight, 100);

    return () => {
      window.removeEventListener('resize', updateWrapperHeight);
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [contentContainerId]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "space-y-4",
        className
      )}
    >
      <div
        className={cn(
          "lg:sticky lg:top-24 lg:self-start", // sticky только на десктопе
          "transition-all duration-200", // Плавные переходы
        )}
      >
        {children}
      </div>
    </div>
  );
}
