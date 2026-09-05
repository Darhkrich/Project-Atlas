/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/contexts/auth-context";

export type StoreCustomer = {
  id: string;
  storeSlug: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  region?: string;
  status: "Active" | "Inactive";
  createdAt: string;
};

type StoreCustomersMap = Record<string, StoreCustomer[]>;
type UserCustomersMap = Record<string, StoreCustomersMap>;

interface StoreCustomersContextType {
  customers: StoreCustomer[];
  addCustomer: (
    customer: Omit<StoreCustomer, "id" | "createdAt" | "status">
  ) => void;
  getCustomersForStore: (slug: string) => StoreCustomer[];
  getCustomerById: (id: string) => StoreCustomer | undefined;
}

const StoreCustomersContext = createContext<
  StoreCustomersContextType | undefined
>(undefined);

const STORAGE_KEY = "atlas-store-customers";

export function StoreCustomersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allUserCustomers, setAllUserCustomers] = useState<UserCustomersMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllUserCustomers(JSON.parse(stored));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allUserCustomers));
    }
  }, [allUserCustomers, loaded]);

  const userKey = user?.email || "guest";
  const customersByStore = allUserCustomers[userKey] || {};
  const customers = Object.values(customersByStore).flat();

  const persist = (map: StoreCustomersMap) => {
    setAllUserCustomers((prev) => ({
      ...prev,
      [userKey]: map,
    }));
  };

  const addCustomer = (
    customer: Omit<StoreCustomer, "id" | "createdAt" | "status">
  ) => {
    const newCustomer: StoreCustomer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toLocaleDateString("en-GH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: "Active",
    };
    const current = customersByStore[customer.storeSlug] || [];
    persist({
      ...customersByStore,
      [customer.storeSlug]: [...current, newCustomer],
    });
  };

  const getCustomersForStore = (slug: string) => {
    return customersByStore[slug] || [];
  };

  const getCustomerById = (id: string) => {
    return customers.find((c) => c.id === id);
  };

  return (
    <StoreCustomersContext.Provider
      value={{
        customers,
        addCustomer,
        getCustomersForStore,
        getCustomerById,
      }}
    >
      {children}
    </StoreCustomersContext.Provider>
  );
}

export function useStoreCustomers() {
  const context = useContext(StoreCustomersContext);
  if (!context) {
    throw new Error(
      "useStoreCustomers must be used within StoreCustomersProvider"
    );
  }
  return context;
}