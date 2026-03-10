'use client';

import { useEffect } from 'react';
import { useAdminEditProduct } from '@/contexts/AdminEditProductContext';

/**
 * На странице товара устанавливает productId в контекст, чтобы в шапке показывалась ссылка «Редактировать товар».
 */
export function SetAdminEditProductId({ productId }: { productId: string }) {
  const { setProductId } = useAdminEditProduct();
  useEffect(() => {
    setProductId(productId);
    return () => setProductId(null);
  }, [productId, setProductId]);
  return null;
}
