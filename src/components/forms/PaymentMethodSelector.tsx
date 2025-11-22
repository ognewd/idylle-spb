'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Building2, Truck, Store, Info } from 'lucide-react';
import { PaymentMethod } from '@/lib/payments';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethod: string;
  onMethodChange: (methodId: string) => void;
  orderTotal: number;
}

export function PaymentMethodSelector({
  methods,
  selectedMethod,
  onMethodChange,
  orderTotal,
}: PaymentMethodSelectorProps) {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />;
      case 'bank_transfer':
        return <Building2 className="h-5 w-5" />;
      case 'cash_delivery':
        return <Truck className="h-5 w-5" />;
      case 'cash_pickup':
        return <Store className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getMethodDescription = (type: string) => {
    switch (type) {
      case 'card':
        return 'Оплата банковской картой онлайн';
      case 'bank_transfer':
        return 'Банковский перевод для юридических лиц';
      case 'cash_delivery':
        return 'Наличными при получении (только СПб)';
      case 'cash_pickup':
        return 'Наличными при самовывозе из бутика';
      default:
        return '';
    }
  };

  const calculateTotal = (method: PaymentMethod) => {
    const commission = method.commission > 0 
      ? (orderTotal * method.commission) / 100 
      : 0;
    return orderTotal + commission;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Способ оплаты</h3>
      
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
        {methods.map((method) => (
          <Card key={method.id} className="cursor-pointer transition-colors hover:bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={method.id} id={method.id} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(method.type)}
                      <Label htmlFor={method.id} className="font-medium cursor-pointer">
                        {method.name}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      {method.commission > 0 && (
                        <Badge variant="secondary">
                          +{method.commission}% комиссия
                        </Badge>
                      )}
                      {method.type === 'cash_delivery' && (
                        <Badge variant="outline">Только СПб</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {getMethodDescription(method.type)}
                  </p>
                  
                  {method.commission > 0 && (
                    <div className="mt-2 text-sm">
                      <span className="text-muted-foreground">Итого к оплате: </span>
                      <span className="font-semibold">
                        {calculateTotal(method).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  )}
                  
                  {method.instructions && (
                    <button
                      type="button"
                      onClick={() => setShowDetails(
                        showDetails === method.id ? null : method.id
                      )}
                      className="flex items-center space-x-1 text-sm text-primary hover:underline mt-2"
                    >
                      <Info className="h-4 w-4" />
                      <span>Подробнее</span>
                    </button>
                  )}
                  
                  {showDetails === method.id && method.instructions && (
                    <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                      <div dangerouslySetInnerHTML={{ __html: method.instructions }} />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
    </div>
  );
}
