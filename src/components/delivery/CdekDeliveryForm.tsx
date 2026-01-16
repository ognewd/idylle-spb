'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

interface CdekTariff {
  tariff_code: number;
  tariff_name: string;
  delivery_sum: number;
  period_min: number;
  period_max: number;
  delivery_mode?: number;
}

interface CdekDeliveryFormProps {
  initialCity?: string;
  initialAddress?: string;
  onCalculate: (data: {
    city: string;
    deliveryType: 'door' | 'pvz';
    tariff?: CdekTariff;
    pvzCode?: string;
    pvzAddress?: string;
  }) => void;
  onError: (error: string) => void;
}

export function CdekDeliveryForm({ initialCity = '', initialAddress = '', onCalculate, onError }: CdekDeliveryFormProps) {
  // Инициализируем с начальными значениями - используем функции-инициализаторы
  const [city, setCity] = useState(() => {
    return initialCity?.trim() || 'Москва';
  });
  const [deliveryType, setDeliveryType] = useState<'door' | 'pvz'>('door');
  const [address, setAddress] = useState(() => {
    return initialAddress?.trim() || '';
  });
  const [hasUserTyped, setHasUserTyped] = useState(false);
  
  // Обновляем состояние при изменении начальных значений
  useEffect(() => {
    const trimmedCity = initialCity?.trim();
    if (trimmedCity && trimmedCity !== city) {
      setCity(trimmedCity);
    }
  }, [initialCity]);
  
  // Обновляем адрес при изменении initialAddress и если выбран тип "до двери"
  // НО только если пользователь еще не начал вводить адрес
  useEffect(() => {
    if (deliveryType === 'door' && !hasUserTyped) {
      const trimmedAddress = initialAddress?.trim() || '';
      // Обновляем адрес из initialAddress только если пользователь не вводил
      if (trimmedAddress) {
        setAddress(trimmedAddress);
      }
    }
  }, [initialAddress, deliveryType, hasUserTyped]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [tariffs, setTariffs] = useState<CdekTariff[]>([]);
  const [selectedTariff, setSelectedTariff] = useState<CdekTariff | null>(null);
  const [pvzList, setPvzList] = useState<any[]>([]);
  const [selectedPvz, setSelectedPvz] = useState<string>('');

  // Расчет стоимости доставки
  const handleCalculate = async () => {
    const trimmedCity = city.trim();
    
    if (!trimmedCity) {
      setTariffs([]);
      setSelectedTariff(null);
      return;
    }
    
    // Проверяем минимальную длину названия города
    if (trimmedCity.length < 3) {
      // Не показываем ошибку для слишком коротких названий
      setTariffs([]);
      setSelectedTariff(null);
      return;
    }

    setIsCalculating(true);
    try {
      // Рассчитываем стоимость
      const weight = 1000; // TODO: брать из корзины
      const calcResponse = await fetch('/api/delivery/cdek/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromCity: 'Санкт-Петербург',
          toCity: trimmedCity,
          weight,
          deliveryType,
        }),
      });

      if (!calcResponse.ok) {
        const error = await calcResponse.json();
        const errorMessage = error.error || 'Ошибка расчета стоимости';
        
        // Не показываем ошибку для слишком коротких названий городов
        if (errorMessage.includes('минимум 3 символа') || trimmedCity.length < 3) {
          setTariffs([]);
          setSelectedTariff(null);
          setIsCalculating(false);
          return;
        }
        
        throw new Error(errorMessage);
      }

      const data = await calcResponse.json();
      const availableTariffs = data.tariffs || data.tariff_codes || [];

      if (availableTariffs.length === 0) {
        throw new Error('Нет доступных тарифов для выбранного города');
      }

      setTariffs(availableTariffs);

      // Если выбран ПВЗ, получаем список ПВЗ
      if (deliveryType === 'pvz') {
        const pvzResponse = await fetch(`/api/delivery/cdek/pvz?city=${encodeURIComponent(trimmedCity)}`);
        if (pvzResponse.ok) {
          const pvzData = await pvzResponse.json();
          setPvzList(pvzData.pvz || []);
        }
      }
    } catch (error: any) {
      onError(error.message || 'Ошибка расчета стоимости доставки');
    } finally {
      setIsCalculating(false);
    }
  };

  // Автоматический расчет при изменении города
  // Только если город введен полностью (минимум 3 символа)
  useEffect(() => {
    const trimmedCity = city.trim();
    // Не запускаем расчет для слишком коротких названий (меньше 3 символов)
    if (trimmedCity.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleCalculate();
      }, 800); // Увеличил задержку до 800мс для уменьшения количества запросов
      return () => clearTimeout(timeoutId);
    } else {
      // Очищаем тарифы, если город слишком короткий
      setTariffs([]);
      setSelectedTariff(null);
    }
  }, [city, deliveryType]);

  const handleConfirm = () => {
    if (!selectedTariff) {
      onError('Выберите тариф доставки');
      return;
    }

    if (deliveryType === 'door' && !address.trim()) {
      onError('Укажите адрес доставки');
      return;
    }

    if (deliveryType === 'pvz' && !selectedPvz) {
      onError('Выберите пункт выдачи');
      return;
    }

    const selectedPvzData = pvzList.find(p => p.code === selectedPvz);

    onCalculate({
      city,
      deliveryType,
      tariff: selectedTariff,
      pvzCode: selectedPvz || undefined,
      pvzAddress: selectedPvzData?.location?.address || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cdek-city">Город получателя *</Label>
        <Input
          id="cdek-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Например: Москва"
        />
      </div>

      <div className="space-y-2">
        <Label>Тип доставки</Label>
        <RadioGroup value={deliveryType} onValueChange={(v) => setDeliveryType(v as 'door' | 'pvz')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="door" id="cdek-door" />
            <Label htmlFor="cdek-door">До двери</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pvz" id="cdek-pvz" />
            <Label htmlFor="cdek-pvz">В пункт выдачи (ПВЗ)</Label>
          </div>
        </RadioGroup>
      </div>

      {deliveryType === 'door' && (
        <div className="space-y-2">
          <Label htmlFor="cdek-address">Адрес доставки *</Label>
          <AddressAutocomplete
            id="cdek-address"
            value={address}
            onChange={(value) => {
              setHasUserTyped(true);
              setAddress(value);
            }}
            city={city}
            placeholder="Улица, дом, квартира"
          />
        </div>
      )}

      {isCalculating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Расчет стоимости...</span>
        </div>
      )}

      {tariffs.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label>Выберите тариф:</Label>
              {tariffs.map((tariff) => (
                <div
                  key={tariff.tariff_code}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTariff?.tariff_code === tariff.tariff_code
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTariff(tariff)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{tariff.tariff_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Срок: {tariff.period_min}-{tariff.period_max} дн.
                      </div>
                    </div>
                    <div className="font-bold text-lg">{tariff.delivery_sum} ₽</div>
                  </div>
                </div>
              ))}
            </div>

            {deliveryType === 'pvz' && pvzList.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label>Выберите пункт выдачи:</Label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={selectedPvz}
                  onChange={(e) => setSelectedPvz(e.target.value)}
                >
                  <option value="">Выберите ПВЗ</option>
                  {pvzList.map((pvz) => (
                    <option key={pvz.code} value={pvz.code}>
                      {pvz.name} - {pvz.location?.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              type="button"
              onClick={handleConfirm}
              className="w-full mt-4"
              disabled={!selectedTariff || (deliveryType === 'pvz' && !selectedPvz)}
            >
              Подтвердить выбор
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
