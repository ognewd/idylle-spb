'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

type WishlistContextType = {
  items: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  add: (item: WishlistItem) => void;
  remove: (productId: string) => void;
  toggle: (item: WishlistItem) => void;
  clear: () => void;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = 'wishlist_items_v1';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WishlistItem[];
        setItems(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const value = useMemo<WishlistContextType>(() => ({
    items,
    isInWishlist: (productId: string) => items.some(i => i.id === productId),
    add: (item: WishlistItem) => {
      setItems(prev => prev.some(i => i.id === item.id) ? prev : [item, ...prev]);
    },
    remove: (productId: string) => {
      setItems(prev => prev.filter(i => i.id !== productId));
    },
    toggle: (item: WishlistItem) => {
      setItems(prev => prev.some(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [item, ...prev]);
    },
    clear: () => setItems([]),
  }), [items]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}



