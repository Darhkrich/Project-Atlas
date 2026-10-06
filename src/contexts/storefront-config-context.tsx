/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  defaultMerchantStorefront,
  type MerchantStorefrontConfig,
} from "@/types/merchant-storefront";
import { normalizeMerchantStorefront } from "@/lib/merchant-storefront";
import { useAuth } from "@/contexts/auth-context";

interface StorefrontConfigContextType {
  storefrontConfig: MerchantStorefrontConfig;
  updateStorefrontConfig: (
    updates: Partial<MerchantStorefrontConfig>,
    ownerEmail?: string
  ) => void;
}

const StorefrontConfigContext = createContext<
  StorefrontConfigContextType | undefined
>(undefined);

const STORAGE_KEY = "atlas-merchant-storefronts";

type StorefrontConfigMap = Record<string, MerchantStorefrontConfig>;

export function StorefrontConfigProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allConfigs, setAllConfigs] = useState<StorefrontConfigMap>({});
  const [currentConfig, setCurrentConfig] =
    useState<MerchantStorefrontConfig>(defaultMerchantStorefront);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllConfigs(JSON.parse(stored));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!user) {
      setCurrentConfig(defaultMerchantStorefront);
      return;
    }
    const userConfig = allConfigs[user.email];
    if (userConfig) {
      setCurrentConfig(normalizeMerchantStorefront(userConfig));
    } else {
      setCurrentConfig(defaultMerchantStorefront);
    }
  }, [user, allConfigs]);

  useEffect(() => {
    if (loaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
      } catch {
        // Quota exceeded. Config stays in memory.
      }
    }
  }, [allConfigs, loaded]);

  const updateStorefrontConfig = (
    updates: Partial<MerchantStorefrontConfig>,
    ownerEmail?: string
  ) => {
    const key = ownerEmail ?? user?.email;
    if (!key) return;
    setAllConfigs((prev) => {
      const existing = prev[key] || defaultMerchantStorefront;
      const updated = normalizeMerchantStorefront({ ...existing, ...updates });
      return { ...prev, [key]: updated };
    });
    setCurrentConfig((prev) =>
      normalizeMerchantStorefront({ ...prev, ...updates })
    );
  };

  return (
    <StorefrontConfigContext.Provider
      value={{
        storefrontConfig: currentConfig,
        updateStorefrontConfig,
      }}
    >
      {children}
    </StorefrontConfigContext.Provider>
  );
}

export function useStorefrontConfig() {
  const context = useContext(StorefrontConfigContext);
  if (!context) {
    throw new Error(
      "useStorefrontConfig must be used within StorefrontConfigProvider"
    );
  }
  return context;
}