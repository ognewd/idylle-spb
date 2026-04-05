import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { CertificatesList, type CertificateItem } from '@/components/certificates/CertificatesList';

export const metadata: Metadata = {
  title: 'Сертификаты',
  description: 'Сертификаты и документы на продукцию интернет-магазина AROMA BOUTIQUE IDYLLE',
};

export const dynamic = 'force-dynamic';

export default async function CertificatesPage() {
  let certificates: CertificateItem[] = [];
  try {
    certificates = await prisma.siteCertificate.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileName: true,
        mimeType: true,
      },
    });
  } catch {
    certificates = [];
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            На главную
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Сертификаты</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
            Официальные документы и сертификаты на представленные бренды и товары.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <CertificatesList items={certificates} />
      </div>
    </div>
  );
}
