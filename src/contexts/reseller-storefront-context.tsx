/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultResellerStorefrontConfig,
  type ResellerStorefrontConfig,
} from "@/types/reseller-storefront";

interface ResellerStorefrontContextType {
  config: ResellerStorefrontConfig;
  isLoading: boolean;
  updateConfig: (updates: Partial<ResellerStorefrontConfig>) => void;
  saveConfig: () => void;
  resetConfig: () => void;
}

const ResellerStorefrontContext = createContext<
  ResellerStorefrontContextType | undefined
>(undefined);

const STORAGE_KEY = "atlas-reseller-storefront";

function mergeWithDefaults(
  partial?: Partial<ResellerStorefrontConfig> | null,
): ResellerStorefrontConfig {
  if (!partial) {
    return defaultResellerStorefrontConfig;
  }

  return {
    ...defaultResellerStorefrontConfig,
    ...partial,
    services: Array.isArray(partial.services)
      ? partial.services
      : defaultResellerStorefrontConfig.services,
    status: partial.status || "live",
  };
}

export function ResellerStorefrontProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [config, setConfig] = useState<ResellerStorefrontConfig>(
    defaultResellerStorefrontConfig,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig(mergeWithDefaults(parsed));
      } catch {
        // ignore corrupted data
      }
    }
    setIsLoading(false);
  }, []);

  const updateConfig = (updates: Partial<ResellerStorefrontConfig>) => {
    setConfig((prev) => mergeWithDefaults({ ...prev, ...updates }));
  };

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  };

  const resetConfig = () => {
    setConfig(defaultResellerStorefrontConfig);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <ResellerStorefrontContext.Provider
      value={{ config, isLoading, updateConfig, saveConfig, resetConfig }}
    >
      {children}
    </ResellerStorefrontContext.Provider>
  );
}

export function useResellerStorefront() {
  const context = useContext(ResellerStorefrontContext);
  if (!context) {
    throw new Error(
      "useResellerStorefront must be used within ResellerStorefrontProvider",
    );
  }
  return context;
}