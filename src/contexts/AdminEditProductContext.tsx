'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AdminEditProductContextType = {
  productId: string | null;
  setProductId: (id: string | null) => void;
};

const AdminEditProductContext = createContext<AdminEditProductContextType | null>(null);

export function AdminEditProductProvider({ children }: { children: ReactNode }) {
  const [productId, setProductId] = useState<string | null>(null);
  return (
    <AdminEditProductContext.Provider value={{ productId, setProductId }}>
      {children}
    </AdminEditProductContext.Provider>
  );
}

export function useAdminEditProduct() {
  const ctx = useContext(AdminEditProductContext);
  return ctx ?? { productId: null, setProductId: () => {} };
}
