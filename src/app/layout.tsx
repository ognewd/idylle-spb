import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AdminToolbar } from '@/components/layout/AdminToolbar';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { SessionProvider } from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <SessionProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <AdminToolbar />
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <ChatWidget />
              </div>
            </CartProvider>
          </WishlistProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
