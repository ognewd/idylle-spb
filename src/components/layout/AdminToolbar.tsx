'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, LogOut, PanelLeft } from 'lucide-react';

export function AdminToolbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLabel, setAdminLabel] = useState<string>('Администратор');

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      if (token) {
        setIsAdmin(true);
        // попытка извлечь имя/email из JWT без верификации
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const name = payload?.name || payload?.email || payload?.userEmail || payload?.userId;
            if (name) setAdminLabel(String(name));
          }
        } catch {
          // ignore decode errors
        }
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="w-full bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-10 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Вы вошли как администратор:</span>
            <span className="font-medium">{adminLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors px-3 py-1"
              title="Открыть админ‑панель"
            >
              <PanelLeft className="h-4 w-4" />
              В админку
            </Link>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('admin_token');
                  window.location.reload();
                } catch {}
              }}
              className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors px-3 py-1"
              title="Выйти из админ‑режима"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


