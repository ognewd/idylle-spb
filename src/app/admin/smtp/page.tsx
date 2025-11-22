'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function SMTPPage() {
  const [settings, setSettings] = useState({
    host: '',
    port: '',
    user: '',
    pass: '',
    from: '',
  });
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [sendTestLoading, setSendTestLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/smtp');
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestLoading(true);
      setMessage(null);

      const response = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'SMTP connection successful!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Connection failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error testing connection' });
    } finally {
      setTestLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    try {
      setSendTestLoading(true);
      setMessage(null);

      const response = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send-test',
          to: testEmail 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Test email sent successfully!' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending test email' });
    } finally {
      setSendTestLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SMTP настройки</h1>
        <p className="text-muted-foreground">
          Настройка почтового сервера для отправки уведомлений
        </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Текущие настройки
            </CardTitle>
            <CardDescription>
              Текущая SMTP конфигурация (только для чтения)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div>
                  <Label>Host</Label>
                  <Input value={settings.host} disabled />
                </div>
                <div>
                  <Label>Port</Label>
                  <Input value={settings.port} disabled />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input value={settings.user} disabled />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input value={settings.pass} disabled type="password" />
                </div>
                <div>
                  <Label>From Address</Label>
                  <Input value={settings.from} disabled />
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={handleTestConnection} 
                    disabled={testLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {testLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Send Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Отправка тестового письма
            </CardTitle>
            <CardDescription>
              Отправьте тестовое письмо для проверки работы SMTP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-email">Email адрес</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="example@mail.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Введите email адрес для отправки тестового письма
              </p>
            </div>
            <Button 
              onClick={handleSendTestEmail} 
              disabled={sendTestLoading || !testEmail}
              className="w-full"
            >
              {sendTestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Настройка SMTP:</strong> Текущие настройки SMTP находятся в файле .env (для продакшена) 
              или настроены через переменные окружения Vercel.
            </p>
            <p>
              <strong>Mailtrap:</strong> Используется для тестирования email в разработке.
              Письма попадают в Mailtrap Inbox, а не на реальные адреса.
            </p>
            <p>
              <strong>Безопасность:</strong> Пароль отображается как ****** для безопасности.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
