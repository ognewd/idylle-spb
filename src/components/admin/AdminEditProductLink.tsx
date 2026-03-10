'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

interface AdminEditProductLinkProps {
  productId: string;
  className?: string;
}

/**
 * Ссылка «Редактировать товар» в админку. Показывается только при авторизации админа (admin_token).
 */
export function AdminEditProductLink({ productId, className = '' }: AdminEditProductLinkProps) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
      setIsAdmin(!!token);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  if (!isAdmin) return null;

  return (
    <Link
      href={`/admin/products/${productId}/edit`}
      className={`inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 hover:underline ${className}`}
      title="Редактировать товар в админке"
    >
      <Pencil className="h-4 w-4" />
      Редактировать товар
    </Link>
  );
}
