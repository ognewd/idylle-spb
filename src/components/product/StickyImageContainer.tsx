'use client';

import { useEffect, useRef, useState } from 'react';
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
  const stickyRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateStickyConstraints = () => {
      const contentContainer = document.getElementById(contentContainerId);
      const stickyElement = stickyRef.current;
      const wrapperElement = wrapperRef.current;

      if (!contentContainer || !stickyElement || !wrapperElement) return;

      // Получаем позицию правого контейнера относительно viewport
      const contentRect = contentContainer.getBoundingClientRect();
      const stickyRect = stickyElement.getBoundingClientRect();

      // Вычисляем максимальную высоту viewport для sticky элемента
      // Стicky должен останавливаться когда нижняя граница изображения
      // достигает нижней границы правого контента
      const viewportHeight = window.innerHeight;
      
      // Вычисляем нижнюю границу правого контента
      const contentBottom = contentRect.bottom;
      
      // Вычисляем доступную высоту для sticky элемента
      // Учитываем отступ от верха (headerOffset) и отступ снизу (padding)
      const availableHeight = contentBottom - headerOffset - 32; // 32px для padding снизу
      
      // Устанавливаем max-height для wrapper, чтобы ограничить sticky
      // Используем min() чтобы не превысить высоту viewport
      const maxHeight = Math.min(availableHeight, viewportHeight - headerOffset - 32);
      
      if (maxHeight > 0) {
        wrapperElement.style.maxHeight = `${maxHeight}px`;
      }
    };

    // Используем requestAnimationFrame для плавных обновлений при скролле
    let rafId: number;
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateStickyConstraints);
    };

    // Обновляем при монтировании и изменении размера
    updateStickyConstraints();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateStickyConstraints);
    
    // Используем ResizeObserver для отслеживания изменений размеров контента
    const resizeObserver = new ResizeObserver(() => {
      updateStickyConstraints();
    });
    
    const contentContainer = document.getElementById(contentContainerId);
    if (contentContainer) {
      resizeObserver.observe(contentContainer);
    }
    if (stickyRef.current) {
      resizeObserver.observe(stickyRef.current);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateStickyConstraints);
      resizeObserver.disconnect();
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [contentContainerId, headerOffset]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "space-y-4",
        "lg:overflow-hidden", // Предотвращаем выход за границы
        className
      )}
    >
      <div
        ref={stickyRef}
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
