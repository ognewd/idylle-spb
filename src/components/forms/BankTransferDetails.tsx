'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { useState } from 'react';

interface BankTransferDetailsProps {
  orderNumber: string;
  amount: number;
  companyDetails: {
    companyName: string;
    inn: string;
    kpp: string;
    bank: string;
    bik: string;
    account: string;
    correspondent: string;
  };
}

export function BankTransferDetails({
  orderNumber,
  amount,
  companyDetails,
}: BankTransferDetailsProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const generatePaymentOrder = () => {
    const paymentOrder = `
ПЛАТЕЖНОЕ ПОРУЧЕНИЕ

Получатель: ${companyDetails.companyName}
ИНН: ${companyDetails.inn}
КПП: ${companyDetails.kpp}
Банк получателя: ${companyDetails.bank}
БИК: ${companyDetails.bik}
Корр. счет: ${companyDetails.correspondent}
Расчетный счет: ${companyDetails.account}

Назначение платежа: Оплата заказа №${orderNumber}
Сумма: ${amount.toLocaleString('ru-RU')} руб.
    `.trim();

    return paymentOrder;
  };

  const downloadPaymentOrder = () => {
    const content = generatePaymentOrder();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment-order-${orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Реквизиты для оплаты
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPaymentOrder}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Скачать</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Получатель
            </label>
            <div className="flex items-center space-x-2">
              <p className="font-medium">{companyDetails.companyName}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(companyDetails.companyName, 'company')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied === 'company' && (
                <span className="text-xs text-green-600">Скопировано!</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              ИНН
            </label>
            <div className="flex items-center space-x-2">
              <p className="font-mono">{companyDetails.inn}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(companyDetails.inn, 'inn')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied === 'inn' && (
                <span className="text-xs text-green-600">Скопировано!</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              КПП
            </label>
            <div className="flex items-center space-x-2">
              <p className="font-mono">{companyDetails.kpp}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(companyDetails.kpp, 'kpp')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied === 'kpp' && (
                <span className="text-xs text-green-600">Скопировано!</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Банк получателя
            </label>
            <div className="flex items-center space-x-2">
              <p className="font-medium">{companyDetails.bank}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(companyDetails.bank, 'bank')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied === 'bank' && (
                <span className="text-xs text-green-600">Скопировано!</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              БИК
            </label>
            <div className="flex items-center space-x-2">
              <p className="font-mono">{companyDetails.bik}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(companyDetails.bik, 'bik')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied === 'bik' && (
                <span className="text-xs text-green-600">Скопировано!</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Корр. счет
            </label>
            <div className="flex items-center space-x-2">
              <p className="font-mono">{companyDetails.correspondent}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(companyDetails.correspondent, 'correspondent')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied === 'correspondent' && (
                <span className="text-xs text-green-600">Скопировано!</span>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">
              Расчетный счет
            </label>
            <div className="flex items-center space-x-2">
              <p className="font-mono text-lg">{companyDetails.account}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(companyDetails.account, 'account')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied === 'account' && (
                <span className="text-xs text-green-600">Скопировано!</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Назначение платежа
            </label>
            <div className="flex items-center space-x-2">
              <p className="font-medium">
                Оплата заказа №{orderNumber}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(`Оплата заказа №${orderNumber}`, 'purpose')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              {copied === 'purpose' && (
                <span className="text-xs text-green-600">Скопировано!</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Важно:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Укажите номер заказа в назначении платежа</li>
            <li>• После оплаты пришлите копию платежного поручения на email</li>
            <li>• Заказ будет обработан после поступления средств</li>
            <li>• Обычно средства поступают в течение 1-3 рабочих дней</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
