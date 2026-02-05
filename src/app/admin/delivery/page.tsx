'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, Loader2, CheckCircle, XCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AdminDeliveryPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({ clientId: '', clientSecret: '' });
  const [editable, setEditable] = useState({ clientId: '', clientSecret: '' });
  const [dadataSettings, setDadataSettings] = useState({ apiKey: '', secret: '' });
  const [dadataEditable, setDadataEditable] = useState({ apiKey: '', secret: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dadataSaving, setDadataSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDadataEditing, setIsDadataEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchSettings();
    fetchDadataSettings();
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

  const fetchDadataSettings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/dadata', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setDadataSettings(data.settings);
        setDadataEditable(data.settings);
      }
    } catch {
      // тихо игнорируем, DaData опциональны
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

  const handleDadataSave = async () => {
    try {
      setDadataSaving(true);
      setMessage(null);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/dadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save-settings',
          settings: {
            apiKey: dadataEditable.apiKey,
            secret: dadataEditable.secret === '******' ? '' : dadataEditable.secret,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Настройки DaData сохранены' });
        setIsDadataEditing(false);
        fetchDadataSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка сохранения' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Ошибка сохранения' });
    } finally {
      setDadataSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Доставка и адреса</h1>
          <p className="text-muted-foreground">
            Учётные данные СДЕК (города, расчёт доставки) и DaData (подсказки адресов). Можно задать здесь или в переменных окружения.
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Учётные данные DaData
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span>API Key и Secret для подсказок адресов на чекауте (подсказки по улице и дому в выбранном городе)</span>
            <Button
              variant={isDadataEditing ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => {
                if (isDadataEditing) {
                  setIsDadataEditing(false);
                  setDadataEditable(dadataSettings);
                } else {
                  setIsDadataEditing(true);
                }
              }}
            >
              {isDadataEditing ? 'Отмена' : 'Изменить'}
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>API Key</Label>
            <Input
              value={isDadataEditing ? dadataEditable.apiKey : dadataSettings.apiKey}
              disabled={!isDadataEditing}
              onChange={(e) => setDadataEditable((p) => ({ ...p, apiKey: e.target.value }))}
              placeholder="Укажите DaData API Key"
            />
          </div>
          <div>
            <Label>Secret</Label>
            <Input
              type="password"
              value={isDadataEditing ? dadataEditable.secret : dadataSettings.secret}
              disabled={!isDadataEditing}
              onChange={(e) => setDadataEditable((p) => ({ ...p, secret: e.target.value }))}
              placeholder={dadataSettings.secret ? '******' : 'Укажите DaData Secret'}
            />
            {dadataSettings.secret === '******' && !isDadataEditing && (
              <p className="text-sm text-muted-foreground mt-1">Секрет сохранён; для смены нажмите «Изменить» и введите новый.</p>
            )}
          </div>
          {isDadataEditing && (
            <Button onClick={handleDadataSave} disabled={dadataSaving}>
              {dadataSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить'
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
