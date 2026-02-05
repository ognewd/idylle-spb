import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMail, renderEmailTemplate, OrderEmailData } from '@/lib/mail';
import { ORDER_CONFIRMATION_TEMPLATE } from '@/lib/email-templates';
import { createCdekOrderFromCart } from '@/lib/cdek/create-order-from-cart';
import { checkRateLimit, getRateLimitOptionsForEndpoint } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const opts = await getRateLimitOptionsForEndpoint('orders');
  const rateLimitResponse = checkRateLimit(request, opts);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const {
      items,
      firstName,
      lastName,
      email,
      phone,
      deliveryMethod,
      paymentMethod,
      city,
      address,
      addressPostalCode,
      comment,
      orderComment,
      courierComment,
      companyName,
      inn,
      kpp,
      companyAddress,
      // Поля СДЕК
      cdekTariffCode,
      cdekTariffName,
      cdekDeliveryType,
      cdekPvzCode,
      cdekPvzAddress,
      cdekDeliveryCost,
      cdekDeliveryDateMin,
      cdekDeliveryDateMax,
    } = body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    
    // Если выбрана доставка СДЕК, используем стоимость из параметров, иначе старую логику
    let shipping = 0;
    if (deliveryMethod === 'cdek' && cdekDeliveryCost) {
      shipping = parseFloat(cdekDeliveryCost);
    } else if (deliveryMethod === 'delivery' && subtotal < 5000) {
      shipping = 500;
    }
    const total = subtotal + shipping;

    // Generate order number - get the latest order count
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { orderNumber: true },
    });
    
    let orderCount = 1;
    if (lastOrder?.orderNumber) {
      const match = lastOrder.orderNumber.match(/^idy(\d+)$/);
      if (match) {
        orderCount = parseInt(match[1]) + 1;
      }
    }
    
    const orderNumber = `idy${orderCount}`;

    // Create order with items
    const orderData: any = {
      orderNumber,
      userId: session?.user?.id || null, // Link to user if logged in
      firstName,
      lastName,
      email,
      phone,
      deliveryMethod,
      paymentMethod,
      city,
      deliveryAddress: address,
      notes: (orderComment != null && String(orderComment).trim() !== '' ? String(orderComment).trim() : (comment != null && String(comment).trim() !== '' ? String(comment).trim() : null)),
      courierComment: courierComment != null && String(courierComment).trim() !== '' ? String(courierComment).trim() : null,
      companyName,
      inn,
      kpp,
      companyAddress,
      subtotal,
      shipping,
      total,
      status: 'pending',
      paymentStatus: 'pending',
      items: {
        create: items.map((item: any) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          variantInfo: item.variant?.volume || item.variant?.size,
        })),
      },
    };

    // Добавляем поля СДЕК, если доставка через СДЕК
    if (deliveryMethod === 'cdek') {
      orderData.cdekTariffCode = cdekTariffCode ? parseInt(cdekTariffCode) : null;
      orderData.cdekTariffName = cdekTariffName || null;
      orderData.cdekDeliveryType = cdekDeliveryType || null;
      orderData.cdekPvzCode = cdekPvzCode || null;
      orderData.cdekPvzAddress = cdekPvzAddress || null;
      orderData.cdekDeliveryCost = cdekDeliveryCost ? parseFloat(cdekDeliveryCost) : null;
      orderData.cdekDeliveryDateMin = cdekDeliveryDateMin ? new Date(cdekDeliveryDateMin) : null;
      orderData.cdekDeliveryDateMax = cdekDeliveryDateMax ? new Date(cdekDeliveryDateMax) : null;
    }

    let order: { id: string; orderNumber: string; items: unknown[] };
    try {
      order = await prisma.order.create({
        data: orderData,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    } catch (createError: unknown) {
      const errMsg = createError instanceof Error ? createError.message : String(createError);
      const isMissingColumn = /courierComment|does not exist|Unknown column/i.test(errMsg);
      if (isMissingColumn) {
        const courierText = orderData.courierComment;
        delete orderData.courierComment;
        if (courierText) {
          orderData.notes = [orderData.notes, courierText].filter(Boolean).join('\n\n[Комментарий для курьера]\n');
        }
        order = await prisma.order.create({
          data: orderData,
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      } else {
        throw createError;
      }
    }

    // Если доставка через СДЕК, создаем заказ в СДЕК
    if (deliveryMethod === 'cdek' && cdekTariffCode) {
      try {
        // Получаем данные товаров для создания заказа в СДЕК
        const cdekItems = items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          cost: Number(item.price),
          weight: 500, // TODO: получать реальный вес товара из БД (по умолчанию 500г)
          ware_key: item.productId,
        }));

        const cdekOrderResult = await createCdekOrderFromCart({
          sender: {
            name: 'AROMA BOUTIQUE IDYLLE',
            phone: '8-800-500-87-29',
            email: 'info@idylle.spb.ru',
          },
          recipient: {
            name: `${firstName} ${lastName}`,
            phone: phone,
            email: email,
            city: city || '',
            address: address || undefined,
            postal_code: addressPostalCode || undefined,
            pvzCode: cdekPvzCode || undefined,
          },
          items: cdekItems,
          tariffCode: parseInt(cdekTariffCode),
          deliveryType: (cdekDeliveryType as 'door' | 'pvz') || 'door',
          comment: [orderComment, courierComment].filter(Boolean).join('\n') || undefined,
          orderNumber: orderNumber,
        });

        // Обновляем заказ с данными из СДЕК
        if (cdekOrderResult) {
          const cdekUuid = cdekOrderResult.entity?.uuid || cdekOrderResult.request_uuid;
          const cdekNumber = cdekOrderResult.entity?.cdek_number || cdekOrderResult.cdek_number || cdekOrderResult.number;
          
          await prisma.order.update({
            where: { id: order.id },
            data: {
              cdekOrderUuid: cdekUuid || undefined,
              cdekOrderNumber: cdekNumber || undefined,
              cdekStatus: cdekOrderResult.statuses?.[0]?.code || 'pending',
              cdekStatusUpdatedAt: new Date(),
            },
          });
        }

        console.log('✅ Заказ создан в СДЕК:', cdekOrderResult);
      } catch (cdekError: any) {
        console.error('❌ Ошибка создания заказа в СДЕК:', cdekError);
        // Не прерываем создание заказа, но логируем ошибку
        // Заказ создан в нашей БД, но не в СДЕК - нужно будет создать вручную
      }
    }

    // Send order confirmation email
    try {
      const logoUrl = process.env.NEXT_PUBLIC_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/logo-idylle.png`
        : 'http://localhost:3000/logo-idylle.png';

      const deliveryMethodLabels: Record<string, string> = {
        delivery: 'Доставка курьером',
        pickup: 'Самовывоз из бутика',
        cdek: cdekDeliveryType === 'pvz'
          ? (cdekPvzAddress ? `СДЭК, самовывоз из ПВЗ: ${cdekPvzAddress}` : 'СДЭК, самовывоз из ПВЗ')
          : 'СДЭК, доставка курьером',
      };
      const paymentMethodLabels: Record<string, string> = {
        card: 'Карта онлайн',
        cash: 'Наличные при получении',
        invoice: 'Безналичный расчёт для юрлиц',
        pickup: 'Оплата при самовывозе',
      };

      const emailData: OrderEmailData = {
        orderNumber: order.orderNumber,
        orderDate: new Date().toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        firstName,
        lastName,
        email,
        phone,
        deliveryMethod,
        deliveryMethodLabel: deliveryMethodLabels[deliveryMethod] || deliveryMethod,
        city: city || undefined,
        deliveryAddress: address,
        paymentMethod,
        paymentMethodLabel: paymentMethodLabels[paymentMethod] || paymentMethod,
        orderItems: items.map((item: any) => ({
          name: item.name,
          variantInfo: item.variant?.volume || item.variant?.size,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        totalAmount: total.toLocaleString('ru-RU', { useGrouping: true }).replace(/,/g, ' '),
        shippingAmount: shipping > 0 ? shipping.toLocaleString('ru-RU', { useGrouping: true }).replace(/,/g, ' ') : undefined,
        orderComment: orderComment != null && String(orderComment).trim() !== '' ? String(orderComment).trim() : undefined,
        courierComment: courierComment != null && String(courierComment).trim() !== '' ? String(courierComment).trim() : undefined,
        logoUrl,
        companyName,
        inn,
        kpp,
        companyAddress,
        cdekPvzAddress: cdekPvzAddress || undefined,
        cdekDeliveryCost: cdekDeliveryCost != null ? String(cdekDeliveryCost) : undefined,
        cdekTariffName: cdekTariffName || undefined,
      };

      const emailSubject = renderEmailTemplate(ORDER_CONFIRMATION_TEMPLATE.subject, emailData);
      const emailBody = renderEmailTemplate(ORDER_CONFIRMATION_TEMPLATE.htmlBody, emailData);

      await sendMail({
        to: email,
        subject: emailSubject,
        html: emailBody,
      });

      console.log('📧 Order confirmation email sent to', email);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({ 
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
      }
    });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    const message = error instanceof Error ? error.message : 'Failed to create order';
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      { error: isDev ? message : 'Failed to create order' },
      { status: 500 }
    );
  }
}

