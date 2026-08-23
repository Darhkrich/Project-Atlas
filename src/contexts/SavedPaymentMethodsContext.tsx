/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type SavedPaymentMethod = {
  id: string;
  methodId: string;
  label: string;
  details: Record<string, string>;
  dateAdded: string;
  isDefault: boolean;
};

type SavedPaymentMethodsContextType = {
  savedMethods: SavedPaymentMethod[];
  addSavedMethod: (
    methodId: string,
    label: string,
    details: Record<string, string>,
  ) => void;
  updateSavedMethod: (
    id: string,
    label: string,
    details: Record<string, string>,
  ) => void;
  deleteSavedMethod: (id: string) => void;
  setDefaultMethod: (id: string) => void;
  isMethodSaved: (methodId: string, details: Record<string, string>) => boolean;
};

const SavedPaymentMethodsContext = createContext<SavedPaymentMethodsContextType>({
  savedMethods: [],
  addSavedMethod: () => {},
  updateSavedMethod: () => {},
  deleteSavedMethod: () => {},
  setDefaultMethod: () => {},
  isMethodSaved: () => false,
});

export function useSavedPaymentMethods() {
  return useContext(SavedPaymentMethodsContext);
}

const STORAGE_KEY = "atlas-saved-payment-methods";

export function SavedPaymentMethodsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethod[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedMethods(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const persist = (methods: SavedPaymentMethod[]) => {
    setSavedMethods(methods);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(methods));
  };

  const addSavedMethod = (
    methodId: string,
    label: string,
    details: Record<string, string>,
  ) => {
    const newMethod: SavedPaymentMethod = {
      id: `spm-${Date.now()}`,
      methodId,
      label,
      details,
      dateAdded: new Date().toISOString(),
      isDefault: savedMethods.length === 0, // first is default
    };
    persist([newMethod, ...savedMethods]);
  };

  const updateSavedMethod = (
    id: string,
    label: string,
    details: Record<string, string>,
  ) => {
    persist(
      savedMethods.map((m) =>
        m.id === id ? { ...m, label, details } : m,
      ),
    );
  };

  const deleteSavedMethod = (id: string) => {
    const remaining = savedMethods.filter((m) => m.id !== id);
    if (
      remaining.length > 0 &&
      !remaining.some((m) => m.isDefault)
    ) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }
    persist(remaining);
  };

  const setDefaultMethod = (id: string) => {
    persist(
      savedMethods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      })),
    );
  };

  const isMethodSaved = (methodId: string, details: Record<string, string>) => {
    return savedMethods.some(
      (m) =>
        m.methodId === methodId &&
        Object.keys(details).every(
          (key) => m.details[key] === details[key],
        ),
    );
  };

  return (
    <SavedPaymentMethodsContext.Provider
      value={{
        savedMethods,
        addSavedMethod,
        updateSavedMethod,
        deleteSavedMethod,
        setDefaultMethod,
        isMethodSaved,
      }}
    >
      {children}
    </SavedPaymentMethodsContext.Provider>
  );
}