import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMail, sendPartnerMail, renderEmailTemplate, OrderEmailData } from '@/lib/mail';
import { ORDER_CONFIRMATION_TEMPLATE } from '@/lib/email-templates';
import { createCdekOrderFromCart } from '@/lib/cdek/create-order-from-cart';
import { checkRateLimit, getRateLimitOptionsForEndpoint } from '@/lib/rate-limit';
import { BspbPaymentService } from '@/lib/bspb';

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
      // БСПБ: передаётся, если платёж уже создан до создания заказа
      bspbOrderId,
      orderType,
      dealerProfileId,
    } = body;

    const isDealerOrder = orderType === 'dealer' && !!dealerProfileId;

    let normalizedItems: Array<any> = items;

    // Calculate totals
    let subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    if (isDealerOrder) {
      const dealer = await prisma.dealerProfile.findUnique({
        where: { id: String(dealerProfileId) },
        include: {
          brandAccesses: true,
          categoryAccesses: true,
          productDiscounts: true,
          categoryDiscounts: true,
          brandDiscountTiers: true,
          categoryDiscountTiers: true,
        },
      });
      if (!dealer || dealer.status !== 'active') {
        return NextResponse.json({ error: 'Дилерский профиль недоступен' }, { status: 403 });
      }

      const productIds = items.map((i: any) => String(i.productId));
      const products = await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        include: {
          productCategories: true,
        },
      });
      const byId = new Map(products.map((p) => [p.id, p]));
      const allowedBrandIds = new Set(dealer.brandAccesses.map((x) => x.brandId));
      const allowedCategoryIds = new Set(dealer.categoryAccesses.map((x) => x.categoryId));
      const brandDiscountMap = new Map(dealer.brandAccesses.map((x) => [x.brandId, Number(x.discountPercent)]));
      const productDiscountMap = new Map(dealer.productDiscounts.map((x) => [x.productId, Number(x.discountPercent)]));
      const categoryDiscountMap = new Map(dealer.categoryDiscounts.map((x) => [x.categoryId, Number(x.discountPercent)]));
      const brandTierMap = new Map<string, Array<{ minQty: number; maxQty: number | null; discountPercent: number }>>();
      const categoryTierMap = new Map<string, Array<{ minQty: number; maxQty: number | null; discountPercent: number }>>();

      dealer.brandDiscountTiers.forEach((tier) => {
        const list = brandTierMap.get(tier.brandId) || [];
        list.push({
          minQty: Number(tier.minQty),
          maxQty: tier.maxQty == null ? null : Number(tier.maxQty),
          discountPercent: Number(tier.discountPercent),
        });
        brandTierMap.set(tier.brandId, list);
      });
      dealer.categoryDiscountTiers.forEach((tier) => {
        const list = categoryTierMap.get(tier.categoryId) || [];
        list.push({
          minQty: Number(tier.minQty),
          maxQty: tier.maxQty == null ? null : Number(tier.maxQty),
          discountPercent: Number(tier.discountPercent),
        });
        categoryTierMap.set(tier.categoryId, list);
      });
      const resolveTierDiscount = (
        tiers: Array<{ minQty: number; maxQty: number | null; discountPercent: number }> | undefined,
        qty: number
      ) => {
        if (!tiers || tiers.length === 0) return null;
        const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty);
        const found = sorted.find((tier) => qty >= tier.minQty && (tier.maxQty == null || qty <= tier.maxQty));
        return found ? found.discountPercent : null;
      };

      normalizedItems = items.map((item: any) => {
        const product = byId.get(String(item.productId));
        if (!product) {
          throw new Error(`Товар ${item.productId} недоступен`);
        }
        if (!allowedBrandIds.has(product.brandId)) {
          throw new Error(`Товар ${product.name} не доступен дилеру`);
        }
        const productCategoryIds = product.productCategories.map((pc) => pc.categoryId);
        if (allowedCategoryIds.size > 0 && !productCategoryIds.some((categoryId) => allowedCategoryIds.has(categoryId))) {
          throw new Error(`Категория товара ${product.name} не доступна дилеру`);
        }
        const productDiscount = productDiscountMap.get(product.id);
        const brandDiscount = brandDiscountMap.get(product.brandId);
        const qty = Number(item.quantity || 0);
        const brandTierDiscount = resolveTierDiscount(brandTierMap.get(product.brandId), qty);
        let categoryDiscount = 0;
        let categoryTierDiscount = 0;
        for (const pc of product.productCategories) {
          const v = categoryDiscountMap.get(pc.categoryId) || 0;
          if (v > categoryDiscount) categoryDiscount = v;
          const tierV = resolveTierDiscount(categoryTierMap.get(pc.categoryId), qty) || 0;
          if (tierV > categoryTierDiscount) categoryTierDiscount = tierV;
        }
        const discountPercent = productDiscount ?? brandTierDiscount ?? brandDiscount ?? categoryTierDiscount ?? categoryDiscount ?? 0;
        const basePrice = Number(product.price);
        const finalUnitPrice = discountPercent > 0 ? Math.max(0, Math.round(basePrice * (100 - discountPercent) / 100)) : basePrice;
        return {
          ...item,
          name: product.name,
          price: finalUnitPrice,
          quantity: qty,
        };
      });

      subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
    
    // Если выбрана доставка СДЕК, используем стоимость из параметров, иначе старую логику
    let shipping = 0;
    if (isDealerOrder) {
      shipping = 0;
    } else if (deliveryMethod === 'cdek' && cdekDeliveryCost) {
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
      deliveryMethod: isDealerOrder ? 'pickup' : deliveryMethod,
      paymentMethod: isDealerOrder ? 'invoice' : paymentMethod,
      city: isDealerOrder ? null : city,
      deliveryAddress: address,
      orderType: isDealerOrder ? 'dealer' : 'retail',
      dealerProfileId: isDealerOrder ? String(dealerProfileId) : null,
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
        create: normalizedItems.map((item: any) => ({
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
    console.log(`📦 [CDEK] deliveryMethod=${deliveryMethod}, cdekTariffCode=${cdekTariffCode}, cdekDeliveryType=${cdekDeliveryType}, cdekPvzCode=${cdekPvzCode}`);
    if (deliveryMethod === 'cdek' && cdekTariffCode) {
      try {
        const cdekItems = normalizedItems.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          cost: Number(item.price),
          weight: 500,
          ware_key: item.productId,
        }));

        const cdekPayload = {
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
        };

        console.log('📦 [CDEK] Отправляем в СДЕК:', JSON.stringify(cdekPayload, null, 2));

        const cdekOrderResult = await createCdekOrderFromCart(cdekPayload);

        console.log('📦 [CDEK] Ответ СДЕК:', JSON.stringify(cdekOrderResult, null, 2));

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
          console.log(`✅ [CDEK] Заказ ${orderNumber} создан в СДЕК: uuid=${cdekUuid}, number=${cdekNumber}`);
        } else {
          console.warn('⚠️ [CDEK] createCdekOrderFromCart вернул пустой результат');
        }
      } catch (cdekError: any) {
        console.error('❌ [CDEK] Ошибка создания заказа в СДЕК:', cdekError?.message || cdekError);
        if (cdekError?.response) {
          console.error('❌ [CDEK] Ответ API:', JSON.stringify(cdekError.response, null, 2));
        }
      }
    } else {
      console.log(`📦 [CDEK] Пропуск: deliveryMethod=${deliveryMethod}, cdekTariffCode=${cdekTariffCode || 'не задан'}`);
    }

    // Если при создании заказа передан bspbOrderId — проверяем оплату в банке
    if (bspbOrderId) {
      const PAID_STATUSES = ['Paid', 'Approved', 'Completed', 'Deposited'];
      let verified = false;
      let bankStatusStr = 'Unknown';
      try {
        const bankStatus = await BspbPaymentService.getOrderStatus(bspbOrderId);
        bankStatusStr = bankStatus.status || 'Unknown';
        verified = PAID_STATUSES.some((s) => bankStatusStr.includes(s));
        console.log(`💳 [BSPB] Проверка оплаты ${bspbOrderId}: status=${bankStatusStr}, verified=${verified}`);
      } catch (err: any) {
        console.error(`❌ [BSPB] Не удалось проверить оплату ${bspbOrderId}:`, err?.message);
      }

      await prisma.order.update({
        where: { id: order.id },
        data: {
          bspbOrderId: String(bspbOrderId),
          bspbStatus: bankStatusStr,
          paymentStatus: verified ? 'paid' : 'pending',
          status: verified ? 'confirmed' : undefined,
        },
      });
    }

    // Send order confirmation email
    try {
      if (isDealerOrder) {
        const dealer = await prisma.dealerProfile.findUnique({
          where: { id: String(dealerProfileId) },
          select: { companyName: true, requisites: true, contacts: true },
        });
        const csvRows = [
          ['SKU', 'Товар', 'Вариант', 'Количество', 'Цена', 'Сумма'],
          ...normalizedItems.map((item: any) => [
            item.productId || '',
            item.name || '',
            item.variant?.volume || item.variant?.size || '',
            String(item.quantity || 0),
            String(item.price || 0),
            String((item.price || 0) * (item.quantity || 0)),
          ]),
        ];
        const csvContent = csvRows
          .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
          .join('\n');

        const orderLines = normalizedItems
          .map((item: any) => `- ${item.name} (${item.variant?.volume || item.variant?.size || 'базовый вариант'}) x ${item.quantity} = ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`)
          .join('<br/>');

        const managerMail = {
          to: 'opt@aromarussia.ru',
          subject: `Оптовый заказ ${orderNumber} от ${dealer?.companyName || companyName || email}`,
          html: `
            <h2>Новый оптовый заказ ${orderNumber}</h2>
            <p><strong>Компания:</strong> ${dealer?.companyName || companyName || '—'}</p>
            <p><strong>Контакты:</strong><br/>${(dealer?.contacts || '').replace(/\n/g, '<br/>') || '—'}</p>
            <p><strong>Реквизиты:</strong><br/>${(dealer?.requisites || '').replace(/\n/g, '<br/>') || '—'}</p>
            <p><strong>Состав заказа:</strong><br/>${orderLines}</p>
            <p><strong>Итого:</strong> ${total.toLocaleString('ru-RU')} ₽</p>
          `,
          text: `Новый оптовый заказ ${orderNumber}\nКомпания: ${dealer?.companyName || companyName || '—'}\nИтого: ${total}\n`,
          attachments: [
            {
              filename: `dealer-order-${orderNumber}.csv`,
              content: csvContent,
              contentType: 'text/csv; charset=utf-8',
            },
          ],
        } as const;

        const managerSendResult = await sendMail(managerMail);
        if (!managerSendResult.success) {
          console.warn('Primary SMTP failed for dealer order email, trying partner SMTP fallback:', managerSendResult.error);
          const fallbackResult = await sendPartnerMail(managerMail);
          if (!fallbackResult.success) {
            console.error('Fallback SMTP also failed for dealer order email:', fallbackResult.error);
          }
        }

        await sendMail({
          to: email,
          subject: `Ваш оптовый заказ ${orderNumber} принят`,
          html: `
            <h2>Спасибо за заказ</h2>
            <p>Заказ <strong>${orderNumber}</strong> принят в обработку.</p>
            <p><strong>Состав заказа:</strong></p>
            <p>${orderLines}</p>
            <p><strong>Итого:</strong> ${total.toLocaleString('ru-RU')} ₽</p>
            <p>Ждите подтверждения и счет.</p>
          `,
          text: `Заказ ${orderNumber} принят.\nСостав заказа:\n${normalizedItems
            .map((item: any) => `- ${item.name} (${item.variant?.volume || item.variant?.size || 'базовый вариант'}) x ${item.quantity} = ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`)
            .join('\n')}\nИтого: ${total.toLocaleString('ru-RU')} ₽\nЖдите подтверждения и счет.`,
        });
      } else {
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
        card: 'Банковская карта онлайн',
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
        orderItems: normalizedItems.map((item: any) => ({
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
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({ 
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
      },
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

