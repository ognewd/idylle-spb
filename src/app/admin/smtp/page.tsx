'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Редирект: настройки SMTP перенесены в «Управление email» с разделением на заказы и партнёров. */
export default function SMTPRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/email/smtp');
  }, [router]);
  return (
    <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
      Переход к настройкам SMTP…
    </div>
  );
}
