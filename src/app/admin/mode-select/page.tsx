'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PanelMode } from '@/lib/panel-roles';

const modeLabels: Record<PanelMode, { title: string; description: string }> = {
  admin: {
    title: 'Режим администратора',
    description: 'Управление сайтом и всеми разделами админ-панели',
  },
  partner: {
    title: 'Режим партнера',
    description: 'Управление брендами партнера, импортом и статистикой',
  },
  dealer: {
    title: 'Режим дилера',
    description: 'Оптовый кабинет дилера: товары, цены, заказы',
  },
};

export default function AdminModeSelectPage() {
  const router = useRouter();
  const [loadingMode, setLoadingMode] = useState<PanelMode | null>(null);
  const [error, setError] = useState('');
  const [availableModes, setAvailableModes] = useState<PanelMode[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const modes = Array.isArray(payload.availableModes) ? payload.availableModes : [];
      if (modes.length <= 1) {
        router.push('/admin');
        return;
      }
      setAvailableModes(modes);
    } catch {
      localStorage.removeItem('admin_token');
      router.push('/admin/login');
    }
  }, [router]);

  const modeCards = useMemo(() => availableModes.filter((m) => m in modeLabels), [availableModes]);

  const pickMode = async (mode: PanelMode) => {
    setLoadingMode(mode);
    setError('');
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) throw new Error('Нет токена');
      const response = await fetch('/api/admin/mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Не удалось выбрать режим');
      }
      localStorage.setItem('admin_token', data.token);
      router.push('/admin');
    } catch (e: any) {
      setError(e?.message || 'Не удалось выбрать режим');
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Выберите режим работы</CardTitle>
            <CardDescription>
              Для вашего аккаунта доступно несколько режимов. Выберите, с чем хотите работать сейчас.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {modeCards.map((mode) => (
              <div key={mode} className="rounded-lg border p-4">
                <h3 className="text-base font-semibold">{modeLabels[mode].title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{modeLabels[mode].description}</p>
                <div className="mt-3">
                  <Button onClick={() => pickMode(mode)} disabled={loadingMode !== null}>
                    {loadingMode === mode ? 'Переключаем...' : 'Выбрать'}
                  </Button>
                </div>
              </div>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

