import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank_transfer' | 'cash_delivery' | 'cash_pickup';
  isActive: boolean;
  commission: number;
  instructions?: string;
  config?: any;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

export class PaymentService {
  // Stripe payment
  static async createStripePaymentIntent(amount: number, orderId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to kopecks
        currency: 'rub',
        metadata: {
          orderId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      throw new Error('Payment processing failed');
    }
  }

  // YooKassa payment
  static async createYooKassaPayment(amount: number, orderId: string, returnUrl: string) {
    try {
      const response = await fetch('https://api.yookassa.ru/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
          ).toString('base64')}`,
          'Content-Type': 'application/json',
          'Idempotence-Key': orderId,
        },
        body: JSON.stringify({
          amount: {
            value: amount.toFixed(2),
            currency: 'RUB',
          },
          confirmation: {
            type: 'redirect',
            return_url: returnUrl,
          },
          capture: true,
          description: `Заказ №${orderId}`,
          metadata: {
            orderId,
          },
        }),
      });

      const payment = await response.json();
      return payment;
    } catch (error) {
      console.error('YooKassa payment creation failed:', error);
      throw new Error('Payment processing failed');
    }
  }

  // Tinkoff payment
  static async createTinkoffPayment(amount: number, orderId: string, returnUrl: string) {
    try {
      const response = await fetch('https://securepay.tinkoff.ru/v2/Init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          TerminalKey: process.env.TINKOFF_TERMINAL_KEY,
          Amount: Math.round(amount * 100), // Convert to kopecks
          OrderId: orderId,
          Description: `Заказ №${orderId}`,
          SuccessURL: returnUrl,
          FailURL: returnUrl,
          NotificationURL: `${process.env.NEXTAUTH_URL}/api/payments/tinkoff/callback`,
        }),
      });

      const payment = await response.json();
      return payment;
    } catch (error) {
      console.error('Tinkoff payment creation failed:', error);
      throw new Error('Payment processing failed');
    }
  }

  // Bank transfer details
  static getBankTransferDetails() {
    return {
      companyName: process.env.COMPANY_NAME,
      inn: process.env.COMPANY_INN,
      kpp: process.env.COMPANY_KPP,
      bank: process.env.COMPANY_BANK,
      bik: process.env.COMPANY_BIK,
      account: process.env.COMPANY_ACCOUNT,
      correspondent: process.env.COMPANY_CORRESPONDENT,
    };
  }

  // Calculate commission
  static calculateCommission(amount: number, paymentMethod: PaymentMethod): number {
    if (paymentMethod.commission === 0) return 0;
    return Math.round(amount * (paymentMethod.commission / 100) * 100) / 100;
  }
}
