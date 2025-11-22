'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, CheckCircle2, XCircle } from 'lucide-react';

export default function GoogleOAuthPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Получаем текущие значения из .env.local (только для чтения)
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const envClientSecret = '***'; // Секреты не должны отображаться

    setClientId(envClientId);
    setClientSecret(envClientSecret);
    setIsLoading(false);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setAlert(null);

    try {
      // В реальном приложении здесь бы был API endpoint для обновления .env
      // Сейчас просто показываем инструкции

      setAlert({
        type: 'success',
        message: 'Инструкции для обновления настроек отправлены в консоль'
      });

      console.log(`
╔══════════════════════════════════════════════════════════════╗
║           ИНСТРУКЦИЯ: Обновление Google OAuth                  ║
╚══════════════════════════════════════════════════════════════╝

1. Откройте файл .env.local в корне проекта

2. Найдите и обновите следующие строки:
   GOOGLE_CLIENT_ID=${clientId}
   GOOGLE_CLIENT_SECRET=<ваш_client_secret>

3. Сохраните файл

4. Перезапустите dev сервер:
   pkill -f "next dev" && npm run dev

5. Для production (Vercel):
   - Перейдите в Vercel Dashboard
   - Settings → Environment Variables
   - Обновите GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET

⚠️ ВАЖНО:
- Never commit .env files to Git!
- Restart the server after changing environment variables
      `);

      setTimeout(() => setAlert(null), 5000);
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Произошла ошибка при сохранении'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-blue-500 mr-3 w-10 h-10 flex items-center justify-center">
                <span className="text-lg font-bold text-white">G</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Google OAuth</h1>
                <p className="text-gray-600">Настройка авторизации через Google</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {alert && (
          <Alert className={`mb-6 ${alert.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center">
              {alert.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 mr-2 text-red-600" />
              )}
              <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {alert.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Текущие настройки</CardTitle>
            <CardDescription>
              Управление учетными данными Google OAuth приложения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="1008088044099-xxxxx.apps.googleusercontent.com"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                Google Cloud Console → APIs & Services → Credentials
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="GOCSPX-xxxxx"
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                Безопасность: секрет не отображается для просмотра
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📍 Redirect URI</h3>
              <code className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded">
                {typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback/google` : ''}
              </code>
              <p className="text-sm text-blue-700 mt-2">
                Добавьте этот URI в Google Cloud Console → Authorized redirect URIs
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin')}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading || !clientId}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
