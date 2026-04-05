'use client';

import { useEffect, useState } from 'react';

/** Устройство с наведением и точным указателем (обычно мышь на десктопе), не сенсор как основной ввод. */
export function useFinePointerHover(): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return matches;
}
