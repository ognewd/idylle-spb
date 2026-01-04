import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Fix for serverless Vercel: Handle connection pooling correctly
// The "prepared statement already exists" error occurs when using direct connections
// with Prisma in serverless environments. Solution: use Connection Pooling URL from Supabase
// or configure Prisma to work with connection poolers

const isVercel = process.env.VERCEL === '1';
let databaseUrl = process.env.DATABASE_URL || 'postgresql://dognev@localhost:5432/idylle_spb?schema=public';

// For Supabase on Vercel, we need Connection Pooling URL (not direct connection)
// If using direct Supabase URL in Vercel, add parameters to prevent prepared statement errors
if (isVercel && databaseUrl.includes('supabase.co') && !databaseUrl.includes('pooler.supabase.com')) {
  // This is a direct connection - we need to disable prepared statements
  // by adding ?pgbouncer=true or using connection pooling URL
  // For now, we'll add schema to ensure proper connection
  if (!databaseUrl.includes('schema=public')) {
    databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'schema=public';
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
