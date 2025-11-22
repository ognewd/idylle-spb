'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Save, Eye, EyeOff, Edit, X, Smartphone, Tablet, Monitor } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

const defaultTemplate: EmailTemplate = {
  id: 'order-confirmation',
  name: 'Подтверждение заказа',
  subject: 'Заказ №{{orderNumber}} принят',
  htmlBody: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; background-color: #f5f5f5; }
    .email-wrapper { background-color: #f5f5f5; padding: 40px 20px; }
    .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .logo { text-align: center; padding: 24px 20px; background: #ffffff; }
    .logo img { max-width: 180px; height: auto; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px; }
    .order-number { font-size: 14px; color: #666; margin-bottom: 30px; }
    .divider { height: 1px; background: #e5e5e5; margin: 30px 0; }
    .section-title { font-size: 14px; font-weight: 600; color: #1a1a1a; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .info-label { color: #666; }
    .info-value { color: #1a1a1a; font-weight: 500; }
    .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .items-table th { text-align: left; padding: 12px 0; font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e5e5e5; }
    .items-table td { padding: 16px 0; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
    .items-table td:first-child { color: #1a1a1a; }
    .items-table td:last-child { text-align: right; font-weight: 600; }
    .total-row { font-size: 20px; font-weight: 600; color: #1a1a1a; padding-top: 16px; }
    .footer { background: #fafafa; padding: 30px; text-align: center; font-size: 12px; color: #666; }
    .footer p { margin: 4px 0; }
    .footer a { color: #667eea; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 20px 10px; }
      .content { padding: 30px 20px; }
      .logo img { max-width: 150px; }
      .items-table { font-size: 12px; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Logo Header -->
      <div class="logo">
        <img src="{{logoUrl}}" alt="Idylle" />
      </div>

      <!-- Main Content -->
      <div class="content">
        <!-- Greeting -->
        <div class="greeting">Благодарим за ваш заказ!</div>
        <div class="order-number">Номер заказа: <strong>#{{orderNumber}}</strong></div>

        <div class="divider"></div>

        <!-- Order Information -->
        <div class="section-title">Детали получателя</div>
        <div class="info-row">
          <span class="info-label">ФИО:</span>
          <span class="info-value">{{firstName}} {{lastName}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">{{email}}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Телефон:</span>
          <span class="info-value">{{phone}}</span>
        </div>

        <div class="divider"></div>

        <!-- Delivery & Payment -->
        <div class="section-title">Доставка и оплата</div>
        <div class="info-row">
          <span class="info-label">Способ доставки:</span>
          <span class="info-value">{{deliveryMethod}}</span>
        </div>
        {{#if deliveryAddress}}
        <div style="padding: 8px 0; font-size: 14px;">
          <span class="info-label">Адрес:</span>
          <span style="color: #1a1a1a;">{{deliveryAddress}}</span>
        </div>
        {{/if}}
        <div class="info-row">
          <span class="info-label">Способ оплаты:</span>
          <span class="info-value">{{paymentMethod}}</span>
        </div>

        <div class="divider"></div>

        <!-- Order Items -->
        <div class="section-title">Состав заказа</div>
        <table class="items-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th style="text-align: right;">Кол-во</th>
              <th style="text-align: right;">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {{#each orderItems}}
            <tr>
              <td>
                {{name}}{{#if variantInfo}}<br><span style="color: #999; font-size: 12px;">{{variantInfo}}</span>{{/if}}
              </td>
              <td style="text-align: right;">{{quantity}}</td>
              <td class="total-row">{{total}} ₽</td>
            </tr>
            {{/each}}
          </tbody>
        </table>

        <div class="divider"></div>

        <!-- Total -->
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: 600; color: #1a1a1a;">
            Итого: {{totalAmount}} ₽
          </div>
        </div>

        {{#if notes}}
        <div style="margin-top: 20px; padding: 16px; background: #fafafa; border-radius: 8px; font-size: 14px;">
          <strong style="color: #1a1a1a;">Комментарий:</strong>
          <p style="margin: 8px 0 0 0; color: #666;">{{notes}}</p>
        </div>
        {{/if}}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Если у вас возникли вопросы, мы с радостью поможем!</p>
        <p><a href="mailto:info@idylle.spb.ru">info@idylle.spb.ru</a> | <a href="tel:+78121234567">+7 (812) 123-45-67</a></p>
        <p style="margin-top: 16px; color: #999;">© 2024 Idylle. Все права защищены.</p>
      </div>
    </div>
  </div>
</body>
</html>`,
  textBody: `Спасибо за ваш заказ!

Заказ №{{orderNumber}} принят.

Детали заказа:
Дата: {{orderDate}}
Получатель: {{firstName}} {{lastName}}
Email: {{email}}
Телефон: {{phone}}

Способ доставки: {{deliveryMethod}}
{{#if deliveryAddress}}Адрес: {{deliveryAddress}}{{/if}}

Способ оплаты: {{paymentMethod}}

Состав заказа:
{{#each orderItems}}
- {{name}}{{#if variantInfo}} - {{variantInfo}}{{/if}} x {{quantity}} = {{total}} ₽
{{/each}}

Итого: {{totalAmount}} ₽

{{#if notes}}
Комментарий: {{notes}}
{{/if}}

С уважением,
Команда Idylle`,
};

export default function EmailTemplatesPage() {
  const [template, setTemplate] = useState<EmailTemplate>(defaultTemplate);
  const [showPreview, setShowPreview] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [previewData, setPreviewData] = useState({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadTemplate();
    generatePreview();
  }, []);

  const loadTemplate = async () => {
    try {
      // TODO: Load from API
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const handleSave = async () => {
    try {
      setMessage({ type: 'success', text: 'Шаблон сохранен!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при сохранении' });
    }
  };

  const generatePreview = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const sampleData = {
      orderNumber: 'idy123',
      orderDate: new Date().toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      firstName: 'Иван',
      lastName: 'Иванов',
      email: 'ivan@example.com',
      phone: '+7 (999) 123-45-67',
      deliveryMethod: 'Доставка курьером',
      deliveryAddress: 'г. Санкт-Петербург, ул. Невский пр., д. 1',
      paymentMethod: 'Банковская карта онлайн',
      orderItems: [
        { name: 'Ароматическая свеча "Лаванда"', variantInfo: '100 мл', quantity: 2, price: 1500, total: 3000 },
        { name: 'Диффузор "Цитрус"', variantInfo: null, quantity: 1, price: 2500, total: 2500 },
      ],
      totalAmount: '5 500',
      notes: 'Позвонить за час до доставки',
      logoUrl: `${baseUrl}/logo-idylle.png`,
    };
    setPreviewData(sampleData);
  };

  const renderTemplate = (templateStr: string, data: any) => {
    let result = templateStr;
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      return data[condition] ? content : '';
    });
    result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayKey, content) => {
      if (Array.isArray(data[arrayKey])) {
        return data[arrayKey].map(item => {
          let itemContent = content;
          Object.keys(item).forEach(key => {
            itemContent = itemContent.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), item[key] || '');
          });
          return itemContent;
        }).join('');
      }
      return '';
    });
    return result;
  };

  const handleFieldEdit = (field: string) => {
    setEditingField(field);
  };

  const handleFieldSave = (field: string, value: string) => {
    setTemplate({ ...template, [field]: value });
    setEditingField(null);
  };

  const getDeviceDimensions = () => {
    switch (deviceType) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
        return { width: '100%', height: 'auto' };
    }
  };

  const deviceDimensions = getDeviceDimensions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Шаблоны email</h1>
        <p className="text-muted-foreground">
          Управление шаблонами email уведомлений
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">{template.name}</h2>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Сохранить
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Subject Field */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Тема письма</CardTitle>
                <CardDescription>Редактируйте тему письма напрямую</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFieldEdit('subject')}
              >
                <Edit className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {editingField === 'subject' ? (
              <div className="space-y-2">
                <Textarea
                  value={template.subject}
                  onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  className="min-h-[80px] font-mono text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleFieldSave('subject', template.subject)}
                  >
                    Сохранить
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingField(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="font-semibold mb-2">Тема:</p>
                <p className="text-sm">{renderTemplate(template.subject, previewData)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor and Preview Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - HTML Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>HTML код</CardTitle>
                  <CardDescription>Редактируйте HTML содержимое письма</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldEdit('htmlBody')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {editingField === 'htmlBody' ? 'Отменить' : 'Редактировать'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingField === 'htmlBody' ? (
                <div className="space-y-2">
                  <Textarea
                    value={template.htmlBody}
                    onChange={(e) => setTemplate({ ...template, htmlBody: e.target.value })}
                    className="font-mono text-sm min-h-[600px]"
                    rows={30}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleFieldSave('htmlBody', template.htmlBody)}
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingField(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  <div className="p-2 bg-gray-100 border-b text-xs text-gray-600 font-mono">
                    HTML код (нажмите "Редактировать" для изменения)
                  </div>
                  <div className="p-4 text-xs overflow-auto max-h-[600px] text-gray-600">
                    {(template.htmlBody || '').length} символов
                  </div>
                </div>
              )}

              {/* Variables Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2">Доступные переменные:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><code className="bg-white px-2 py-1 rounded">{`{{orderNumber}}`}</code></div>
                  <div><code className="bg-white px-2 py-1 rounded">{`{{orderDate}}`}</code></div>
                  <div><code className="bg-white px-2 py-1 rounded">{`{{firstName}}`}</code></div>
                  <div><code className="bg-white px-2 py-1 rounded">{`{{lastName}}`}</code></div>
                  <div><code className="bg-white px-2 py-1 rounded">{`{{email}}`}</code></div>
                  <div><code className="bg-white px-2 py-1 rounded">{`{{phone}}`}</code></div>
                  <div><code className="bg-white px-2 py-1 rounded">{`{{deliveryMethod}}`}</code></div>
                  <div><code className="bg-white px-2 py-1 rounded">{`{{paymentMethod}}`}</code></div>
                  <div><code className="bg-white px-2 py-1 rounded">{`{{totalAmount}}`}</code></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Предварительный просмотр</CardTitle>
                  <CardDescription>Просмотр на разных устройствах</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {/* Device Type Selector */}
                  <div className="flex gap-1 border rounded-lg p-1 bg-muted">
                    <Button
                      variant={deviceType === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDeviceType('mobile')}
                      className="h-8 w-8 p-0"
                      title="Mobile"
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={deviceType === 'tablet' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDeviceType('tablet')}
                      className="h-8 w-8 p-0"
                      title="Tablet"
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={deviceType === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setDeviceType('desktop')}
                      className="h-8 w-8 p-0"
                      title="Desktop"
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Preview iframe */}
              <div>
                <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100" style={{ maxWidth: deviceDimensions.width, margin: '0 auto' }}>
                  <div className="bg-gray-800 text-white px-4 py-2 flex items-center gap-2 text-xs">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="ml-2">{deviceType === 'desktop' ? 'Desktop View' : deviceType === 'tablet' ? 'Tablet View (768px)' : 'Mobile View (375px)'}</span>
                  </div>
                  <div style={{ width: deviceDimensions.width, height: deviceDimensions.height, overflow: 'auto' }}>
                    <iframe
                      srcDoc={renderTemplate(template.htmlBody, previewData)}
                      className="w-full border-0"
                      style={{ height: deviceType === 'desktop' ? '600px' : '667px' }}
                      title="Email Preview"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
