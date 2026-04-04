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
  /** Код способа доставки: delivery | pickup | cdek */
  deliveryMethod: string;
  /** Человекочитаемое название способа доставки */
  deliveryMethodLabel: string;
  /** Город доставки (если указан) */
  city?: string;
  deliveryAddress?: string;
  /** Код способа оплаты: card | cash | invoice | pickup */
  paymentMethod: string;
  /** Человекочитаемое название способа оплаты */
  paymentMethodLabel: string;
  orderItems: Array<{
    name: string;
    variantInfo?: string | null;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: string;
  /** Стоимость доставки (форматированная строка) */
  shippingAmount?: string;
  /** Комментарий к заказу */
  orderComment?: string;
  /** Комментарий для курьера */
  courierComment?: string;
  logoUrl: string;
  // Реквизиты для юрлиц (оплата по счёту)
  companyName?: string;
  inn?: string;
  kpp?: string;
  companyAddress?: string;
  // СДЭК
  cdekPvzAddress?: string;
  cdekDeliveryCost?: string;
  cdekTariffName?: string;
}

const ORDER_SMTP_PREFIX = 'SMTP_';
const PARTNER_SMTP_PREFIX = 'PARTNER_SMTP_';

let transporter: nodemailer.Transporter | null = null;

async function loadSmtpSettingsMap(prefix: string): Promise<Record<string, string>> {
  const rows = await prisma.settings.findMany({
    where: { key: { startsWith: prefix } },
  });
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key.slice(prefix.length)] = row.value;
  }
  return map;
}

function nodemailerConfigFromMap(
  db: Record<string, string>,
  env: { HOST?: string; PORT?: string; USER?: string; PASS?: string; FROM?: string }
) {
  const port = parseInt(db.PORT || env.PORT || '587', 10);
  return {
    host: db.HOST || env.HOST || 'sandbox.smtp.mailtrap.io',
    port,
    secure: port === 465,
    auth: {
      user: db.USER || env.USER || '',
      pass: db.PASS || env.PASS || '',
    },
    tls: { rejectUnauthorized: false as const },
  };
}

export async function getMailTransporter() {
  transporter = null;

  const settings = await loadSmtpSettingsMap(ORDER_SMTP_PREFIX);
  const smtpConfig = nodemailerConfigFromMap(settings, {
    HOST: process.env.SMTP_HOST,
    PORT: process.env.SMTP_PORT,
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS,
  });

  transporter = nodemailer.createTransport(smtpConfig);

  try {
    await transporter.verify();
    console.log('✅ SMTP server connection verified (order notifications)');
  } catch (error) {
    console.error('❌ SMTP server connection failed:', error);
  }

  return transporter;
}

async function getPartnerMailTransporterInternal() {
  const settings = await loadSmtpSettingsMap(PARTNER_SMTP_PREFIX);
  const smtpConfig = nodemailerConfigFromMap(settings, {
    HOST: process.env.PARTNER_SMTP_HOST,
    PORT: process.env.PARTNER_SMTP_PORT,
    USER: process.env.PARTNER_SMTP_USER,
    PASS: process.env.PARTNER_SMTP_PASS,
  });
  return nodemailer.createTransport(smtpConfig);
}

export async function testPartnerSMTPConnection(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const t = await getPartnerMailTransporterInternal();
    await t.verify();
    return { success: true, message: 'SMTP connection successful (partner)' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function resolveOrderFromAddress(settings: Record<string, string>): string {
  return settings.FROM || process.env.SMTP_FROM || 'noreply@idylle.spb.ru';
}

function resolvePartnerFromAddress(settings: Record<string, string>): string {
  return settings.FROM || process.env.PARTNER_SMTP_FROM || process.env.SMTP_FROM || 'noreply@idylle.spb.ru';
}

export async function sendMail(options: MailOptions) {
  try {
    const transporterInst = await getMailTransporter();
    const smtpSettings = await loadSmtpSettingsMap(ORDER_SMTP_PREFIX);
    const fromEmail = resolveOrderFromAddress(smtpSettings);

    const mailOptions = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    };

    const info = await transporterInst.sendMail(mailOptions);
    console.log('📧 Email sent from:', fromEmail, 'to:', options.to, 'messageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/** Отправка писем партнёрам (отдельный SMTP из настроек «Коммуникация с партнёрами»). */
export async function sendPartnerMail(options: MailOptions) {
  try {
    const settings = await loadSmtpSettingsMap(PARTNER_SMTP_PREFIX);
    const host = settings.HOST || process.env.PARTNER_SMTP_HOST || '';
    if (!host.trim()) {
      return { success: false, error: 'SMTP для партнёров не настроен (укажите хост в разделе email)' };
    }

    const t = await getPartnerMailTransporterInternal();
    const fromEmail = resolvePartnerFromAddress(settings);
    const info = await t.sendMail({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject,
    });
    console.log('📧 Partner email sent from:', fromEmail, 'to:', options.to, 'messageId:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending partner email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function getPublicSiteBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  return 'http://localhost:3000';
}

export async function sendPartnerCredentialsEmail(params: {
  to: string;
  userName: string;
  loginEmail: string;
  password: string;
  partnerName?: string;
}) {
  const base = getPublicSiteBaseUrl();
  const loginUrl = `${base}/admin/login`;
  const partnerLine = params.partnerName
    ? `<p>Организация: <strong>${escapeHtml(params.partnerName)}</strong></p>`
    : '';

  const html = `
<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <h2 style="margin-top:0;">Доступ к кабинету партнёра</h2>
  <p>Здравствуйте, ${escapeHtml(params.userName)}!</p>
  ${partnerLine}
  <p>Для вас создан аккаунт в личном кабинете партнёра на сайте.</p>
  <p><strong>Адрес входа:</strong> <a href="${loginUrl}">${escapeHtml(loginUrl)}</a></p>
  <p><strong>Email (логин):</strong> ${escapeHtml(params.loginEmail)}</p>
  <p><strong>Пароль:</strong> <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px;">${escapeHtml(params.password)}</code></p>
  <p style="color:#71717a;font-size:14px;">Рекомендуем после первого входа хранить пароль в надёжном месте. При необходимости администратор может выдать новый пароль.</p>
</body></html>`;

  const text = [
    'Доступ к кабинету партнёра',
    '',
    `Вход: ${loginUrl}`,
    `Email: ${params.loginEmail}`,
    `Пароль: ${params.password}`,
  ].join('\n');

  return sendPartnerMail({
    to: params.to,
    subject: 'Ваш доступ к кабинету партнёра',
    html,
    text,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function testSMTPConnection() {
  try {
    const transporterInst = await getMailTransporter();
    await transporterInst.verify();
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

  // 1) Сначала обрабатываем {{#each}} — иначе верхнеуровневая замена {{name}}/{{quantity}} очистит плейсхолдеры внутри блока
  result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_match, arrayKey, content) => {
    const array = (data as any)[arrayKey];
    if (Array.isArray(array)) {
      return array.map(item => {
        let itemContent = content;
        Object.keys(item).forEach(key => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
          itemContent = itemContent.replace(regex, String(item[key] ?? ''));
        });
        // Вложенные {{#if}} внутри элемента (например variantInfo)
        itemContent = itemContent.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_m: string, cond: string, cont: string) => {
          return item[cond] ? cont : '';
        });
        return itemContent;
      }).join('');
    }
    return '';
  });

  // 2) Обрабатываем {{#if}} — сначала самые внутренние (у которых в content нет {{#if}})
  const ifBlockRegex = /\{\{#if\s+(\w+)\}\}((?:(?!\{\{#if)[\s\S])*?)\{\{\/if\}\}/g;
  for (let i = 0; i < 10; i++) {
    const prev = result;
    result = result.replace(ifBlockRegex, (_match, condition, content) => {
      const value = (data as any)[condition];
      return value ? content : '';
    });
    if (result === prev) break;
  }

  // 3) В конце подставляем простые переменные {{key}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    return (data as any)[key] !== undefined ? String((data as any)[key]) : '';
  });

  return result;
}
