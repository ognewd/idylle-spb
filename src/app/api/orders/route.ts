import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMail, renderEmailTemplate, OrderEmailData } from '@/lib/mail';
import { ORDER_CONFIRMATION_TEMPLATE } from '@/lib/email-templates';

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
    } = body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    
    const shipping = deliveryMethod === 'delivery' && subtotal < 5000 ? 500 : 0;
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
    const order = await prisma.order.create({
      data: {
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
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

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

