'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const [baseUrl, setBaseUrl] = useState('');
  
  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return (
    <>
      <nav 
        aria-label="breadcrumb" 
        className={cn(
          "flex items-center text-sm text-muted-foreground",
          "overflow-hidden", // Предотвращаем выход за границы
          "min-w-0 w-full", // Позволяет flex-элементам сжиматься и занимает всю ширину
          className
        )}
      >
        {/* Полная цепочка для десктопа (≥ 1024px) */}
        <div className="hidden lg:flex items-center space-x-1 min-w-0">
          {items.map((item, index) => (
            <div key={`full-${index}`} className="flex items-center flex-shrink-0">
              {index === 0 && item.label === 'Главная' ? (
                <Link
                  href={item.href}
                  className="flex items-center hover:text-foreground transition-colors flex-shrink-0"
                  aria-label={item.label}
                >
                  <Home className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "hover:text-foreground transition-colors",
                    index === items.length - 1 && "max-w-[300px] truncate" // Обрезаем последний элемент на десктопе если слишком длинный
                  )}
                >
                  {item.label}
                </Link>
              )}
              
              {index < items.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Упрощенная версия для мобильных (≤ 768px) */}
        <div className="flex lg:hidden items-center space-x-1 min-w-0 w-full">
          {items.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === items.length - 1;
            const isCategory = index === items.length - 2; // Предпоследний элемент - категория

            // Скрываем промежуточные элементы визуально, но оставляем в DOM для SEO
            if (!isFirst && !isCategory && !isLast) {
              return (
                <div key={`mobile-hidden-${index}`} className="sr-only">
                  <Link href={item.href} aria-label={item.label}>
                    {item.label}
                  </Link>
                  {index < items.length - 1 && <span aria-hidden="true"> / </span>}
                </div>
              );
            }

            return (
              <div 
                key={`mobile-${index}`} 
                className={cn(
                  "flex items-center flex-shrink-0",
                  isLast && "min-w-0 flex-1" // Последний элемент может сжиматься
                )}
              >
                {isFirst && item.label === 'Главная' ? (
                  <Link
                    href={item.href}
                    className="flex items-center hover:text-foreground transition-colors flex-shrink-0"
                    aria-label={item.label}
                  >
                    <Home className="h-4 w-4" />
                  </Link>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "hover:text-foreground transition-colors",
                      isLast && "truncate font-medium text-foreground", // Только последний элемент обрезается при достижении границы
                      !isLast && "flex-shrink-0" // Категория и другие элементы не сжимаются
                    )}
                    title={item.label} // Показываем полное название при hover
                  >
                    {item.label}
                  </Link>
                )}
                
                {index < items.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Структурированные данные для SEO (JSON-LD) */}
      {baseUrl && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                item: `${baseUrl}${item.href}`,
              })),
            }),
          }}
        />
      )}
    </>
  );
}
