'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Home, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [bankStatus, setBankStatus] = useState<string>('');
  const orderCreated = useRef(false);

  useEffect(() => {
    // Ищем данные заказа из нескольких источников (localStorage, sessionStorage, cookie, URL)
    const pendingRaw =
      localStorage.getItem('pendingBspbOrder') ||
      sessionStorage.getItem('pendingBspbOrder');
    let pendingOrder: Record<string, unknown> | null = null;
    let bspbOrderId: string | null = searchParams.get('id');

    if (pendingRaw) {
      try {
        pendingOrder = JSON.parse(pendingRaw);
        if (pendingOrder?.bspbOrderId) {
          bspbOrderId = String(pendingOrder.bspbOrderId);
        }
      } catch {
        // ignore parse error
      }
    }

    // Fallback: cookie
    if (!bspbOrderId) {
      const match = document.cookie.match(/(?:^|;\s*)bspbOrderId=(\d+)/);
      if (match) bspbOrderId = match[1];
    }

    if (!bspbOrderId) {
      setStatus('error');
      setBankStatus('Не удалось определить платёж. Попробуйте оформить заказ заново.');
      return;
    }

    // Проверяем статус оплаты в банке
    fetch(`/api/payments/bspb/callback?id=${bspbOrderId}`)
      .then((res) => res.json())
      .then(async (data) => {
        setBankStatus(data.bankStatus || '');

        if (data.error) {
          setStatus('error');
          return;
        }

        if (data.cancelled) {
          setStatus('error');
          setBankStatus('Оплата отменена. Вы можете вернуться к оформлению и попробовать снова.');
          return;
        }

        if (!data.paid) {
          setStatus('pending');
          return;
        }

        // Оплата успешна — создаём заказ, если ещё не создан
        if (data.orderNumber) {
          // Заказ уже создан (повторный визит)
          setOrderNumber(data.orderNumber);
          setFirstName(data.firstName);
          setStatus('success');
          localStorage.removeItem('pendingBspbOrder');
          sessionStorage.removeItem('pendingBspbOrder');
          document.cookie = 'bspbOrderId=; path=/; max-age=0';
          clearCart();
          return;
        }

        // Создаём заказ: приоритет серверным данным, localStorage как fallback
        if (orderCreated.current) return;
        orderCreated.current = true;

        const serverOrder = data.pendingOrderData
          ? (() => { try { return JSON.parse(data.pendingOrderData); } catch { return null; } })()
          : null;
        const orderSource = serverOrder || pendingOrder;

        if (!orderSource) {
          setStatus('error');
          setBankStatus('Оплата прошла, но данные заказа не найдены. Свяжитесь с нами.');
          return;
        }

        try {
          const orderRes = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...orderSource,
              bspbOrderId: String(bspbOrderId),
            }),
          });

          if (!orderRes.ok) throw new Error('Failed to create order');

          const orderData = await orderRes.json();
          setOrderNumber(orderData.order.orderNumber);
          setFirstName(String(pendingOrder.firstName || ''));
          setStatus('success');

          localStorage.removeItem('pendingBspbOrder');
          sessionStorage.removeItem('pendingBspbOrder');
          document.cookie = 'bspbOrderId=; path=/; max-age=0';
          localStorage.setItem('lastOrderData', JSON.stringify({
            orderNumber: orderData.order.orderNumber,
            firstName: pendingOrder.firstName || '',
            lastName: pendingOrder.lastName || '',
          }));

          clearCart();
        } catch (err) {
          console.error('Error creating order after payment:', err);
          setStatus('error');
          setBankStatus('Оплата прошла, но не удалось создать заказ. Свяжитесь с нами — платёж зафиксирован.');
        }
      })
      .catch(() => setStatus('error'));
  }, [searchParams, clearCart]);

  return (
    <div className="flex items-start justify-center px-4 py-12 md:py-20">
      <Card className="max-w-lg w-full shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-muted-foreground mb-4" />
              <CardTitle className="text-2xl">Проверяем оплату...</CardTitle>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg mx-auto mb-4">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl">
                Оплата прошла успешно!
              </CardTitle>
            </>
          )}
          {status === 'pending' && (
            <>
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-amber-500 mb-4" />
              <CardTitle className="text-2xl">Оплата обрабатывается</CardTitle>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-lg mx-auto mb-4">
                <XCircle className="h-12 w-12 text-white" />
              </div>
              <CardTitle className="text-2xl">Оплата не завершена</CardTitle>
            </>
          )}
        </CardHeader>

        <CardContent className="text-center space-y-6 pt-2">
          {status === 'success' && (
            <>
              {firstName && (
                <p className="text-lg text-muted-foreground">
                  Спасибо, {firstName}!
                </p>
              )}
              {orderNumber && (
                <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl shadow-lg">
                  <p className="text-xs opacity-80 mb-1">Номер заказа</p>
                  <p className="text-2xl font-bold tracking-wider">{orderNumber}</p>
                </div>
              )}
              <p className="text-muted-foreground">
                Мы отправили подтверждение на вашу электронную почту.
                Менеджер свяжется с вами для подтверждения заказа.
              </p>
            </>
          )}

          {status === 'pending' && (
            <p className="text-muted-foreground">
              {bankStatus
                ? `Статус в банке: ${bankStatus}. Платёж ещё обрабатывается — обновите страницу через пару минут.`
                : 'Платёж обрабатывается банком. Обновите страницу через несколько минут.'}
            </p>
          )}

          {status === 'error' && (
            <p className="text-muted-foreground">
              {bankStatus || 'Произошла ошибка при обработке платежа. Попробуйте ещё раз или свяжитесь с нами.'}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            {status === 'error' && (
              <Button
                size="lg"
                variant="default"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                asChild
              >
                <Link href="/checkout">
                  Вернуться к оформлению
                </Link>
              </Button>
            )}
            <Button
              size="lg"
              variant={status === 'error' ? 'outline' : 'default'}
              className={status !== 'error' ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' : ''}
              asChild
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                На главную
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/account/orders">
                <Package className="mr-2 h-5 w-5" />
                Мои заказы
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
