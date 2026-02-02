'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle, XCircle, LogIn, UserPlus, ShoppingCart, Mail } from 'lucide-react';
import Link from 'next/link';

type EndpointKey = 'adminLogin' | 'register' | 'orders' | 'newsletter';

interface EndpointConfig {
  windowMinutes: number;
  max: number;
}

const CONFIG_LABELS: Record<EndpointKey, { title: string; description: string; icon: React.ElementType }> = {
  adminLogin: {
    title: 'Вход в админку',
    description: 'Лимит попыток входа по IP',
    icon: LogIn,
  },
  register: {
    title: 'Регистрация',
    description: 'Лимит регистраций по IP',
    icon: UserPlus,
  },
  orders: {
    title: 'Оформление заказов',
    description: 'Лимит создания заказов по IP',
    icon: ShoppingCart,
  },
  newsletter: {
    title: 'Подписка на рассылку',
    description: 'Лимит подписок по IP',
    icon: Mail,
  },
};

const defaultConfig: Record<EndpointKey, EndpointConfig> = {
  adminLogin: { windowMinutes: 1, max: 5 },
  register: { windowMinutes: 15, max: 5 },
  orders: { windowMinutes: 1, max: 15 },
  newsletter: { windowMinutes: 1, max: 5 },
};

export default function AdminRateLimitPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Record<EndpointKey, EndpointConfig>>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchConfig();
  }, [router]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/rate-limit', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.config) {
        setConfig((prev) => ({ ...prev, ...data.config }));
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Не удалось загрузить настройки' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: EndpointKey, field: 'windowMinutes' | 'max', value: number) => {
    setConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/admin/rate-limit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...config }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Настройки сохранены' });
        if (data.config) setConfig((prev) => ({ ...prev, ...data.config }));
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
          <h1 className="text-3xl font-bold mb-2">Настройки безопасности</h1>
          <p className="text-muted-foreground">
            Лимиты по IP для входа в админку, регистрации, заказов и подписки на рассылку. При превышении возвращается 429.
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
            <Shield className="h-5 w-5" />
            Ограничение запросов (Rate limit)
          </CardTitle>
          <CardDescription>
            Окно — период в минутах; макс. запросов — сколько запросов с одного IP разрешено за это окно.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {(Object.keys(CONFIG_LABELS) as EndpointKey[]).map((key) => {
                const { title, description, icon: Icon } = CONFIG_LABELS[key];
                const c = config[key];
                return (
                  <div key={key} className="flex flex-wrap items-end gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="space-y-1">
                        <Label className="text-xs">Окно (мин)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={1440}
                          value={c.windowMinutes}
                          onChange={(e) => handleChange(key, 'windowMinutes', Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-24"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Макс. запросов</Label>
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          value={c.max}
                          onChange={(e) => handleChange(key, 'max', Math.max(1, Math.min(1000, parseInt(e.target.value, 10) || 1)))}
                          className="w-24"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
