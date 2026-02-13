import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Сотрудничество | AROMARUSSIA',
  description: 'Партнерство с брендами и дилерами. Станьте частью AROMARUSSIA',
};

export default function DealersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
