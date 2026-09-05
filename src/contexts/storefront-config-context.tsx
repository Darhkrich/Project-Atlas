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
  updateStorefrontConfig: (updates: Partial<MerchantStorefrontConfig>) => void;
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

  // Load all configs from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllConfigs(JSON.parse(stored));
      } catch {}
    }
    setLoaded(true);
  }, []);

  // When user changes, set current config from that user's saved config
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

  // Persist all configs whenever they change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allConfigs));
    }
  }, [allConfigs, loaded]);

  const updateStorefrontConfig = (updates: Partial<MerchantStorefrontConfig>) => {
    if (!user) return;
    setAllConfigs((prev) => {
      const existing = prev[user.email] || defaultMerchantStorefront;
      const updated = normalizeMerchantStorefront({ ...existing, ...updates });
      return {
        ...prev,
        [user.email]: updated,
      };
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