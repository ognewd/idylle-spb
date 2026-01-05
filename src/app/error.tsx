'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Что-то пошло не так</h2>
        <p className="text-gray-600 mb-6">
          Произошла ошибка при загрузке страницы. Попробуйте обновить страницу.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-red-50 rounded text-left">
            <p className="text-sm text-red-800 font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        <Button onClick={reset} className="w-full">
          Попробовать снова
        </Button>
      </div>
    </div>
  );
}

