'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDeliveryPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ clientId: '', clientSecret: '' });
  const [editable, setEditable] = useState({ clientId: '', clientSecret: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/cdek', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setEditable(data.settings);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Не удалось загрузить настройки' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/cdek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save-settings',
          settings: {
            clientId: editable.clientId,
            clientSecret: editable.clientSecret === '******' ? '' : editable.clientSecret,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Настройки СДЕК сохранены' });
        setIsEditing(false);
        fetchSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка сохранения' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Ошибка сохранения' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Доставка СДЕК</h1>
          <p className="text-muted-foreground">
            Учётные данные для API СДЕК (автокомплит городов, расчёт доставки). Можно задать здесь или в переменных окружения.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin">В админку</Link>
        </Button>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Учётные данные СДЕК
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>Client ID и Client Secret из личного кабинета СДЕК</span>
            <Button
              variant={isEditing ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setEditable(settings);
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? 'Отмена' : 'Изменить'}
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <div>
                <Label>Client ID</Label>
                <Input
                  value={isEditing ? editable.clientId : settings.clientId}
                  disabled={!isEditing}
                  onChange={(e) => setEditable((p) => ({ ...p, clientId: e.target.value }))}
                  placeholder="Укажите CDEK Client ID"
                />
              </div>
              <div>
                <Label>Client Secret</Label>
                <Input
                  type="password"
                  value={isEditing ? editable.clientSecret : settings.clientSecret}
                  disabled={!isEditing}
                  onChange={(e) => setEditable((p) => ({ ...p, clientSecret: e.target.value }))}
                  placeholder={settings.clientSecret ? '******' : 'Укажите CDEK Client Secret'}
                />
                {settings.clientSecret === '******' && !isEditing && (
                  <p className="text-sm text-muted-foreground mt-1">Секрет сохранён; для смены нажмите «Изменить» и введите новый.</p>
                )}
              </div>
              {isEditing && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    'Сохранить'
                  )}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
