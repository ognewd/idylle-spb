import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMail, renderEmailTemplate, OrderEmailData } from '@/lib/mail';
import { ORDER_CONFIRMATION_TEMPLATE } from '@/lib/email-templates';
import { createCdekOrderFromCart } from '@/lib/cdek/create-order-from-cart';

export async function POST(request: NextRequest) {
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
      comment,
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
      notes: comment,
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

    const order = await prisma.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

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
            pvzCode: cdekPvzCode || undefined,
          },
          items: cdekItems,
          tariffCode: parseInt(cdekTariffCode),
          deliveryType: (cdekDeliveryType as 'door' | 'pvz') || 'door',
          comment: comment || undefined,
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
        deliveryAddress: address,
        paymentMethod,
        orderItems: items.map((item: any) => ({
          name: item.name,
          variantInfo: item.variant?.volume || item.variant?.size,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        totalAmount: total.toLocaleString('ru-RU', { useGrouping: true }).replace(/,/g, ' '),
        notes: comment,
        logoUrl,
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
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

