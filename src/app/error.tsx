'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-xl font-semibold text-gray-900 mb-2">Что-то пошло не так</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Произошла ошибка. Попробуйте обновить страницу или вернуться на главную.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          Попробовать снова
        </Button>
        <Button asChild variant="outline">
          <Link href="/">На главную</Link>
        </Button>
      </div>
    </div>
  );
}
