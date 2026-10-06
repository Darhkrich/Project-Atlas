/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type StoreCustomerStatus = "Active" | "Inactive";

export type StoreCustomer = {
  id: string;
  storeSlug: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  region?: string;
  status: StoreCustomerStatus;
  createdAt: number;
  updatedAt: number;
};

export interface AddStoreCustomerInput {
  storeSlug: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  region?: string;
}

type StoreCustomersMap = Record<string, StoreCustomer[]>;

interface StoreCustomersContextType {
  customers: StoreCustomer[];
  addCustomer: (input: AddStoreCustomerInput) => StoreCustomer;
  getCustomersForStore: (slug: string) => StoreCustomer[];
  getCustomerById: (id: string) => StoreCustomer | undefined;
}

const StoreCustomersContext = createContext<
  StoreCustomersContextType | undefined
>(undefined);

const STORAGE_KEY = "atlas-store-customers";

function parseLegacyCreatedAt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}

function normalizeStoredCustomer(raw: unknown): StoreCustomer | null {
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.email !== "string" || r.email.length === 0) return null;
  if (typeof r.storeSlug !== "string") return null;

  const createdAt = parseLegacyCreatedAt(r.createdAt);
  const updatedAt =
    typeof r.updatedAt === "number" && Number.isFinite(r.updatedAt)
      ? r.updatedAt
      : createdAt;

  const id =
    typeof r.id === "string" && r.id.length > 0 && !r.id.startsWith("cust-")
      ? r.id
      : crypto.randomUUID();

  const status: StoreCustomerStatus =
    r.status === "Inactive" ? "Inactive" : "Active";

  return {
    id,
    storeSlug: r.storeSlug,
    name:
      typeof r.name === "string" && r.name.length > 0
        ? r.name
        : r.email.split("@")[0] || "Customer",
    email: r.email,
    phone: typeof r.phone === "string" ? r.phone : "",
    address: typeof r.address === "string" ? r.address : undefined,
    city: typeof r.city === "string" ? r.city : undefined,
    region: typeof r.region === "string" ? r.region : undefined,
    status,
    createdAt,
    updatedAt,
  };
}

/**
 * Reads whatever is on disk and returns the current slug-keyed shape.
 *
 * Two legacy shapes are handled and collapsed:
 *   - old:  Record<userEmail, Record<storeSlug, StoreCustomer[]>>
 *   - new:  Record<storeSlug, StoreCustomer[]>
 *
 * A hybrid (some entries old, some new) is also handled. Dedupe is by
 * customer ID first, then by email within a store. The store owns its
 * customers; the merchant's user account is not part of the key.
 */
function sanitizeAndMigrate(value: unknown): StoreCustomersMap {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const src = value as Record<string, unknown>;
  const out: StoreCustomersMap = {};

  const addToStore = (slug: string, customer: StoreCustomer) => {
    const list = out[slug] ?? [];
    if (list.some((c) => c.id === customer.id)) return;
    const emailLower = customer.email.toLowerCase();
    if (list.some((c) => c.email.toLowerCase() === emailLower)) return;
    list.push(customer);
    out[slug] = list;
  };

  for (const [key, val] of Object.entries(src)) {
    if (Array.isArray(val)) {
      // Current shape: key is storeSlug.
      for (const entry of val) {
        const customer = normalizeStoredCustomer(entry);
        if (customer) addToStore(key, customer);
      }
      continue;
    }
    if (val !== null && typeof val === "object") {
      // Legacy shape: key is a user email, inner keys are slugs.
      for (const [slug, list] of Object.entries(
        val as Record<string, unknown>
      )) {
        if (!Array.isArray(list)) continue;
        for (const entry of list) {
          const customer = normalizeStoredCustomer(entry);
          if (customer) addToStore(slug, customer);
        }
      }
    }
  }

  return out;
}

export function StoreCustomersProvider({ children }: { children: ReactNode }) {
  const [customersByStore, setCustomersByStore] = useState<StoreCustomersMap>(
    {}
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: unknown = JSON.parse(stored);
        setCustomersByStore(sanitizeAndMigrate(parsed));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customersByStore));
    } catch {
      // Quota. State stays in memory.
    }
  }, [customersByStore, loaded]);

  const customers = Object.values(customersByStore).flat();

  const addCustomer = useCallback(
    (input: AddStoreCustomerInput): StoreCustomer => {
      const now = Date.now();
      const newCustomer: StoreCustomer = {
        id: crypto.randomUUID(),
        storeSlug: input.storeSlug,
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        city: input.city,
        region: input.region,
        status: "Active",
        createdAt: now,
        updatedAt: now,
      };
      setCustomersByStore((prev) => {
        const current = prev[input.storeSlug] ?? [];
        const emailLower = input.email.toLowerCase();
        if (current.some((c) => c.email.toLowerCase() === emailLower)) {
          // The customer already exists on this store. Do not duplicate.
          return prev;
        }
        return {
          ...prev,
          [input.storeSlug]: [...current, newCustomer],
        };
      });
      return newCustomer;
    },
    []
  );

  const getCustomersForStore = useCallback(
    (slug: string) => customersByStore[slug] ?? [],
    [customersByStore]
  );

  const getCustomerById = useCallback(
    (id: string) => customers.find((c) => c.id === id),
    [customers]
  );

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