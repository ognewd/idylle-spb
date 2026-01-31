'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductsTableRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/products/table');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-600">
        <p>Перенаправление...</p>
      </div>
    </div>
  );
}
