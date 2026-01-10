'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

export function MaintenancePage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Проверяем, есть ли токен админа
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    setIsAdmin(!!adminToken);
  }, []);

  // Если проверка еще идет, не показываем ничего (или loading)
  if (isAdmin === null) {
    return null;
  }

  // Если админ - не показываем заглушку, скрываем основной контент только для не-админов
  if (isAdmin) {
    return null;
  }

  return (
    <>
      {/* Скрываем основной контент для не-админов */}
      <style jsx global>{`
        body > div > div.min-h-screen {
          display: none !important;
        }
      `}</style>
      
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Blurred city background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='1920' height='1080' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23475569;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23233446;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grad)'/%3E%3Cpath d='M0,800 L200,750 L400,700 L600,720 L800,680 L1000,700 L1200,680 L1400,700 L1600,720 L1800,700 L1920,750 L1920,1080 L0,1080 Z' fill='%23344556' opacity='0.6'/%3E%3Crect x='100' y='600' width='80' height='150' fill='%23455667'/%3E%3Crect x='250' y='550' width='100' height='200' fill='%23455667'/%3E%3Crect x='400' y='580' width='90' height='170' fill='%23455667'/%3E%3Crect x='550' y='540' width='110' height='210' fill='%23455667'/%3E%3Crect x='720' y='570' width='85' height='180' fill='%23455667'/%3E%3Crect x='900' y='590' width='95' height='160' fill='%23455667'/%3E%3Crect x='1100' y='560' width='105' height='190' fill='%23455667'/%3E%3Crect x='1300' y='550' width='90' height='200' fill='%23455667'/%3E%3Crect x='1500' y='580' width='100' height='170' fill='%23455667'/%3E%3Crect x='1700' y='600' width='80' height='150' fill='%23455667'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(20px)',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 sm:p-12 border border-white/20">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Сайт в разработке
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/90 mb-4 leading-relaxed">
            Мы готовим для вас что-то особенное
          </p>
          
          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-lg sm:text-xl text-white/80 mb-2">
              Планируемое открытие
            </p>
            <p className="text-2xl sm:text-3xl font-semibold text-white">
              14 февраля 2025
            </p>
          </div>
          
          <div className="mt-8 text-sm text-white/60">
            Следите за обновлениями в наших социальных сетях
          </div>
        </div>
      </div>
    </>
  );
}

