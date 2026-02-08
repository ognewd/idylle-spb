import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AdminToolbar } from '@/components/layout/AdminToolbar';
import { LayoutShell } from '@/components/layout/LayoutShell';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { MaintenancePage } from '@/components/maintenance/MaintenancePage';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: 'Idylle - Люксовые парфюмы и товары для дома',
  description: 'Эксклюзивные парфюмы и товары для дома от ведущих мировых брендов. Бесплатная доставка по Санкт-Петербургу.',
  keywords: 'парфюмы, духи, товары для дома, люкс, бренды, доставка',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} admin-visible`}>
        <SessionProvider>
          <WishlistProvider>
            <CartProvider>
              {/* Maintenance Page - показывается только для не-админов */}
              <MaintenancePage />
              
              {/* Основной контент: в админке без шапки/подвала, на сайте — с шапкой и подвалом */}
              <AdminToolbar />
              <LayoutShell>{children}</LayoutShell>
            </CartProvider>
          </WishlistProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
