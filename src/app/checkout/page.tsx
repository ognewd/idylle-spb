'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
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
import { DELIVERY_CONFIG, isSaintPetersburg } from '@/lib/delivery-config';

type PaymentMethod = 'card' | 'invoice' | 'cash' | 'pickup';
type DeliveryMethod = 'spb_courier' | 'spb_boutique' | 'spb_cdek' | 'cdek_courier' | 'cdek_pickup';

interface SelectedCity {
  code: number;
  city: string;
  region: string;
  displayValue: string; // "190000, г, Санкт-Петербург"
}

interface DeliveryPrice {
  door?: number; // цена до двери
  pickup?: number; // цена до ПВЗ
  isLoading: boolean;
  error?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
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
  
  // Данные СДЕК
  const [cdekData, setCdekData] = useState<{
    tariff?: { tariff_code: number; tariff_name: string; delivery_sum: number; period_min: number; period_max: number };
    pvzCode?: string;
    pvzAddress?: string;
    deliveryType?: 'door' | 'pvz';
  } | null>(null);
  
  // Адрес доставки
  const [address, setAddress] = useState({
    street: '',
    house: '',
    apartment: '',
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
        const weight = DELIVERY_CONFIG.DEFAULT_PACKAGE.weight;
        
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
        
        // Ищем тарифы для до двери и до ПВЗ
        const doorTariff = tariffs.find((t: any) => 
          t.tariff_code === 139 || t.delivery_mode === 1 || t.tariff_name?.toLowerCase().includes('дверь')
        );
        const pickupTariff = tariffs.find((t: any) => 
          t.tariff_code === 138 || t.delivery_mode === 2 || t.tariff_name?.toLowerCase().includes('склад')
        );

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
  }, [selectedCity, isSpb]);

  // Сброс способа доставки при смене города
  useEffect(() => {
    setDeliveryMethod(null);
    setCdekData(null);
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

  // Обработка выбора города
  const handleCitySelect = (suggestion: CitySuggestion) => {
    setSelectedCity({
      code: suggestion.data.code,
      city: suggestion.data.city,
      region: suggestion.data.region,
      displayValue: suggestion.value,
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
          comment: formData.comment || address.comment || null,
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
                        // СПб: 3 опции
                        <>
                          <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="spb_courier" id="spb-courier" />
                              <Label htmlFor="spb-courier" className="cursor-pointer">
                                <div className="font-medium">Доставка курьером</div>
                                <div className="text-sm text-muted-foreground">
                                  По Санкт-Петербургу {totalPrice >= DELIVERY_CONFIG.SPB_FREE_DELIVERY_THRESHOLD ? '— бесплатно' : `— ${DELIVERY_CONFIG.SPB_COURIER_PRICE} ₽`}
                                </div>
                              </Label>
                            </div>
                            <div className="font-bold text-lg">
                              {totalPrice >= DELIVERY_CONFIG.SPB_FREE_DELIVERY_THRESHOLD ? 'Бесплатно' : `${DELIVERY_CONFIG.SPB_COURIER_PRICE} ₽`}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="spb_boutique" id="spb-boutique" />
                              <Label htmlFor="spb-boutique" className="cursor-pointer">
                                <div className="font-medium">Самовывоз из бутика</div>
                                <div className="text-sm text-muted-foreground">
                                  {DELIVERY_CONFIG.BOUTIQUE_ADDRESS}
                                </div>
                              </Label>
                            </div>
                            <div className="font-bold text-lg">
                              {DELIVERY_CONFIG.BOUTIQUE_PICKUP_PRICE === 0 ? 'Бесплатно' : `${DELIVERY_CONFIG.BOUTIQUE_PICKUP_PRICE} ₽`}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="spb_cdek" id="spb-cdek" />
                              <Label htmlFor="spb-cdek" className="cursor-pointer">
                                <div className="font-medium">Доставка СДЭК</div>
                                <div className="text-sm text-muted-foreground">
                                  Самовывоз из пункта СДЭК
                                </div>
                              </Label>
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
                          </div>
                        </>
                      ) : (
                        // Остальные города: 2 опции
                        <>
                          <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="cdek_courier" id="cdek-courier" />
                              <Label htmlFor="cdek-courier" className="cursor-pointer">
                                <div className="font-medium">Курьером СДЭК</div>
                              </Label>
                            </div>
                            <div className="font-bold text-lg">
                              {deliveryPrices.isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : deliveryPrices.door ? (
                                `от ${deliveryPrices.door} руб.`
                              ) : deliveryPrices.error ? (
                                <span className="text-sm text-destructive">Ошибка</span>
                              ) : (
                                '...'
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary cursor-pointer">
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value="cdek_pickup" id="cdek-pickup" />
                              <Label htmlFor="cdek-pickup" className="cursor-pointer">
                                <div className="font-medium">Самовывоз из пункта СДЭК</div>
                              </Label>
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
                          </div>
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
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Улица *</Label>
                      <Input
                        id="street"
                        required
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="house">Номер дома / корпус / строение / литера *</Label>
                        <Input
                          id="house"
                          required
                          value={address.house}
                          onChange={(e) => setAddress({ ...address, house: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="apartment">Квартира</Label>
                        <Input
                          id="apartment"
                          value={address.apartment}
                          onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                        />
                      </div>
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

              {/* ВАШИ ДАННЫЕ */}
              <Card>
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
                      <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer">
                        <RadioGroupItem value="pickup" id="pay-pickup" className="mt-1" />
                        <Label htmlFor="pay-pickup" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2 font-medium mb-1">
                            <Store className="h-5 w-5" />
                            Оплата при самовывозе
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Оплатите заказ при получении в нашем бутике
                          </div>
                        </Label>
                      </div>
                    )}

                    {(deliveryMethod === 'spb_courier' || deliveryMethod === 'cdek_courier') && (
                      <>
                        <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer">
                          <RadioGroupItem value="card" id="pay-card" className="mt-1" />
                          <Label htmlFor="pay-card" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 font-medium mb-1">
                              <CreditCard className="h-5 w-5" />
                              Банковская карта онлайн
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Безопасная оплата на сайте
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer">
                          <RadioGroupItem value="cash" id="pay-cash" className="mt-1" />
                          <Label htmlFor="pay-cash" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2 font-medium mb-1">
                              <Banknote className="h-5 w-5" />
                              Наличные при получении
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Оплатите курьеру при доставке
                            </div>
                          </Label>
                        </div>
                      </>
                    )}

                    <div className="flex items-start space-x-3 p-4 rounded-lg border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="invoice" id="pay-invoice" className="mt-1" />
                      <Label htmlFor="pay-invoice" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 font-medium mb-1">
                          <FileText className="h-5 w-5" />
                          Безналичный расчёт для юрлиц
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Оплата по счёту с НДС
                        </div>
                      </Label>
                    </div>
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
                            src={item.image || '/placeholder-product.jpg'}
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
                    disabled={isSubmitting || !selectedCity || !deliveryMethod}
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
