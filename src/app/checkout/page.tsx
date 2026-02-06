'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import nextDynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, FileText, Banknote, Store, Download, CheckCircle, User, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CityAutocomplete, CitySuggestion } from '@/components/ui/city-autocomplete';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { getImageUrl } from '@/lib/image-url';
import { DELIVERY_CONFIG, isSaintPetersburg } from '@/lib/delivery-config';
import type { PvzMapPoint } from '@/components/delivery/PvzMap';

const PvzMap = nextDynamic(() => import('@/components/delivery/PvzMap').then((m) => m.PvzMap), { ssr: false });

type PaymentMethod = 'card' | 'invoice' | 'cash' | 'pickup';
type DeliveryMethod = 'spb_courier' | 'spb_boutique' | 'spb_cdek' | 'cdek_courier' | 'cdek_pickup';

interface SelectedCity {
  code: number;
  city: string;
  region: string;
  displayValue: string; // "190000, г, Санкт-Петербург"
  postal_code?: string; // из API СДЭК (подсказки городов)
}

interface DeliveryPrice {
  door?: number;
  pickup?: number;
  isLoading: boolean;
  error?: string;
}

interface CdekTariffInfo {
  tariff_code: number;
  tariff_name: string;
  delivery_sum: number;
  period_min: number;
  period_max: number;
}

interface CdekPvzItem {
  code: string;
  name: string;
  location: { address?: string; city?: string; latitude?: number; longitude?: number };
  work_time?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, totalWeightGrams, clearCart } = useCart();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestOption, setShowGuestOption] = useState(!session?.user);
  
  // Шаг 1: Контакты
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Шаг 2: Город
  const [selectedCity, setSelectedCity] = useState<SelectedCity | null>(null);
  const [cityInput, setCityInput] = useState('');
  
  // Шаг 3: Доставка
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod | null>(null);
  const [deliveryPrices, setDeliveryPrices] = useState<DeliveryPrice>({ isLoading: false });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  
  // Данные СДЭК
  const [cdekData, setCdekData] = useState<{
    tariff?: CdekTariffInfo;
    pvzCode?: string;
    pvzAddress?: string;
    deliveryType?: 'door' | 'pvz';
  } | null>(null);
  // Тарифы «до двери» и «до ПВЗ» из расчёта
  const [deliveryTariffs, setDeliveryTariffs] = useState<{ door: CdekTariffInfo | null; pickup: CdekTariffInfo | null }>({ door: null, pickup: null });
  // Список ПВЗ для выбора
  const [pvzList, setPvzList] = useState<CdekPvzItem[]>([]);
  const [pvzLoading, setPvzLoading] = useState(false);
  /** Пересчёт цены «до двери» по введённому адресу (курьер СДЭК) */
  const [doorPriceUpdating, setDoorPriceUpdating] = useState(false);

  const pvzMapPoints = useMemo((): PvzMapPoint[] => {
    return pvzList
      .filter((p) => typeof p.location?.latitude === 'number' && typeof p.location?.longitude === 'number')
      .map((p) => ({
        code: p.code,
        name: p.name,
        address: p.location?.address,
        latitude: p.location!.latitude!,
        longitude: p.location!.longitude!,
        work_time: p.work_time,
      }));
  }, [pvzList]);

  const pvzListRef = useRef(pvzList);
  const deliveryTariffsRef = useRef(deliveryTariffs);
  pvzListRef.current = pvzList;
  deliveryTariffsRef.current = deliveryTariffs;
  const handleSelectPvz = useCallback((code: string) => {
    const pvz = pvzListRef.current.find((p) => p.code === code);
    if (!pvz) return;
    const addr = pvz.location?.address || pvz.name || '';
    setCdekData((prev) =>
      prev
        ? { ...prev, pvzCode: pvz.code, pvzAddress: addr }
        : { deliveryType: 'pvz', tariff: deliveryTariffsRef.current.pickup ?? undefined, pvzCode: pvz.code, pvzAddress: addr }
    );
  }, []);

  // Адрес доставки (строка для поля подсказок + структурированные поля)
  const [addressLine, setAddressLine] = useState('');
  const [address, setAddress] = useState({
    street: '',
    house: '',
    apartment: '',
    postalCode: '',
    entrance: '',
    floor: '',
    code: '',
    comment: '',
  });
  
  // Данные пользователя
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    comment: '',
    companyName: '',
    inn: '',
    kpp: '',
    companyAddress: '',
  });

  // Auto-fill для авторизованных пользователей
  useEffect(() => {
    if (session?.user) {
      fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            const nameParts = data.name ? data.name.split(' ') : [];
            setFormData(prev => ({
              ...prev,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
            }));
            setEmail(data.email || '');
            setPhone(data.phone || '');
          }
        })
        .catch(error => console.error('Error fetching user data:', error));
    }
  }, [session]);

  // Определяем, является ли выбранный город СПб
  const isSpb = selectedCity ? isSaintPetersburg(selectedCity.code, selectedCity.city) : false;

  // Расчет стоимости доставки после выбора города
  useEffect(() => {
    if (!selectedCity || isSpb) {
      // Для СПб фиксированные цены
      setDeliveryPrices({ 
        door: DELIVERY_CONFIG.SPB_COURIER_PRICE,
        pickup: 0, // бесплатно из бутика (или будет СДЭК)
        isLoading: false 
      });
      return;
    }

    // Для других городов - расчет через CDEK API
    setDeliveryPrices({ isLoading: true });
    
    const calculateDelivery = async () => {
      try {
        const weight = Math.max(1000, totalWeightGrams);
        const response = await fetch('/api/delivery/cdek/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromCity: DELIVERY_CONFIG.SHIP_FROM_CITY,
            toCity: selectedCity.city,
            weight,
            deliveryType: 'door', // рассчитываем оба варианта
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка расчета доставки');
        }

        const data = await response.json();
        const tariffs = data.tariffs || data.tariff_codes || [];
        // Тарифы СДЭК: 139 = «дверь–дверь» (курьер), 138 = «склад–склад» (ПВЗ). Цена «от» = delivery_sum из ответа API.
        const doorCandidates = tariffs.filter((t: any) => t.tariff_code === 139 || Number(t.delivery_mode) === 1 || t.tariff_name?.toLowerCase().includes('дверь'));
        const pickupCandidates = tariffs.filter((t: any) => t.tariff_code === 138 || Number(t.delivery_mode) === 2 || t.tariff_name?.toLowerCase().includes('склад'));
        const doorTariff = doorCandidates.length ? doorCandidates.reduce((a: any, b: any) => (a.delivery_sum <= b.delivery_sum ? a : b)) : undefined;
        const pickupTariff = pickupCandidates.length ? pickupCandidates.reduce((a: any, b: any) => (a.delivery_sum <= b.delivery_sum ? a : b)) : undefined;

        const toTariff = (t: any): CdekTariffInfo | null =>
          t ? { tariff_code: t.tariff_code, tariff_name: t.tariff_name || '', delivery_sum: t.delivery_sum ?? 0, period_min: t.period_min ?? 0, period_max: t.period_max ?? 0 } : null;

        setDeliveryTariffs({ door: toTariff(doorTariff), pickup: toTariff(pickupTariff) });
        setDeliveryPrices({
          door: doorTariff?.delivery_sum,
          pickup: pickupTariff?.delivery_sum,
          isLoading: false,
        });
      } catch (error: any) {
        console.error('Error calculating delivery:', error);
        setDeliveryPrices({
          isLoading: false,
          error: error.message || 'Не удалось рассчитать доставку',
        });
      }
    };

    calculateDelivery();
  }, [selectedCity, isSpb, totalWeightGrams]);

  // Повторный расчёт стоимости «до двери» по адресу (курьер СДЭК) — передаём адрес в СДЭК
  useEffect(() => {
    if (
      deliveryMethod !== 'cdek_courier' ||
      !selectedCity?.city ||
      isSpb ||
      !address.street?.trim() ||
      !address.house?.trim()
    ) {
      return;
    }
    const fullAddress = `${address.street.trim()}, д. ${address.house.trim()}${address.apartment?.trim() ? ', кв. ' + address.apartment.trim() : ''}`;
    const timer = setTimeout(async () => {
      setDoorPriceUpdating(true);
      try {
        const response = await fetch('/api/delivery/cdek/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromCity: DELIVERY_CONFIG.SHIP_FROM_CITY,
            toCity: selectedCity.city,
            weight: Math.max(1000, totalWeightGrams),
            address: fullAddress,
            deliveryType: 'door',
          }),
        });
        if (!response.ok) return;
        const data = await response.json();
        const tariffs = data.tariffs || data.tariff_codes || [];
        const doorCandidates = tariffs.filter((t: any) => t.tariff_code === 139 || Number(t.delivery_mode) === 1 || t.tariff_name?.toLowerCase().includes('дверь'));
        const doorTariff = doorCandidates.length ? doorCandidates.reduce((a: any, b: any) => (a.delivery_sum <= b.delivery_sum ? a : b)) : undefined;
        const toTariff = (t: any): CdekTariffInfo | null =>
          t ? { tariff_code: t.tariff_code, tariff_name: t.tariff_name || '', delivery_sum: t.delivery_sum ?? 0, period_min: t.period_min ?? 0, period_max: t.period_max ?? 0 } : null;
        if (doorTariff) {
          setDeliveryTariffs((prev) => ({ ...prev, door: toTariff(doorTariff) }));
          setDeliveryPrices((prev) => ({ ...prev, door: doorTariff.delivery_sum }));
          setCdekData((prev) => (prev?.deliveryType === 'door' ? { ...prev, tariff: toTariff(doorTariff) } : prev));
        }
      } catch (e) {
        console.error('Address recalc error:', e);
      } finally {
        setDoorPriceUpdating(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [deliveryMethod, selectedCity?.city, address.street, address.house, address.apartment, totalWeightGrams, isSpb]);

  // Сброс способа доставки и ПВЗ при смене города
  useEffect(() => {
    setDeliveryMethod(null);
    setCdekData(null);
    setPvzList([]);
    setDeliveryTariffs({ door: null, pickup: null });
    setAddressLine('');
    setAddress({
      street: '',
      house: '',
      apartment: '',
      entrance: '',
      floor: '',
      code: '',
      comment: '',
    });
  }, [selectedCity]);

  // При выборе «курьер СДЭК» — сохраняем тариф «до двери»
  useEffect(() => {
    if (deliveryMethod === 'cdek_courier' && deliveryTariffs.door) {
      setCdekData({ deliveryType: 'door', tariff: deliveryTariffs.door });
    }
  }, [deliveryMethod, deliveryTariffs.door]);

  // При выборе «ПВЗ СДЭК» — сохраняем тариф «до ПВЗ»; выбор конкретного ПВЗ — по клику в списке
  useEffect(() => {
    if (deliveryMethod === 'cdek_pickup' || deliveryMethod === 'spb_cdek') {
      setCdekData(deliveryTariffs.pickup ? { deliveryType: 'pvz', tariff: deliveryTariffs.pickup } : null);
    }
  }, [deliveryMethod, deliveryTariffs.pickup]);

  // Загрузка списка ПВЗ при выборе доставки в ПВЗ
  useEffect(() => {
    if ((deliveryMethod !== 'cdek_pickup' && deliveryMethod !== 'spb_cdek') || !selectedCity) {
      setPvzList([]);
      return;
    }
    setPvzLoading(true);
    const cityParam = selectedCity.city;
    fetch(`/api/delivery/cdek/pvz?city=${encodeURIComponent(cityParam)}`)
      .then((res) => res.json())
      .then((data) => {
        setPvzList(data.pvz || []);
      })
      .catch(() => setPvzList([]))
      .finally(() => setPvzLoading(false));
  }, [deliveryMethod, selectedCity?.city]);

  // Прокрутка списка ПВЗ к выбранному пункту (при выборе с карты)
  useEffect(() => {
    if (!cdekData?.pvzCode) return;
    const t = setTimeout(() => {
      document.getElementById('pvz-selected')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(t);
  }, [cdekData?.pvzCode]);

  // Обработка выбора города
  const handleCitySelect = (suggestion: CitySuggestion) => {
    setSelectedCity({
      code: suggestion.data.code,
      city: suggestion.data.city,
      region: suggestion.data.region,
      displayValue: suggestion.value,
      postal_code: suggestion.data.postal_code,
    });
    setCityInput(suggestion.value);
  };

  // Форматирование телефона
  const formatPhone = (value: string) => {
    let digits = value.replace(/\D/g, '');
    if (digits.length > 0 && digits[0] !== '7') {
      digits = '7' + digits;
    }
    digits = digits.slice(0, 11);
    
    if (digits.length === 0) return '';
    
    let formatted = '+7';
    if (digits.length > 1) formatted += ` (${digits.slice(1, 4)}`;
    if (digits.length > 4) formatted += `) ${digits.slice(4, 7)}`;
    if (digits.length > 7) formatted += `-${digits.slice(7, 9)}`;
    if (digits.length > 9) formatted += `-${digits.slice(9, 11)}`;
    
    return formatted;
  };

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  // Расчет итоговой стоимости
  let deliveryPrice = 0;
  if (isSpb && deliveryMethod === 'spb_courier') {
    deliveryPrice = totalPrice >= DELIVERY_CONFIG.SPB_FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CONFIG.SPB_COURIER_PRICE;
  } else if (isSpb && deliveryMethod === 'spb_boutique') {
    deliveryPrice = DELIVERY_CONFIG.BOUTIQUE_PICKUP_PRICE;
  } else if (deliveryMethod === 'cdek_courier' && deliveryPrices.door) {
    deliveryPrice = deliveryPrices.door;
  } else if (deliveryMethod === 'cdek_pickup' && deliveryPrices.pickup) {
    deliveryPrice = deliveryPrices.pickup;
  } else if (deliveryMethod === 'spb_cdek' && deliveryPrices.pickup) {
    deliveryPrice = deliveryPrices.pickup;
  }
  
  const finalPrice = totalPrice + deliveryPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Определяем deliveryMethod для API
      let apiDeliveryMethod: string = 'delivery';
      if (deliveryMethod === 'spb_boutique') apiDeliveryMethod = 'pickup';
      if (deliveryMethod?.includes('cdek') || deliveryMethod === 'spb_cdek') apiDeliveryMethod = 'cdek';

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            variant: item.variant,
          })),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email,
          phone,
          deliveryMethod: apiDeliveryMethod,
          paymentMethod,
          city: selectedCity?.city || null,
          address: deliveryMethod === 'spb_courier' || deliveryMethod === 'cdek_courier'
            ? `${address.street}, д. ${address.house}${address.apartment ? ', кв. ' + address.apartment : ''}`
            : null,
          orderComment: formData.comment?.trim() || null,
          courierComment: address.comment?.trim() || null,
          companyName: paymentMethod === 'invoice' ? formData.companyName : null,
          inn: paymentMethod === 'invoice' ? formData.inn : null,
          kpp: paymentMethod === 'invoice' ? formData.kpp : null,
          companyAddress: paymentMethod === 'invoice' ? formData.companyAddress : null,
          ...(apiDeliveryMethod === 'cdek' && cdekData && {
            cdekTariffCode: cdekData.tariff?.tariff_code,
            cdekTariffName: cdekData.tariff?.tariff_name,
            cdekDeliveryType: cdekData.deliveryType,
            cdekPvzCode: cdekData.pvzCode,
            cdekPvzAddress: cdekData.pvzAddress,
            cdekDeliveryCost: deliveryPrice,
          }),
        }),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const data = await response.json();
      localStorage.setItem('lastOrderData', JSON.stringify({
        orderNumber: data.order.orderNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
      }));

      router.push('/checkout/success');
      setTimeout(() => clearCart(), 100);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
      setIsSubmitting(false);
    }
  };

  const handleDownloadRequisites = () => {
    const requisites = `РЕКВИЗИТЫ ДЛЯ ОПЛАТЫ

ООО "ИДИЛЛЬ СПБ"
ИНН: 1234567890
КПП: 123456789
ОГРН: 1234567890123

Расчетный счет: 40702810100000000000
Банк: ПАО "Сбербанк России"
БИК: 044030653
Корр. счет: 30101810500000000653

Адрес: г. Санкт-Петербург, ул. Примерная, д. 1
Телефон: +7 (812) 123-45-67
Email: info@idylle.spb.ru

Сумма к оплате: ${totalPrice.toLocaleString('ru-RU')} ₽`.trim();

    const blob = new Blob([requisites], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requisites.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Оформление заказа</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Шаг 1: ОФОРМЛЕНИЕ ЗАКАЗА */}
              <Card>
                <CardHeader>
                  <CardTitle>ОФОРМЛЕНИЕ ЗАКАЗА</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Ваш телефон *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        required
                        placeholder="+7 (___) ___-__-__"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                      />
                      <p className="text-xs text-muted-foreground">Ваш телефон</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Ваш email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">для получения деталей заказа</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Шаг 2: СТРАНА И ГОРОД ДОСТАВКИ */}
              <Card>
                <CardHeader>
                  <CardTitle>СТРАНА И ГОРОД ДОСТАВКИ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-muted/50">
                      <span>🇷🇺</span>
                      <span className="font-medium">РОССИЯ</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="city">Населённый пункт</Label>
                      <CityAutocomplete
                        id="city"
                        value={cityInput}
                        onChange={setCityInput}
                        onSelect={handleCitySelect}
                        placeholder="Начните вводить название города"
                      />
                      {selectedCity && (
                        <p className="text-sm text-muted-foreground">
                          {selectedCity.region ? `${selectedCity.region}, ` : ''}{selectedCity.displayValue}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Шаг 3: СПОСОБ ДОСТАВКИ */}
              <Card>
                <CardHeader>
                  <CardTitle>СПОСОБ ДОСТАВКИ</CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedCity ? (
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border border-muted">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Введите свой город, чтобы перейти к выбору доставки
                      </p>
                    </div>
                  ) : (
                    <RadioGroup
                      value={deliveryMethod || ''}
                      onValueChange={(value) => {
                        const method = value as DeliveryMethod;
                        setDeliveryMethod(method);
                        if (method === 'spb_boutique') {
                          setPaymentMethod('pickup');
                        }
                      }}
                    >
                      {isSpb ? (
                        // СПб: 3 опции — весь блок кликабелен за счёт Label
                        <>
                          <Label
                            htmlFor="spb-courier"
                            className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="spb_courier" id="spb-courier" />
                              <div>
                                <div className="font-medium">Доставка курьером</div>
                                <div className="text-sm text-muted-foreground">
                                  По Санкт-Петербургу {totalPrice >= DELIVERY_CONFIG.SPB_FREE_DELIVERY_THRESHOLD ? '— бесплатно' : `— ${DELIVERY_CONFIG.SPB_COURIER_PRICE} ₽`}
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-lg">
                              {totalPrice >= DELIVERY_CONFIG.SPB_FREE_DELIVERY_THRESHOLD ? 'Бесплатно' : `${DELIVERY_CONFIG.SPB_COURIER_PRICE} ₽`}
                            </div>
                          </Label>

                          <Label
                            htmlFor="spb-boutique"
                            className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="spb_boutique" id="spb-boutique" />
                              <div className="font-medium">Самовывоз в Санкт-Петербурге из бутика</div>
                            </div>
                            <div className="font-bold text-lg">
                              {DELIVERY_CONFIG.BOUTIQUE_PICKUP_PRICE === 0 ? 'Бесплатно' : `${DELIVERY_CONFIG.BOUTIQUE_PICKUP_PRICE} ₽`}
                            </div>
                          </Label>

                          <Label
                            htmlFor="spb-cdek"
                            className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="spb_cdek" id="spb-cdek" />
                              <div>
                                <div className="font-medium">Доставка СДЭК</div>
                                <div className="text-sm text-muted-foreground">
                                  Самовывоз из пункта СДЭК
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-lg">
                              {deliveryPrices.isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : deliveryPrices.pickup ? (
                                `от ${deliveryPrices.pickup} руб.`
                              ) : deliveryPrices.error ? (
                                <span className="text-sm text-destructive">Ошибка</span>
                              ) : (
                                '...'
                              )}
                            </div>
                          </Label>
                        </>
                      ) : (
                        // Остальные города: 2 опции — весь блок кликабелен
                        <>
                          <Label
                            htmlFor="cdek-courier"
                            className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="cdek_courier" id="cdek-courier" />
                              <div className="font-medium">Курьером СДЭК</div>
                            </div>
                            <div className="font-bold text-lg">
                              {deliveryPrices.isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : doorPriceUpdating ? (
                                <span className="text-sm text-muted-foreground">пересчёт...</span>
                              ) : deliveryPrices.door ? (
                                `${deliveryPrices.door} руб.`
                              ) : deliveryPrices.error ? (
                                <span className="text-sm text-destructive">Ошибка</span>
                              ) : (
                                '...'
                              )}
                            </div>
                          </Label>

                          <Label
                            htmlFor="cdek-pickup"
                            className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                          >
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="cdek_pickup" id="cdek-pickup" />
                              <div className="font-medium">Самовывоз из пункта СДЭК</div>
                            </div>
                            <div className="font-bold text-lg">
                              {deliveryPrices.isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : deliveryPrices.pickup ? (
                                `от ${deliveryPrices.pickup} руб.`
                              ) : deliveryPrices.error ? (
                                <span className="text-sm text-destructive">Ошибка</span>
                              ) : (
                                '...'
                              )}
                            </div>
                          </Label>
                        </>
                      )}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>

              {/* АДРЕС ДОСТАВКИ (для курьера) */}
              {(deliveryMethod === 'spb_courier' || deliveryMethod === 'cdek_courier') && (
                <Card>
                  <CardHeader>
                    <CardTitle>АДРЕС ДОСТАВКИ</CardTitle>
                    {selectedCity && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Населённый пункт: {selectedCity.region ? `${selectedCity.region}, ` : ''}{selectedCity.displayValue}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address-autocomplete">Адрес *</Label>
                      <AddressAutocomplete
                        id="address-autocomplete"
                        value={addressLine}
                        onChange={setAddressLine}
                        city={selectedCity?.city}
                        placeholder="Введите улицу и дом — выберите из подсказок"
                        onSelect={(norm) => {
                          setAddressLine(norm.display);
                          setAddress((prev) => ({
                            ...prev,
                            street: norm.street ?? prev.street,
                            house: norm.house ?? prev.house,
                            apartment: norm.flat ?? prev.apartment,
                            postalCode: norm.postalCode ?? prev.postalCode,
                          }));
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Начните вводить от 3 символов. Подсказки только в выбранном городе.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Улица *</Label>
                        <Input
                          id="street"
                          required
                          value={address.street}
                          onChange={(e) => setAddress({ ...address, street: e.target.value })}
                          placeholder="Заполняется из подсказки или вручную"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="house">Дом / корпус *</Label>
                        <Input
                          id="house"
                          required
                          value={address.house}
                          onChange={(e) => setAddress({ ...address, house: e.target.value })}
                          placeholder="Номер дома"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apartment">Квартира</Label>
                      <Input
                        id="apartment"
                        value={address.apartment}
                        onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                        placeholder="Квартира (если не указана в подсказке)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courier-comment">Комментарий для курьера (необязательно)</Label>
                      <Textarea
                        id="courier-comment"
                        placeholder="Подъезд, этаж, код домофона и т.д."
                        value={address.comment}
                        onChange={(e) => setAddress({ ...address, comment: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ВЫБОР ПУНКТА ВЫДАЧИ СДЭК */}
              {(deliveryMethod === 'cdek_pickup' || deliveryMethod === 'spb_cdek') && (
                <Card>
                  <CardHeader>
                    <CardTitle>ПУНКТ ВЫДАЧИ СДЭК</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Выберите пункт выдачи в городе {selectedCity?.city}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {pvzLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground py-4">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Загрузка списка пунктов выдачи...</span>
                      </div>
                    ) : pvzList.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4">
                        Не удалось загрузить пункты выдачи. Проверьте город или попробуйте позже.
                      </p>
                    ) : (
                      <>
                        {pvzMapPoints.length > 0 && (
                          <div className="mb-4">
                            <PvzMap
                              points={pvzMapPoints}
                              selectedCode={cdekData?.pvzCode ?? null}
                              onSelect={handleSelectPvz}
                              height={280}
                            />
                          </div>
                        )}
                        <div className="space-y-2 max-h-72 overflow-y-auto" id="pvz-list">
                        {pvzList.map((pvz) => {
                          const addr = pvz.location?.address || pvz.name || '';
                          const isSelected = cdekData?.pvzCode === pvz.code;
                          return (
                            <button
                              key={pvz.code}
                              id={isSelected ? 'pvz-selected' : undefined}
                              type="button"
                              onClick={() =>
                                setCdekData((prev) =>
                                  prev
                                    ? { ...prev, pvzCode: pvz.code, pvzAddress: addr }
                                    : { deliveryType: 'pvz', tariff: deliveryTariffs.pickup ?? undefined, pvzCode: pvz.code, pvzAddress: addr }
                                )
                              }
                              className={`w-full text-left p-4 rounded-lg border-2 transition-colors flex gap-3 items-start ${
                                isSelected
                                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                                  : 'border-muted hover:border-primary/50'
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm flex items-center gap-2">
                                  {pvz.name}
                                  {isSelected && (
                                    <span className="text-xs font-normal text-primary">Выбрано</span>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground mt-0.5">{addr}</div>
                                {pvz.work_time && (
                                  <div className="text-xs text-muted-foreground mt-1">{pvz.work_time}</div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ВАШИ ДАННЫЕ */}
              <Card id="checkout-your-data">
                <CardHeader>
                  <CardTitle>ВАШИ ДАННЫЕ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Комментарий к заказу</Label>
                    <Textarea
                      id="comment"
                      placeholder="Пожелания к заказу"
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* СПОСОБ ОПЛАТЫ */}
              <Card>
                <CardHeader>
                  <CardTitle>СПОСОБ ОПЛАТЫ</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  >
                    {deliveryMethod === 'spb_boutique' && (
                      <Label
                        htmlFor="pay-pickup"
                        className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                      >
                        <RadioGroupItem value="pickup" id="pay-pickup" className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-medium mb-1">
                            <Store className="h-5 w-5" />
                            Оплата при самовывозе
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Оплатите заказ при получении в нашем бутике
                          </div>
                        </div>
                      </Label>
                    )}

                    {(deliveryMethod === 'spb_courier' || deliveryMethod === 'cdek_courier') && (
                      <>
                        <Label
                          htmlFor="pay-card"
                          className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                        >
                          <RadioGroupItem value="card" id="pay-card" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-medium mb-1">
                              <CreditCard className="h-5 w-5" />
                              Банковская карта онлайн
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Безопасная оплата на сайте
                            </div>
                          </div>
                        </Label>

                        <Label
                          htmlFor="pay-cash"
                          className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                        >
                          <RadioGroupItem value="cash" id="pay-cash" className="mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 font-medium mb-1">
                              <Banknote className="h-5 w-5" />
                              Наличные при получении
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Оплатите курьеру при доставке
                            </div>
                          </div>
                        </Label>
                      </>
                    )}

                    <Label
                      htmlFor="pay-invoice"
                      className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer w-full"
                    >
                      <RadioGroupItem value="invoice" id="pay-invoice" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium mb-1">
                          <FileText className="h-5 w-5" />
                          Безналичный расчёт для юрлиц
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Оплата по счёту с НДС
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>

                  {paymentMethod === 'invoice' && (
                    <Card className="mt-4 bg-muted/50">
                      <CardContent className="p-4 space-y-4">
                        <p className="text-sm font-medium">Реквизиты компании</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Название компании *</Label>
                            <Input
                              id="companyName"
                              required={paymentMethod === 'invoice'}
                              value={formData.companyName}
                              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="inn">ИНН *</Label>
                            <Input
                              id="inn"
                              required={paymentMethod === 'invoice'}
                              value={formData.inn}
                              onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="kpp">КПП</Label>
                            <Input
                              id="kpp"
                              value={formData.kpp}
                              onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyAddress">Юридический адрес *</Label>
                          <Textarea
                            id="companyAddress"
                            required={paymentMethod === 'invoice'}
                            value={formData.companyAddress}
                            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleDownloadRequisites}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Скачать наши реквизиты
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Auth/Guest Option */}
              {!session?.user && showGuestOption && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>У вас есть аккаунт?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Войдите, чтобы быстро оформить заказ или зарегистрируйтесь для отслеживания статуса.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        type="button" 
                        variant="default" 
                        className="flex-1"
                        onClick={() => router.push('/auth/signin?callbackUrl=/checkout')}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Войти
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => router.push('/auth/signup')}
                      >
                        Регистрация
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setShowGuestOption(false)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Оформить как гость
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ваш заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                          <Image
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            fill
                            className="object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {item.price.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-border"></div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Товары</span>
                      <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Доставка</span>
                      <span>
                        {deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice.toLocaleString('ru-RU')} ₽`}
                      </span>
                    </div>
                    <div className="h-px bg-border"></div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Итого</span>
                      <span>{finalPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={
                      isSubmitting ||
                      !selectedCity ||
                      !deliveryMethod ||
                      ((deliveryMethod === 'cdek_pickup' || deliveryMethod === 'spb_cdek') && !cdekData?.pvzCode) ||
                      ((deliveryMethod === 'spb_courier' || deliveryMethod === 'cdek_courier') && (!address.street?.trim() || !address.house?.trim()))
                    }
                  >
                    {isSubmitting ? (
                      'Оформляем...'
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Подтвердить заказ
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Нажимая кнопку, вы соглашаетесь с условиями{' '}
                    <Link href="/terms" className="underline">
                      пользовательского соглашения
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
