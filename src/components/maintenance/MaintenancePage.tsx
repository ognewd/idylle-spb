'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Calendar } from 'lucide-react';

export function MaintenancePage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean>(false);
  const [maintenanceDate, setMaintenanceDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const maintenanceEnabledRef = useRef<boolean>(false);

  useEffect(() => {
    // Проверяем, есть ли токен админа
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const admin = !!adminToken;
    setIsAdmin(admin);
    
    // Загружаем настройки режима обслуживания
    loadMaintenanceSettings();
    
    // Периодически проверяем настройки (каждые 5 секунд)
    const interval = setInterval(() => {
      loadMaintenanceSettings();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [pathname]);

  const loadMaintenanceSettings = async () => {
    try {
      // Добавляем timestamp для предотвращения кеширования
      const response = await fetch(`/api/maintenance?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const newEnabled = data.enabled ?? false;
        const prevEnabled = maintenanceEnabledRef.current;
        
        console.log('[MaintenancePage] Settings loaded:', {
          enabled: newEnabled,
          maintenanceDate: data.maintenanceDate,
          prevEnabled,
          isAdmin,
          pathname,
        });
        
        maintenanceEnabledRef.current = newEnabled;
        setMaintenanceEnabled(newEnabled);
        setMaintenanceDate(data.maintenanceDate || null);
        
        // Обновляем класс body для управления видимостью контента
        if (typeof window !== 'undefined') {
          const adminToken = localStorage.getItem('admin_token');
          const admin = !!adminToken;
          
          // Управляем классом maintenance-mode
          if (newEnabled) {
            document.body.classList.add('maintenance-mode');
          } else {
            document.body.classList.remove('maintenance-mode');
          }
          
          // Управляем классом admin-visible
          if (admin || pathname?.startsWith('/admin')) {
            document.body.classList.add('admin-visible');
          } else {
            document.body.classList.remove('admin-visible');
          }
        }
        
        // Если режим обслуживания выключен, но мы его показывали - перезагружаем страницу
        if (!newEnabled && prevEnabled) {
          window.location.reload();
        }
      } else {
        console.error('[MaintenancePage] Failed to load settings:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('[MaintenancePage] Error loading maintenance settings:', error);
      // По умолчанию режим обслуживания выключен
      const newEnabled = false;
      maintenanceEnabledRef.current = newEnabled;
      setMaintenanceEnabled(newEnabled);
    } finally {
      setIsLoading(false);
    }
  };

  // Если проверка еще идет, показываем заглушку только если режим уже включен
  if (isAdmin === null || isLoading) {
    // Во время загрузки не показываем ничего, чтобы избежать мигания
    return null;
  }

  // Если режим обслуживания выключен - не показываем заглушку
  if (!maintenanceEnabled) {
    return null;
  }

  // Если админ или находимся на странице админки - не показываем заглушку
  if (isAdmin || pathname?.startsWith('/admin')) {
    return null;
  }

  console.log('[MaintenancePage] Rendering maintenance page', {
    maintenanceEnabled,
    isAdmin,
    pathname,
  });

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Blurred city background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%), 
                           url("data:image/svg+xml,%3Csvg width='1920' height='1080' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23475569;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23233446;stop-opacity:1' /%3E%3C/linearGradient%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='15'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grad)'/%3E%3Cg filter='url(%23blur)'%3E%3Cpath d='M0,800 L200,750 L400,700 L600,720 L800,680 L1000,700 L1200,680 L1400,700 L1600,720 L1800,700 L1920,750 L1920,1080 L0,1080 Z' fill='%23344556' opacity='0.8'/%3E%3Crect x='100' y='600' width='80' height='150' fill='%23455667' opacity='0.9'/%3E%3Crect x='250' y='550' width='100' height='200' fill='%23455667' opacity='0.9'/%3E%3Crect x='400' y='580' width='90' height='170' fill='%23455667' opacity='0.9'/%3E%3Crect x='550' y='540' width='110' height='210' fill='%23455667' opacity='0.9'/%3E%3Crect x='720' y='570' width='85' height='180' fill='%23455667' opacity='0.9'/%3E%3Crect x='900' y='590' width='95' height='160' fill='%23455667' opacity='0.9'/%3E%3Crect x='1100' y='560' width='105' height='190' fill='%23455667' opacity='0.9'/%3E%3Crect x='1300' y='550' width='90' height='200' fill='%23455667' opacity='0.9'/%3E%3Crect x='1500' y='580' width='100' height='170' fill='%23455667' opacity='0.9'/%3E%3Crect x='1700' y='600' width='80' height='150' fill='%23455667' opacity='0.9'/%3E%3Ccircle cx='120' cy='650' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3Ccircle cx='270' cy='600' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3Ccircle cx='420' cy='630' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3Ccircle cx='570' cy='590' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3Ccircle cx='740' cy='620' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3Ccircle cx='920' cy='640' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3Ccircle cx='1120' cy='610' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3Ccircle cx='1320' cy='600' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3Ccircle cx='1520' cy='630' r='3' fill='%23fbbf24' opacity='0.6'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(25px)',
          backgroundBlendMode: 'overlay',
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
          
          {maintenanceDate && (
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-lg sm:text-xl text-white/80 mb-2">
                Планируемое открытие
              </p>
              <p className="text-2xl sm:text-3xl font-semibold text-white">
                {formatMaintenanceDate(maintenanceDate)}
              </p>
            </div>
          )}
          
          <div className="mt-8 text-sm text-white/60">
            Следите за обновлениями в наших социальных сетях
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// Функция для форматирования даты в русском формате
function formatMaintenanceDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    const dateFormatted = date.toLocaleDateString('ru-RU', options);
    
    // Добавляем время, если оно указано (не 00:00)
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours !== 0 || minutes !== 0) {
      const timeFormatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      return `${dateFormatted}, ${timeFormatted}`;
    }
    
    return dateFormatted;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}
