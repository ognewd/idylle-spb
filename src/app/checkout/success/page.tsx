'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Home, Package, Mail } from 'lucide-react';
import Link from 'next/link';

interface OrderData {
  orderNumber: string;
  firstName: string;
  lastName: string;
}

export default function CheckoutSuccessPage() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const searchParams = useSearchParams();
  const isDealerMode = searchParams.get('dealer') === '1';

  useEffect(() => {
    const storedOrderData = localStorage.getItem('lastOrderData');
    if (storedOrderData) {
      try {
        const data = JSON.parse(storedOrderData);
        setOrderData(data);
        // Clear it after retrieving
        localStorage.removeItem('lastOrderData');
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg mb-6 animate-bounce">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Спасибо{orderData?.firstName ? `, ${orderData.firstName}` : ''}!
            </h1>
            <p className="text-xl text-gray-600">
              Ваш заказ успешно оформлен
            </p>
          </div>

          {/* Main Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="p-8 md:p-12">
              {/* Order Number */}
              {orderData?.orderNumber && (
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-600 mb-2">Номер вашего заказа</p>
                  <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-xl shadow-lg">
                    <p className="text-3xl font-bold tracking-wider">{orderData.orderNumber}</p>
                  </div>
                </div>
              )}

              {/* Email Confirmation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Подтверждение на email</h3>
                    <p className="text-sm text-gray-600">
                      Мы отправили детали заказа на ваш email адрес. Пожалуйста, проверьте входящие сообщения.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Есть вопросы?
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {isDealerMode ? (
                    <>
                      <p>Наша служба поддержки работает ежедневно с 10:00 до 19:00</p>
                      <p>
                        Email:{' '}
                        <a href="mailto:opt@aromarussia.ru" className="font-medium text-purple-600 hover:text-purple-700">
                          opt@aromarussia.ru
                        </a>
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        Наша служба доставки работает ежедневно с 10:00 до 19:00
                      </p>
                      <p>
                        Телефон:{' '}
                        <a href="tel:88005008829" className="font-medium text-purple-600 hover:text-purple-700">
                          8-800-500-88-29
                        </a>
                      </p>
                      <p>
                        <a href="tel:+79217892777" className="font-medium text-purple-600 hover:text-purple-700">
                          8-921-789-27-77
                        </a>
                      </p>
                      <p>
                        Email:{' '}
                        <a href="mailto:zakaz@aromarussia.ru" className="font-medium text-purple-600 hover:text-purple-700">
                          zakaz@aromarussia.ru
                        </a>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" asChild>
                  <Link href={isDealerMode ? '/admin' : '/'}>
                    <Home className="mr-2 h-5 w-5" />
                    {isDealerMode ? 'В кабинет дилера' : 'На главную'}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="flex-1" asChild>
                  <Link href={isDealerMode ? '/catalog?dealer=1' : '/catalog'}>
                    <Package className="mr-2 h-5 w-5" />
                    {isDealerMode ? 'Вернуться к витрине' : 'Продолжить покупки'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Мы ценим ваш выбор и приложим все усилия, чтобы вы остались довольны своей покупкой!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
