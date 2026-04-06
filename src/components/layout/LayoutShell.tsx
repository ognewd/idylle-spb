'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { Button } from '@/components/ui/button';
import { LogOut, ShoppingCart } from 'lucide-react';

function DealerShowcaseHeader() {
  const [companyName, setCompanyName] = useState<string>('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return;
      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const payload = JSON.parse(new TextDecoder('utf-8').decode(bytes));
      if (payload?.activeMode === 'dealer') {
        setCompanyName(payload?.dealerCompanyName || '');
      }
    } catch {
      setCompanyName('');
    }
  }, []);

  return (
    <header className="sticky top-0 z-[100] border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="text-sm">
          <span className="font-semibold">Кабинет дилера</span>
          {companyName ? <span className="text-muted-foreground">: "{companyName}"</span> : null}
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/catalog?dealer=1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Витрина
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/cart?dealer=1">Корзина</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin">Кабинет</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              localStorage.removeItem('admin_token');
              window.location.href = '/admin/login';
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>
    </header>
  );
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname?.startsWith('/admin') ?? false;
  const isDealerShowcase =
    searchParams?.get('dealer') === '1' &&
    (pathname?.startsWith('/catalog') || pathname?.startsWith('/cart') || pathname?.startsWith('/checkout'));

  if (isAdmin) {
    return <>{children}</>;
  }

  if (isDealerShowcase) {
    return (
      <div className="min-h-screen flex flex-col">
        <DealerShowcaseHeader />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
      <CookieBanner />
    </div>
  );
}
