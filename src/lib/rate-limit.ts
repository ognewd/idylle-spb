/**
 * Rate limiting по IP для публичных эндпоинтов.
 * In-memory хранилище (подходит для одного инстанса; для кластера — Redis).
 * Настройки windowMs/max читаются из БД (Settings.RATE_LIMIT_CONFIG) или из дефолтов.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SETTINGS_KEY = 'RATE_LIMIT_CONFIG';

export type RateLimitEndpointKey = 'adminLogin' | 'register' | 'orders' | 'newsletter';

export interface RateLimitEndpointConfig {
  windowMs: number;
  max: number;
}

/** Дефолтные значения (если в БД ничего нет) */
const DEFAULT_CONFIG: Record<RateLimitEndpointKey, RateLimitEndpointConfig> = {
  adminLogin: { windowMs: 60 * 1000, max: 5 },
  register: { windowMs: 15 * 60 * 1000, max: 5 },
  orders: { windowMs: 60 * 1000, max: 15 },
  newsletter: { windowMs: 60 * 1000, max: 5 },
};

const ENDPOINT_KEYS: Record<RateLimitEndpointKey, string> = {
  adminLogin: 'admin-login',
  register: 'auth-register',
  orders: 'orders',
  newsletter: 'newsletter-subscribe',
};

/** Читает конфиг из БД и мержит с дефолтами */
export async function getRateLimitConfig(): Promise<Record<RateLimitEndpointKey, RateLimitEndpointConfig>> {
  try {
    const row = await prisma.settings.findUnique({ where: { key: SETTINGS_KEY } });
    if (!row?.value) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(row.value) as Partial<Record<RateLimitEndpointKey, { windowMs?: number; max?: number }>>;
    const result = { ...DEFAULT_CONFIG };
    for (const k of Object.keys(DEFAULT_CONFIG) as RateLimitEndpointKey[]) {
      const p = parsed[k];
      if (p && typeof p.windowMs === 'number' && p.windowMs > 0) result[k].windowMs = p.windowMs;
      if (p && typeof p.max === 'number' && p.max >= 0) result[k].max = p.max;
    }
    return result;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/** Возвращает опции для checkRateLimit по ключу эндпоинта */
export async function getRateLimitOptionsForEndpoint(
  endpointKey: RateLimitEndpointKey
): Promise<RateLimitOptions> {
  const config = await getRateLimitConfig();
  const c = config[endpointKey];
  return {
    key: ENDPOINT_KEYS[endpointKey],
    windowMs: c.windowMs,
    max: c.max,
  };
}

/** IP из заголовков прокси или fallback для локальной разработки */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

interface WindowEntry {
  count: number;
  resetAt: number;
}

const stores = new Map<string, Map<string, WindowEntry>>();

function getStore(key: string): Map<string, WindowEntry> {
  let store = stores.get(key);
  if (!store) {
    store = new Map();
    stores.set(key, store);
  }
  return store;
}

/** Очистка устаревших окон (вызывать периодически или при проверке) */
function prune(store: Map<string, WindowEntry>, now: number): void {
  for (const [k, v] of store.entries()) {
    if (v.resetAt <= now) store.delete(k);
  }
}

export interface RateLimitOptions {
  /** Окно в миллисекундах */
  windowMs: number;
  /** Максимум запросов за окно на один IP */
  max: number;
  /** Уникальный ключ эндпоинта (например 'admin-login') */
  key: string;
}

/**
 * Проверяет лимит по IP. Если лимит превышен — возвращает NextResponse с 429.
 * Если OK — возвращает null (продолжайте обработку запроса).
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions
): NextResponse | null {
  const ip = getClientIp(request);
  const store = getStore(options.key);
  const now = Date.now();

  prune(store, now);

  let entry = store.get(ip);
  if (!entry) {
    entry = { count: 1, resetAt: now + options.windowMs };
    store.set(ip, entry);
    return null;
  }

  if (entry.resetAt <= now) {
    entry = { count: 1, resetAt: now + options.windowMs };
    store.set(ip, entry);
    return null;
  }

  entry.count += 1;
  if (entry.count > options.max) {
    return NextResponse.json(
      { error: 'Слишком много запросов. Попробуйте позже.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(options.windowMs / 1000)) } }
    );
  }
  return null;
}

/** Дефолтные пресеты (для справки и API ответа) */
export const RATE_LIMITS_DEFAULTS = DEFAULT_CONFIG;
