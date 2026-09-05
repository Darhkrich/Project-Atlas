/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";

type SavedPaymentMethod = {
  isDefault?: import("react").JSX.Element;
  id: string;
  methodId: string;
  label: string;
  details: Record<string, string>;
};

interface SavedPaymentMethodsContextType {
  savedMethods: SavedPaymentMethod[];
  addSavedMethod: (
    methodId: string,
    label: string,
    details: Record<string, string>
  ) => void;
  isMethodSaved: (methodId: string) => boolean;
}

const SavedPaymentMethodsContext = createContext<
  SavedPaymentMethodsContextType | undefined
>(undefined);

const STORAGE_KEY = "atlas-saved-payment-methods"; // will be scoped per user

export function SavedPaymentMethodsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [allMethods, setAllMethods] = useState<Record<string, SavedPaymentMethod[]>>({});
  const [loaded, setLoaded] = useState(false);

  // Load all methods from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllMethods(JSON.parse(stored));
      } catch {}
    }
    setLoaded(true);
  }, []);

  // Persist whenever allMethods changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allMethods));
    }
  }, [allMethods, loaded]);

  const userKey = user?.email || "guest";

  const savedMethods = allMethods[userKey] || [];

  const addSavedMethod = (
    methodId: string,
    label: string,
    details: Record<string, string>
  ) => {
    setAllMethods((prev) => {
      const existingUserMethods = prev[userKey] || [];
      // Avoid duplicate methods (same methodId)
      const filtered = existingUserMethods.filter((m) => m.methodId !== methodId);
      const newMethod: SavedPaymentMethod = {
        id: `spm-${Date.now()}`,
        methodId,
        label,
        details,
        isDefault: undefined
      };
      return {
        ...prev,
        [userKey]: [...filtered, newMethod],
      };
    });
  };

  const isMethodSaved = (methodId: string) => {
    return savedMethods.some((m) => m.methodId === methodId);
  };

  return (
    <SavedPaymentMethodsContext.Provider
      value={{
        savedMethods,
        addSavedMethod,
        isMethodSaved,
      }}
    >
      {children}
    </SavedPaymentMethodsContext.Provider>
  );
}

export function useSavedPaymentMethods() {
  const context = useContext(SavedPaymentMethodsContext);
  if (!context) {
    throw new Error(
      "useSavedPaymentMethods must be used within SavedPaymentMethodsProvider"
    );
  }
  return context;
}