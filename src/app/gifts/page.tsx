import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Подарки | Aroma Idylle',
  description: 'Ароматические подарки для ваших близких',
};

export default function GiftsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Подарки</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Найдите идеальный ароматический подарок для ваших близких
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Товары будут загружены здесь */}
        </div>
      </div>
    </div>
  );
}
