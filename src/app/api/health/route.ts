import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    database: string;
    api: string;
  };
  version: string;
  database?: {
    products: number;
    categories: number;
    brands: number;
  };
  error?: string;
}

export async function GET() {
  const healthCheck: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'unknown',
      api: 'ok',
    },
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Проверка подключения к базе данных
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.checks.database = 'connected';

    // Проверка количества записей в основных таблицах
    const [productCount, categoryCount, brandCount] = await Promise.all([
      prisma.product.count().catch(() => 0),
      prisma.category.count().catch(() => 0),
      prisma.brand.count().catch(() => 0),
    ]);

    healthCheck.status = 'ok';
    healthCheck.database = {
      products: productCount,
      categories: categoryCount,
      brands: brandCount,
    };
  } catch (error) {
    healthCheck.status = 'error';
    healthCheck.checks.database = 'disconnected';
    healthCheck.error = error instanceof Error ? error.message : 'Unknown error';
    
    // Вернуть 503 (Service Unavailable) если БД недоступна
    return NextResponse.json(healthCheck, { status: 503 });
  }

  return NextResponse.json(healthCheck, { status: 200 });
}

// Allow GET requests for health checks
export const dynamic = 'force-dynamic';
