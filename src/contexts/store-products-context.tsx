/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { MerchantStorefrontProduct } from "@/types/merchant-storefront";
import { useAuth } from "@/contexts/auth-context";

type StoreProductsMap = Record<string, MerchantStorefrontProduct[]>;
type UserProductsMap = Record<string, StoreProductsMap>;

interface StoreProductsContextType {
  productsByStore: StoreProductsMap;
  getProductsForStore: (slug: string) => MerchantStorefrontProduct[];
  addProduct: (slug: string, product: MerchantStorefrontProduct) => void;
  updateProduct: (
    slug: string,
    productId: string,
    updates: Partial<MerchantStorefrontProduct>
  ) => void;
  deleteProduct: (slug: string, productId: string) => void;
  seedProducts: (slug: string, products: MerchantStorefrontProduct[]) => void;
}

const StoreProductsContext = createContext<
  StoreProductsContextType | undefined
>(undefined);

const STORAGE_KEY = "atlas-store-products";

export function StoreProductsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allUserProducts, setAllUserProducts] = useState<UserProductsMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllUserProducts(JSON.parse(stored));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUserProducts));
    }
  }, [allUserProducts, loaded]);

  const userKey = user?.email || "guest";
  const productsByStore = allUserProducts[userKey] || {};

  const persist = (map: StoreProductsMap) => {
    setAllUserProducts((prev) => ({
      ...prev,
      [userKey]: map,
    }));
  };

  const getProductsForStore = (slug: string) => {
    return productsByStore[slug] || [];
  };

  const addProduct = (slug: string, product: MerchantStorefrontProduct) => {
    const current = productsByStore[slug] || [];
    persist({ ...productsByStore, [slug]: [...current, product] });
  };

  const updateProduct = (
    slug: string,
    productId: string,
    updates: Partial<MerchantStorefrontProduct>
  ) => {
    const current = productsByStore[slug] || [];
    const updatedProducts = current.map((p) =>
      p.id === productId ? { ...p, ...updates } : p
    );
    persist({ ...productsByStore, [slug]: updatedProducts });
  };

  const deleteProduct = (slug: string, productId: string) => {
    const current = productsByStore[slug] || [];
    const updatedProducts = current.filter((p) => p.id !== productId);
    persist({ ...productsByStore, [slug]: updatedProducts });
  };

  const seedProducts = (slug: string, products: MerchantStorefrontProduct[]) => {
    if ((productsByStore[slug] || []).length === 0) {
      persist({ ...productsByStore, [slug]: products });
    }
  };

  return (
    <StoreProductsContext.Provider
      value={{
        productsByStore,
        getProductsForStore,
        addProduct,
        updateProduct,
        deleteProduct,
        seedProducts,
      }}
    >
      {children}
    </StoreProductsContext.Provider>
  );
}

export function useStoreProducts() {
  const context = useContext(StoreProductsContext);
  if (!context) {
    throw new Error("useStoreProducts must be used within StoreProductsProvider");
  }
  return context;
}