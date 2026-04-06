'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WholesaleRequestsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/wholesale');
  }, [router]);
  return null;
}

