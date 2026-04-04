'use client';

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, XCircle, Loader2, ShoppingCart, Users } from 'lucide-react';

type SmtpFields = { host: string; port: string; user: string; pass: string; from: string };

const emptySmtp: SmtpFields = { host: '', port: '', user: '', pass: '', from: '' };

export default function SMTPPage() {
  const [orderSettings, setOrderSettings] = useState<SmtpFields>(emptySmtp);
  const [partnerSettings, setPartnerSettings] = useState<SmtpFields>(emptySmtp);
  const [editableOrder, setEditableOrder] = useState<SmtpFields>(emptySmtp);
  const [editablePartner, setEditablePartner] = useState<SmtpFields>(emptySmtp);
  const [loading, setLoading] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [savingPartner, setSavingPartner] = useState(false);
  const [testOrderLoading, setTestOrderLoading] = useState(false);
  const [testPartnerLoading, setTestPartnerLoading] = useState(false);
  const [sendOrderLoading, setSendOrderLoading] = useState(false);
  const [sendPartnerLoading, setSendPartnerLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testEmailOrder, setTestEmailOrder] = useState('');
  const [testEmailPartner, setTestEmailPartner] = useState('');
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [isEditingPartner, setIsEditingPartner] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/smtp', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        const o = data.order || data.settings || emptySmtp;
        const p = data.partner || emptySmtp;
        setOrderSettings(o);
        setPartnerSettings(p);
        setEditableOrder(o);
        setEditablePartner(p);
      }
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveChannel = async (channel: 'order' | 'partner') => {
    const setSaving = channel === 'order' ? setSavingOrder : setSavingPartner;
    const settings = channel === 'order' ? editableOrder : editablePartner;
    try {
      setSaving(true);
      setMessage(null);
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save-settings',
          channel,
          settings,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text:
            channel === 'order'
              ? 'Настройки «Уведомления о заказе» сохранены'
              : 'Настройки «Коммуникация с партнёрами» сохранены',
        });
        if (channel === 'order') setIsEditingOrder(false);
        else setIsEditingPartner(false);
        fetchSettings();
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка сохранения' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка сохранения настроек' });
    } finally {
      setSaving(false);
    }
  };

  const testChannel = async (channel: 'order' | 'partner') => {
    const setL = channel === 'order' ? setTestOrderLoading : setTestPartnerLoading;
    try {
      setL(true);
      setMessage(null);
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'test', channel }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Подключение к SMTP успешно' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Ошибка подключения' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка проверки' });
    } finally {
      setL(false);
    }
  };

  const sendTestChannel = async (channel: 'order' | 'partner') => {
    const to = channel === 'order' ? testEmailOrder : testEmailPartner;
    if (!to) {
      setMessage({ type: 'error', text: 'Укажите email для тестового письма' });
      return;
    }
    const setL = channel === 'order' ? setSendOrderLoading : setSendPartnerLoading;
    try {
      setL(true);
      setMessage(null);
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: 'send-test', channel, to }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Тестовое письмо отправлено' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Не удалось отправить' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Ошибка отправки' });
    } finally {
      setL(false);
    }
  };

  function SmtpFormFields(props: {
    channel: 'order' | 'partner';
    isEditing: boolean;
    display: SmtpFields;
    editable: SmtpFields;
    setEditable: Dispatch<SetStateAction<SmtpFields>>;
  }) {
    const { isEditing, display, editable, setEditable } = props;
    const v = isEditing ? editable : display;
    return (
      <div className="space-y-4">
        <div>
          <Label>Host</Label>
          <Input
            value={v.host}
            disabled={!isEditing}
            onChange={(e) => setEditable((prev) => ({ ...prev, host: e.target.value }))}
          />
        </div>
        <div>
          <Label>Port</Label>
          <Input
            value={v.port}
            disabled={!isEditing}
            onChange={(e) => setEditable((prev) => ({ ...prev, port: e.target.value }))}
          />
        </div>
        <div>
          <Label>Username</Label>
          <Input
            value={v.user}
            disabled={!isEditing}
            onChange={(e) => setEditable((prev) => ({ ...prev, user: e.target.value }))}
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            value={v.pass}
            disabled={!isEditing}
            type="password"
            autoComplete="new-password"
            placeholder={!isEditing ? '' : 'Оставьте ****** чтобы не менять'}
            onChange={(e) => setEditable((prev) => ({ ...prev, pass: e.target.value }))}
          />
        </div>
        <div>
          <Label>From (адрес отправителя)</Label>
          <Input
            value={v.from}
            disabled={!isEditing}
            onChange={(e) => setEditable((prev) => ({ ...prev, from: e.target.value }))}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/email">← Управление email</Link>
        </Button>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SMTP: заказы и партнёры</h1>
        <p className="text-muted-foreground max-w-3xl">
          <strong>Уведомления о заказе</strong> — письма клиентам при оформлении заказа и системные письма
          магазина (как раньше).{' '}
          <strong>Коммуникация с партнёрами</strong> — отдельный почтовый ящик/сервер для писем с логином и
          паролем в кабинет партнёра (можно тем же SMTP, но лучше разделить для учёта).
        </p>
      </div>

      {message && (
        <Alert
          className={`mb-6 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}
            >
              {message.text}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* ORDER */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
              Уведомления о заказе
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Настройки SMTP
                  </CardTitle>
                  <CardDescription className="flex items-center justify-between gap-2">
                    <span>Подтверждение заказа и другие уведомления покупателям</span>
                    <Button
                      variant={isEditingOrder ? 'ghost' : 'outline'}
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (isEditingOrder) {
                          setIsEditingOrder(false);
                          setEditableOrder(orderSettings);
                        } else {
                          setEditableOrder(orderSettings);
                          setIsEditingOrder(true);
                        }
                      }}
                    >
                      {isEditingOrder ? 'Отмена' : 'Изменить'}
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SmtpFormFields
                    channel="order"
                    isEditing={isEditingOrder}
                    display={orderSettings}
                    editable={editableOrder}
                    setEditable={setEditableOrder}
                  />
                  {isEditingOrder ? (
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={() => saveChannel('order')}
                        disabled={savingOrder}
                      >
                        {savingOrder ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Сохранить
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => testChannel('order')}
                        disabled={testOrderLoading}
                      >
                        {testOrderLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        Тест подключения
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => testChannel('order')}
                      disabled={testOrderLoading}
                    >
                      {testOrderLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Тест подключения
                    </Button>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Тестовое письмо
                  </CardTitle>
                  <CardDescription>Проверка через SMTP заказов</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="test-order">Email</Label>
                    <Input
                      id="test-order"
                      type="email"
                      value={testEmailOrder}
                      onChange={(e) => setTestEmailOrder(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    disabled={sendOrderLoading || !testEmailOrder}
                    onClick={() => sendTestChannel('order')}
                  >
                    {sendOrderLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Отправить тест
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* PARTNER */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-violet-600" />
              Коммуникация с партнёрами
            </h2>
            <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
              Используется при создании пользователя партнёра: на указанный email автоматически уходит письмо с
              ссылкой на вход, логином и паролем. Пароль в письме — в открытом виде; храните почтовый доступ в
              безопасности.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Настройки SMTP для партнёров
                  </CardTitle>
                  <CardDescription className="flex items-center justify-between gap-2">
                    <span>Отдельно от заказов (рекомендуется)</span>
                    <Button
                      variant={isEditingPartner ? 'ghost' : 'outline'}
                      size="sm"
                      type="button"
                      onClick={() => {
                        if (isEditingPartner) {
                          setIsEditingPartner(false);
                          setEditablePartner(partnerSettings);
                        } else {
                          setEditablePartner(partnerSettings);
                          setIsEditingPartner(true);
                        }
                      }}
                    >
                      {isEditingPartner ? 'Отмена' : 'Изменить'}
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SmtpFormFields
                    channel="partner"
                    isEditing={isEditingPartner}
                    display={partnerSettings}
                    editable={editablePartner}
                    setEditable={setEditablePartner}
                  />
                  {isEditingPartner ? (
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={() => saveChannel('partner')}
                        disabled={savingPartner}
                      >
                        {savingPartner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Сохранить
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => testChannel('partner')}
                        disabled={testPartnerLoading}
                      >
                        {testPartnerLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="mr-2 h-4 w-4" />
                        )}
                        Тест подключения
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => testChannel('partner')}
                      disabled={testPartnerLoading}
                    >
                      {testPartnerLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Тест подключения
                    </Button>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Тестовое письмо (партнёры)
                  </CardTitle>
                  <CardDescription>Проверка через партнёрский SMTP</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="test-partner">Email</Label>
                    <Input
                      id="test-partner"
                      type="email"
                      value={testEmailPartner}
                      onChange={(e) => setTestEmailPartner(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    disabled={sendPartnerLoading || !testEmailPartner}
                    onClick={() => sendTestChannel('partner')}
                  >
                    {sendPartnerLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Отправить тест
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>Справка</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Переменные окружения для заказов: <code>SMTP_HOST</code>, <code>SMTP_PORT</code> и т.д. Для
                партнёров при отсутствии записей в БД: <code>PARTNER_SMTP_HOST</code>,{' '}
                <code>PARTNER_SMTP_PORT</code>, <code>PARTNER_SMTP_USER</code>, <code>PARTNER_SMTP_PASS</code>,{' '}
                <code>PARTNER_SMTP_FROM</code>.
              </p>
              <p>
                Если поле пароля показывает звёздочки, при сохранении существующий пароль в БД не меняется,
                пока вы не введите новый.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
