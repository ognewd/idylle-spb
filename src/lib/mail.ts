import nodemailer from 'nodemailer';
import { prisma } from './prisma';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderEmailData {
  orderNumber: string;
  orderDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  paymentMethod: string;
  orderItems: Array<{
    name: string;
    variantInfo?: string | null;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: string;
  notes?: string;
  logoUrl: string;
}

let transporter: nodemailer.Transporter | null = null;

export async function getMailTransporter() {
  // Clear transporter to get fresh settings
  transporter = null;

  // Try to get settings from database
  const smtpSettings = await prisma.settings.findMany({
    where: {
      key: {
        startsWith: 'SMTP_',
      },
    },
  });

  // Convert to object
  const settings: any = {};
  smtpSettings.forEach(setting => {
    const key = setting.key.replace('SMTP_', '');
    settings[key] = setting.value;
  });

  // Use database settings if available, otherwise fall back to env
  const smtpConfig = {
    host: settings.HOST || process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(settings.PORT || process.env.SMTP_PORT || '587'),
    secure: (settings.PORT || process.env.SMTP_PORT) === '465',
    auth: {
      user: settings.USER || process.env.SMTP_USER || '',
      pass: settings.PASS || process.env.SMTP_PASS || '',
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  transporter = nodemailer.createTransport(smtpConfig);

  try {
    await transporter.verify();
    console.log('✅ SMTP server connection verified');
  } catch (error) {
    console.error('❌ SMTP server connection failed:', error);
  }

  return transporter;
}

export async function sendMail(options: MailOptions) {
  try {
    const transporter = await getMailTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@idylle.spb.ru',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function testSMTPConnection() {
  try {
    const transporter = await getMailTransporter();
    await transporter.verify();
    return { success: true, message: 'SMTP connection successful' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function renderEmailTemplate(template: string, data: OrderEmailData): string {
  let result = template;

  // Replace simple variables
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    return (data as any)[key] !== undefined ? String((data as any)[key]) : '';
  });

  // Handle {{#if}} blocks
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, condition, content) => {
    const value = (data as any)[condition];
    return value ? content : '';
  });

  // Handle {{#each}} blocks
  result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_match, arrayKey, content) => {
    const array = (data as any)[arrayKey];
    if (Array.isArray(array)) {
      return array.map(item => {
        let itemContent = content;
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          itemContent = itemContent.replace(regex, String(item[key] || ''));
          
          // Handle nested {{#if}} in items
          itemContent = itemContent.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_m: string, cond: string, cont: string) => {
            return item[cond] ? cont : '';
          });
        });
        return itemContent;
      }).join('');
    }
    return '';
  });

  return result;
}
