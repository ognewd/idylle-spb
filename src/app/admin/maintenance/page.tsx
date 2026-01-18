'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Calendar, Clock, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function MaintenancePage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [maintenanceTime, setMaintenanceTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/maintenance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEnabled(data.enabled ?? false);
        
        if (data.maintenanceDate) {
          // Парсим дату и время из ISO строки
          const date = new Date(data.maintenanceDate);
          const dateStr = date.toISOString().split('T')[0];
          const timeStr = date.toTimeString().slice(0, 5); // HH:MM
          setMaintenanceDate(dateStr);
          setMaintenanceTime(timeStr);
        }
      }
    } catch (error) {
      console.error('Error loading maintenance settings:', error);
      setMessage({ type: 'error', text: 'Ошибка загрузки настроек' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('admin_token');
      
      // Формируем дату и время в ISO формате
      let dateTimeString: string | null = null;
      if (maintenanceDate && maintenanceTime) {
        const dateTime = new Date(`${maintenanceDate}T${maintenanceTime}:00`);
        dateTimeString = dateTime.toISOString();
      } else if (maintenanceDate) {
        // Если указана только дата, устанавливаем время 00:00
        const dateTime = new Date(`${maintenanceDate}T00:00:00`);
        dateTimeString = dateTime.toISOString();
      }

      const response = await fetch('/api/admin/maintenance', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled,
          maintenanceDate: dateTimeString,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Настройки сохранены' });
        // Очищаем сообщение через 3 секунды
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Ошибка при сохранении' });
      }
    } catch (error) {
      console.error('Error saving maintenance settings:', error);
      setMessage({ type: 'error', text: 'Ошибка при сохранении настроек' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateForDisplay = (dateStr: string, timeStr: string): string => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(`${dateStr}T${timeStr || '00:00'}:00`);
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      };
      const dateFormatted = date.toLocaleDateString('ru-RU', options);
      const timeFormatted = timeStr ? `, ${timeStr}` : '';
      return `${dateFormatted}${timeFormatted}`;
    } catch (error) {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wrench className="h-8 w-8 text-orange-500" />
            Режим обслуживания
          </h1>
          <p className="text-gray-600 mt-2">
            Управление режимом обслуживания сайта и отображением страницы "Сайт в разработке"
          </p>
        </div>

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Настройки режима обслуживания</CardTitle>
            <CardDescription>
              Включите режим обслуживания, чтобы показать пользователям страницу "Сайт в разработке"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Переключатель включения/выключения */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${enabled ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <Wrench className={`h-5 w-5 ${enabled ? 'text-orange-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <Label htmlFor="maintenance-toggle" className="text-lg font-semibold cursor-pointer">
                    Режим обслуживания
                  </Label>
                  <p className="text-sm text-gray-600">
                    {enabled 
                      ? 'Активирован - пользователи видят страницу "Сайт в разработке"' 
                      : 'Выключен - сайт работает в обычном режиме'}
                  </p>
                </div>
              </div>
              <Switch
                id="maintenance-toggle"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
            </div>

            {/* Дата и время */}
            {enabled && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <Label className="text-lg font-semibold">Планируемое открытие</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maintenance-date" className="mb-2 block">
                      Дата
                    </Label>
                    <Input
                      id="maintenance-date"
                      type="date"
                      value={maintenanceDate}
                      onChange={(e) => setMaintenanceDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="maintenance-time" className="mb-2 block">
                      Время
                    </Label>
                    <Input
                      id="maintenance-time"
                      type="time"
                      value={maintenanceTime}
                      onChange={(e) => setMaintenanceTime(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Предварительный просмотр */}
                {maintenanceDate && (
                  <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Будет отображаться как:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDateForDisplay(maintenanceDate, maintenanceTime)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Кнопка сохранения */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
              size="lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Сохранить настройки
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
