/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  StorefrontCustomer,
  CustomerAuthForm,
} from "@/lib/storefront/customer-types";
import {
  createStorefrontCustomer,
  saveCustomerDetail,
  setCustomerPhone,
  setCustomerPreferredPaymentMethod,
  setCustomerTwoFactor,
} from "@/lib/domains/storefront/customer-mutations";

interface StorefrontCustomerContextValue {
  customer: StorefrontCustomer | null;
  isAuthenticated: boolean;
  login: (
    resellerSlug: string,
    form: CustomerAuthForm
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    resellerSlug: string,
    form: CustomerAuthForm,
    storefrontId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  saveDetail: (
    key: keyof NonNullable<StorefrontCustomer["savedDetails"]>,
    value: string
  ) => void;
  setPhone: (phone: string) => void;
  setPreferredPaymentMethod: (methodId: string) => void;
  setTwoFactor: (enabled: boolean) => void;
}

const StorefrontCustomerContext = createContext<
  StorefrontCustomerContextValue | undefined
>(undefined);

const USERS_KEY = "atlas-storefront-users";
const SESSION_KEY = "atlas-storefront-customer-session";

type StoredUser = StorefrontCustomer & { password: string };

function readUsers(): Record<string, StoredUser> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(USERS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, StoredUser>;
  } catch {
    return {};
  }
}

function writeUsers(users: Record<string, StoredUser>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
}

function readSession(): StorefrontCustomer | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StorefrontCustomer;
  } catch {
    return null;
  }
}

function writeSession(customer: StorefrontCustomer | null): void {
  if (typeof window === "undefined") return;
  try {
    if (customer) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(customer));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
}

export function StorefrontCustomerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customer, setCustomer] = useState<StorefrontCustomer | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readSession();
    if (stored) {
      setCustomer(stored);
      setIsAuthenticated(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeSession(customer);
  }, [customer, hydrated]);

  const login = useCallback(
    async (resellerSlug: string, form: CustomerAuthForm) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const users = readUsers();
      const existing = Object.values(users).find(
        (u) =>
          u.email === form.email &&
          u.password === form.password &&
          u.resellerSlug === resellerSlug
      );
      if (!existing) {
        return { success: false, error: "Invalid email or password." };
      }
      const { password, ...publicUser } = existing;
      void password;
      setCustomer(publicUser);
      setIsAuthenticated(true);
      return { success: true };
    },
    []
  );

  const signup = useCallback(
    async (
      resellerSlug: string,
      form: CustomerAuthForm,
      storefrontId?: string
    ) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!form.phone || form.phone.trim().length < 7) {
        return {
          success: false,
          error: "A valid phone number is required.",
        };
      }
      const users = readUsers();
      const existing = Object.values(users).find(
        (u) => u.email === form.email && u.resellerSlug === resellerSlug
      );
      if (existing) {
        return {
          success: false,
          error: "An account with this email already exists.",
        };
      }
      const id = "CUS-" + crypto.randomUUID();
      const nowIso = new Date().toISOString();
      const newUser: StoredUser = {
        id,
        resellerSlug,
        storefrontId,
        name: form.name || "Customer",
        email: form.email,
        phone: form.phone.trim(),
        twoFactorEnabled: false,
        savedDetails: {},
        orders: [],
        createdAt: nowIso,
        password: form.password,
      };
      users[id] = newUser;
      writeUsers(users);

      // Mirror into the shared storefront customer store.
      createStorefrontCustomer({
        id,
        resellerSlug,
        storefrontId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      });

      const { password, ...publicUser } = newUser;
      void password;
      setCustomer(publicUser);
      setIsAuthenticated(true);
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setCustomer(null);
    setIsAuthenticated(false);
  }, []);

  const saveDetail = useCallback(
    (
      key: keyof NonNullable<StorefrontCustomer["savedDetails"]>,
      value: string
    ) => {
      const currentId = customer?.id;
      setCustomer((prev) => {
        if (!prev) return prev;
        const updated: StorefrontCustomer = {
          ...prev,
          savedDetails: { ...prev.savedDetails, [key]: value },
        };
        const users = readUsers();
        const stored = users[prev.id];
        if (stored) {
          stored.savedDetails = updated.savedDetails;
          writeUsers(users);
        }
        return updated;
      });
      if (currentId) saveCustomerDetail(currentId, key, value);
    },
    [customer?.id]
  );

  const setPhone = useCallback(
    (phone: string) => {
      const trimmed = phone.trim();
      const currentId = customer?.id;
      setCustomer((prev) => {
        if (!prev) return prev;
        const updated: StorefrontCustomer = { ...prev, phone: trimmed };
        const users = readUsers();
        const stored = users[prev.id];
        if (stored) {
          stored.phone = trimmed;
          writeUsers(users);
        }
        return updated;
      });
      if (currentId) setCustomerPhone(currentId, trimmed);
    },
    [customer?.id]
  );

  const setPreferredPaymentMethod = useCallback(
    (methodId: string) => {
      const currentId = customer?.id;
      setCustomer((prev) => {
        if (!prev) return prev;
        const updated: StorefrontCustomer = {
          ...prev,
          preferredPaymentMethod: methodId,
        };
        const users = readUsers();
        const stored = users[prev.id];
        if (stored) {
          stored.preferredPaymentMethod = methodId;
          writeUsers(users);
        }
        return updated;
      });
      if (currentId) setCustomerPreferredPaymentMethod(currentId, methodId);
    },
    [customer?.id]
  );

  const setTwoFactor = useCallback(
    (enabled: boolean) => {
      const currentId = customer?.id;
      setCustomer((prev) => {
        if (!prev) return prev;
        const updated: StorefrontCustomer = {
          ...prev,
          twoFactorEnabled: enabled,
        };
        const users = readUsers();
        const stored = users[prev.id];
        if (stored) {
          stored.twoFactorEnabled = enabled;
          writeUsers(users);
        }
        return updated;
      });
      if (currentId) setCustomerTwoFactor(currentId, enabled);
    },
    [customer?.id]
  );

  const value: StorefrontCustomerContextValue = {
    customer,
    isAuthenticated,
    login,
    signup,
    logout,
    saveDetail,
    setPhone,
    setPreferredPaymentMethod,
    setTwoFactor,
  };

  return (
    <StorefrontCustomerContext.Provider value={value}>
      {children}
    </StorefrontCustomerContext.Provider>
  );
}

export function useStorefrontCustomer() {
  const context = useContext(StorefrontCustomerContext);
  if (context === undefined) {
    throw new Error(
      "useStorefrontCustomer must be used within a StorefrontCustomerProvider"
    );
  }
  return context;
}