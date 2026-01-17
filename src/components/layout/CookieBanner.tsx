'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Не показывать на админ-страницах
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // 2. Проверяем, является ли пользователь админом (через admin_token)
    const adminToken = localStorage.getItem('admin_token');
    if (adminToken) {
      try {
        // Декодируем JWT токен
        const payload = JSON.parse(atob(adminToken.split('.')[1]));
        // Если роль admin или super_admin - не показывать баннер
        if (payload.role === 'admin' || payload.role === 'super_admin') {
          return;
        }
      } catch (error) {
        // Если не удалось декодировать токен - продолжаем проверку
        console.error('Error decoding admin token:', error);
      }
    }

    // 3. Проверяем, дал ли пользователь согласие ранее
    const cookieConsent = localStorage.getItem('cookie_consent');
    if (cookieConsent === 'accepted' || cookieConsent === 'declined') {
      // Пользователь уже дал ответ - не показывать
      return;
    }

    // Если все проверки пройдены - показываем баннер с задержкой
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cookie_consent', 'accepted');
      localStorage.setItem('cookie_consent_date', new Date().toISOString());
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-black/85 backdrop-blur-sm rounded-lg shadow-2xl p-4 text-white">
        <p className="text-sm leading-relaxed mb-3">
          Мы используем файлы cookie и рекомендательные технологии, чтобы сайт работал лучше. 
          Оставаясь с нами, вы соглашаетесь на{' '}
          <Link 
            href="/cookies" 
            className="text-blue-400 hover:text-blue-300 underline"
          >
            использование файлов cookie.
          </Link>
        </p>
        <Button
          onClick={handleAccept}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
        >
          ХОРОШО
        </Button>
      </div>
    </div>
  );
}
