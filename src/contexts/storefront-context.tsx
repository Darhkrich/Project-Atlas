/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { defaultStorefrontConfig, mockStorefronts } from "@/lib/storefront/defaults";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { validateStorefrontConfig } from "@/lib/storefront/utils";

interface StorefrontContextValue {
  config: StorefrontConfig;
  isLoaded: boolean;
  updateConfig: (patch: Partial<StorefrontConfig>) => void;
  saveConfig: () => { success: boolean; errors: Record<string, string> };
  launchStorefront: () => void;
  unpublishStorefront: () => void;
  resetConfig: () => void;
  getStorefrontBySlug: (slug: string) => StorefrontConfig | undefined;
}

const StorefrontContext = createContext<StorefrontContextValue | undefined>(undefined);

const STORAGE_KEY = "atlas_storefront_configs";

function loadConfigFromStorage(): StorefrontConfig {
  if (typeof window === "undefined") return defaultStorefrontConfig;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultStorefrontConfig;
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === "object" && "store" in parsed) {
      return {
        ...defaultStorefrontConfig,
        ...parsed,
        store: { ...defaultStorefrontConfig.store, ...(parsed.store || {}) },
        branding: { ...defaultStorefrontConfig.branding, ...(parsed.branding || {}) },
        appearance: { ...defaultStorefrontConfig.appearance, ...(parsed.appearance || {}) },
        hero: { ...defaultStorefrontConfig.hero, ...(parsed.hero || {}) },
        services: { ...defaultStorefrontConfig.services, ...(parsed.services || {}) },
        pricing: { ...defaultStorefrontConfig.pricing, ...(parsed.pricing || {}) },
        contact: { ...defaultStorefrontConfig.contact, ...(parsed.contact || {}) },
        social: { ...defaultStorefrontConfig.social, ...(parsed.social || {}) },
        footer: { ...defaultStorefrontConfig.footer, ...(parsed.footer || {}) },
        publication: { ...defaultStorefrontConfig.publication, ...(parsed.publication || {}) },
      } as StorefrontConfig;
    }
  } catch (error) {
    console.error("Failed to parse stored storefront config:", error);
  }
  return defaultStorefrontConfig;
}

function saveConfigToStorage(config: StorefrontConfig) {
  if (typeof window === "undefined") return;
  try {
    const storedMap = localStorage.getItem(STORAGE_KEY);
    let map: Record<string, StorefrontConfig> = {};
    if (storedMap) {
      map = JSON.parse(storedMap);
    }
    map[config.store.slug] = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (error) {
    console.error("Failed to save storefront config:", error);
  }
}

export function getConfigMapFromStorage(): Record<string, StorefrontConfig> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to read storefront config map:", error);
  }
  return {};
}

export function StorefrontProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<StorefrontConfig>(defaultStorefrontConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedConfig = loadConfigFromStorage();
    setConfig(storedConfig);
    setIsLoaded(true);
    console.log("Loaded config:", storedConfig);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveConfigToStorage(config);
      console.log("Saved config:", config);
    }
  }, [config, isLoaded]);

  const updateConfig = useCallback((patch: Partial<StorefrontConfig>) => {
    console.log("updateConfig called with patch:", patch);
    setConfig((prev) => {
      const next = {
        ...prev,
        ...patch,
        store: { ...prev.store, ...(patch.store || {}) },
        branding: { ...prev.branding, ...(patch.branding || {}) },
        appearance: { ...prev.appearance, ...(patch.appearance || {}) },
        hero: { ...prev.hero, ...(patch.hero || {}) },
        services: { ...prev.services, ...(patch.services || {}) },
        pricing: { ...prev.pricing, ...(patch.pricing || {}) },
        contact: { ...prev.contact, ...(patch.contact || {}) },
        social: { ...prev.social, ...(patch.social || {}) },
        footer: { ...prev.footer, ...(patch.footer || {}) },
        publication: { ...prev.publication, ...(patch.publication || {}) },
      };
      console.log("Next config state:", next);
      return next;
    });
  }, []);

  const saveConfig = useCallback(() => {
    const errors = validateStorefrontConfig(config);
    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }
    saveConfigToStorage(config);
    return { success: true, errors: {} };
  }, [config]);

  const launchStorefront = useCallback(() => {
    const errors = validateStorefrontConfig(config);
    if (Object.keys(errors).length > 0) {
      console.error("Cannot launch, validation errors:", errors);
      return;
    }
    const updated = { ...config, publication: { ...config.publication, isPublished: true, publishedAt: new Date().toISOString() } };
    setConfig(updated);
    saveConfigToStorage(updated);
  }, [config]);

  const unpublishStorefront = useCallback(() => {
    const updated = { ...config, publication: { ...config.publication, isPublished: false } };
    setConfig(updated);
    saveConfigToStorage(updated);
  }, [config]);

  const resetConfig = useCallback(() => {
    setConfig(defaultStorefrontConfig);
    saveConfigToStorage(defaultStorefrontConfig);
  }, []);

  const getStorefrontBySlug = useCallback((slug: string): StorefrontConfig | undefined => {
    if (config.store.slug === slug) return config;
    const storedMap = getConfigMapFromStorage();
    if (storedMap[slug]) return storedMap[slug];
    return mockStorefronts[slug];
  }, [config]);

  const value: StorefrontContextValue = {
    config,
    isLoaded,
    updateConfig,
    saveConfig,
    launchStorefront,
    unpublishStorefront,
    resetConfig,
    getStorefrontBySlug,
  };

  return <StorefrontContext.Provider value={value}>{children}</StorefrontContext.Provider>;
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (context === undefined) {
    throw new Error("useStorefront must be used within a StorefrontProvider");
  }
  return context;
}