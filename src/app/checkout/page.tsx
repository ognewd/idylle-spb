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
import { CreditCard, FileText, Banknote, Store, Download, CheckCircle, User, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type PaymentMethod = 'card' | 'invoice' | 'cash' | 'pickup';
type DeliveryMethod = 'delivery' | 'pickup';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { data: session } = useSession();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showGuestOption, setShowGuestOption] = useState(!session?.user);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Санкт-Петербург',
    comment: '',
    companyName: '',
    inn: '',
    kpp: '',
    companyAddress: '',
  });

  // Auto-fill form for logged-in users
  useEffect(() => {
    if (session?.user) {
      // Fetch user data to fill the form
      fetch('/api/user/me')
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            // Split name into first and last name if it exists
            const nameParts = data.name ? data.name.split(' ') : [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            setFormData(prev => ({
              ...prev,
              email: data.email || '',
              firstName: firstName,
              lastName: lastName,
              phone: data.phone || '',
            }));
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [session]);

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          email: formData.email,
          phone: formData.phone,
          deliveryMethod,
          paymentMethod,
          city: deliveryMethod === 'delivery' ? formData.city : null,
          address: deliveryMethod === 'delivery' ? formData.address : null,
          comment: formData.comment || null,
          companyName: paymentMethod === 'invoice' ? formData.companyName : null,
          inn: paymentMethod === 'invoice' ? formData.inn : null,
          kpp: paymentMethod === 'invoice' ? formData.kpp : null,
          companyAddress: paymentMethod === 'invoice' ? formData.companyAddress : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const data = await response.json();
      
      // Store order data for success page
      const orderData = {
        orderNumber: data.order.orderNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };
      localStorage.setItem('lastOrderData', JSON.stringify(orderData));

      // Redirect first, then clear cart
      router.push('/checkout/success');
      
      // Clear cart after a small delay to ensure navigation happens
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Произошла ошибка при оформлении заказа. Попробуйте еще раз.');
      setIsSubmitting(false);
    }
  };

  const handleDownloadRequisites = () => {
    // Create requisites text
    const requisites = `
РЕКВИЗИТЫ ДЛЯ ОПЛАТЫ

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

Сумма к оплате: ${totalPrice.toLocaleString('ru-RU')} ₽
    `.trim();

    // Create blob and download
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

  const deliveryPrice = deliveryMethod === 'delivery' && totalPrice < 5000 ? 500 : 0;
  const finalPrice = totalPrice + deliveryPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Оформление заказа</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Способ получения</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(value) => {
                      setDeliveryMethod(value as DeliveryMethod);
                      if (value === 'pickup') {
                        setPaymentMethod('pickup');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2 p-4 rounded-lg border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                        <div className="font-medium">Доставка курьером</div>
                        <div className="text-sm text-muted-foreground">
                          По Санкт-Петербургу {totalPrice >= 5000 ? '— бесплатно' : '— 500 ₽'}
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 rounded-lg border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        <div className="font-medium">Самовывоз из бутика</div>
                        <div className="text-sm text-muted-foreground">
                          г. Санкт-Петербург, Невский пр., д. 1
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
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

              {/* Logged in user info */}
              {session?.user && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{session.user.name || session.user.email}</p>
                          <p className="text-sm text-muted-foreground">
                            Вы авторизованы
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/auth/signin?callbackUrl=/checkout')}
                      >
                        Другой аккаунт
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Контактная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Имя *</Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия *</Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+7 (___) ___-__-__"
                      value={formData.phone}
                      onChange={(e) => {
                        // Remove all non-digits
                        let value = e.target.value.replace(/\D/g, '');
                        
                        // Ensure it starts with 7
                        if (value.length > 0 && value[0] !== '7') {
                          value = '7' + value;
                        }
                        
                        // Limit to 11 digits (7 + 10)
                        value = value.slice(0, 11);
                        
                        // Format the phone number
                        let formatted = '';
                        if (value.length > 0) {
                          formatted = '+7';
                          if (value.length > 1) {
                            formatted += ' (' + value.slice(1, 4);
                            if (value.length > 4) {
                              formatted += ') ' + value.slice(4, 7);
                              if (value.length > 7) {
                                formatted += '-' + value.slice(7, 9);
                                if (value.length > 9) {
                                  formatted += '-' + value.slice(9, 11);
                                }
                              }
                            }
                          }
                        }
                        
                        setFormData({ ...formData, phone: formatted });
                      }}
                    />
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="city">Город *</Label>
                        <Input
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Адрес доставки *</Label>
                        <Textarea
                          id="address"
                          required
                          placeholder="Улица, дом, квартира"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </>
                  )}

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

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Способ оплаты</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  >
                    {deliveryMethod === 'pickup' && (
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

                    {deliveryMethod === 'delivery' && (
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
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Ваш заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
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

                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Товары</span>
                      <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Доставка</span>
                      <span>
                        {deliveryPrice === 0 ? 'Бесплатно' : `${deliveryPrice} ₽`}
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
                    disabled={isSubmitting}
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
                    <a href="#" className="underline">
                      пользовательского соглашения
                    </a>
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

