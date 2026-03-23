/**
 * BSPB (Bank Saint-Petersburg) Payment Gateway Integration
 *
 * Uses mTLS (mutual TLS) with client certificate for all API requests.
 * Docs: API банка БСПБ — REST JSON over HTTPS with client cert auth.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BSPB_API_URL = process.env.BSPB_API_URL || 'https://pgtest.bspb.ru:5443';
const BSPB_AUTH_BASIC = process.env.BSPB_AUTH_BASIC || '';
const BSPB_HPP_REDIRECT_URL =
  process.env.BSPB_HPP_REDIRECT_URL || 'https://idylle.spb.ru/payment/result';

const BSPB_CERT_FILE = process.env.BSPB_CERT_FILE || 'pgtest_cer_2026.pem';
const BSPB_KEY_FILE = process.env.BSPB_KEY_FILE || 'pgtest_key.key';

const CERT_PATH = path.join(process.cwd(), 'certs', BSPB_CERT_FILE);
const KEY_PATH = path.join(process.cwd(), 'certs', BSPB_KEY_FILE);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BspbCreateOrderRequest {
  amount: number;       // e.g. 100.00
  currency?: string;    // default "RUB"
  title: string;        // order title shown to customer
  description?: string; // additional description
  redirectUrl?: string; // override default redirect URL
}

export interface BspbOrderResponse {
  id: number;
  hppUrl: string;
  password: string;
  status: string;
}

export interface BspbCreateOrderResult {
  /** Bank-assigned order id */
  orderId: number;
  /** Full URL to redirect the customer to the payment page */
  paymentUrl: string;
  /** Raw response from BSPB */
  raw: BspbOrderResponse;
}

export interface BspbOrderStatus {
  id: number;
  status: string;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

export interface BspbRefundResult {
  success: boolean;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let cachedCert: Buffer | null = null;
let cachedKey: Buffer | null = null;

function loadCert(): Buffer {
  if (!cachedCert) {
    if (!fs.existsSync(CERT_PATH)) {
      throw new Error(`BSPB TLS certificate not found at ${CERT_PATH}`);
    }
    cachedCert = fs.readFileSync(CERT_PATH);
  }
  return cachedCert;
}

function loadKey(): Buffer {
  if (!cachedKey) {
    if (!fs.existsSync(KEY_PATH)) {
      throw new Error(`BSPB TLS private key not found at ${KEY_PATH}`);
    }
    cachedKey = fs.readFileSync(KEY_PATH);
  }
  return cachedKey;
}

interface HttpResult {
  statusCode: number;
  data: unknown;
  rawBody: string;
}

/**
 * Low-level HTTPS request with mTLS client certificate.
 * Node.js native `fetch` does not support client certs, so we use `https`.
 */
function request(
  method: string,
  urlPath: string,
  body?: Record<string, unknown>,
): Promise<HttpResult> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlPath, BSPB_API_URL);

    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      port: Number(parsed.port) || 443,
      path: parsed.pathname + parsed.search,
      method,
      cert: loadCert(),
      key: loadKey(),
      // Test environment may use self-signed certs
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${BSPB_AUTH_BASIC}`,
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const rawBody = Buffer.concat(chunks).toString('utf-8');
        let data: unknown;
        try {
          data = JSON.parse(rawBody);
        } catch {
          data = rawBody;
        }
        resolve({ statusCode: res.statusCode ?? 0, data, rawBody });
      });
    });

    req.on('error', (err) => {
      reject(new Error(`BSPB request failed (${method} ${urlPath}): ${err.message}`));
    });

    // 30 second timeout
    req.setTimeout(30_000, () => {
      req.destroy(new Error('BSPB request timed out'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class BspbPaymentService {
  /**
   * Create a new payment order in BSPB gateway.
   * Returns the payment URL to redirect the customer.
   */
  static async createOrder(params: BspbCreateOrderRequest): Promise<BspbCreateOrderResult> {
    const baseRedirectUrl = params.redirectUrl || BSPB_HPP_REDIRECT_URL;

    const payload = {
      order: {
        typeRid: 'Purchase',
        amount: params.amount,
        currency: params.currency || 'RUB',
        title: params.title,
        description: params.description || params.title,
        hppRedirectUrl: baseRedirectUrl,
      },
    };

    const result = await request('POST', '/order', payload);

    if (result.statusCode < 200 || result.statusCode >= 300) {
      console.error('BSPB createOrder error:', result.statusCode, result.rawBody);
      throw new Error(
        `BSPB API returned status ${result.statusCode}: ${
          typeof result.data === 'object'
            ? JSON.stringify(result.data)
            : result.rawBody
        }`,
      );
    }

    const body = result.data as { order?: BspbOrderResponse };
    if (!body?.order?.id || !body.order.hppUrl || !body.order.password) {
      throw new Error(
        `Unexpected BSPB response structure: ${result.rawBody}`,
      );
    }

    const order = body.order;

    // Обновляем hppRedirectUrl — вшиваем id заказа, чтобы при возврате из банка
    // наш сайт знал, какой платёж проверять (банк не добавляет параметры сам)
    const sep = baseRedirectUrl.includes('?') ? '&' : '?';
    const redirectWithId = `${baseRedirectUrl}${sep}id=${order.id}`;
    try {
      await request('PUT', `/order/${order.id}`, {
        order: { hppRedirectUrl: redirectWithId },
      });
    } catch (e) {
      console.warn('BSPB: failed to update hppRedirectUrl, redirect may lack id param:', e);
    }

    const paymentUrl = `${order.hppUrl}?id=${order.id}&password=${order.password}`;

    return {
      orderId: order.id,
      paymentUrl,
      raw: order,
    };
  }

  /**
   * Check the status of an existing BSPB order.
   */
  static async getOrderStatus(orderId: number | string): Promise<BspbOrderStatus> {
    const result = await request('GET', `/order/${orderId}`);

    if (result.statusCode < 200 || result.statusCode >= 300) {
      console.error('BSPB getOrderStatus error:', result.statusCode, result.rawBody);
      throw new Error(`BSPB API returned status ${result.statusCode}`);
    }

    const body = result.data as { order?: BspbOrderStatus };
    if (!body?.order) {
      throw new Error(`Unexpected BSPB response: ${result.rawBody}`);
    }

    return body.order;
  }

  /**
   * Execute a refund (return) for an existing BSPB order.
   * Only works on orders that have been paid (status "Deposited", "Approved", etc.).
   *
   * @param orderId  Bank order ID
   * @param amount   Optional partial refund amount; omit for full refund
   */
  static async refundOrder(
    orderId: number | string,
    amount?: number,
  ): Promise<BspbRefundResult> {
    const tran: Record<string, unknown> = {};
    if (amount !== undefined) {
      tran.amount = amount;
    }

    const result = await request('POST', `/order/${orderId}/exec-tran`, { tran });

    if (result.statusCode < 200 || result.statusCode >= 300) {
      console.error('BSPB refundOrder error:', result.statusCode, result.rawBody);
      const detail =
        typeof result.data === 'object' && result.data !== null
          ? (result.data as Record<string, unknown>).errorDescription || JSON.stringify(result.data)
          : result.rawBody;
      throw new Error(`BSPB refund failed (${result.statusCode}): ${detail}`);
    }

    return { success: true, ...(typeof result.data === 'object' ? result.data as Record<string, unknown> : {}) };
  }
}
