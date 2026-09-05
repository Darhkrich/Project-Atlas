/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region?: string;
};

type CustomerAuthContextType = {
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  storeSlug: string;
  setStoreSlug: (slug: string) => void;
  login: (email: string, password: string) => boolean;
  register: (profile: CustomerProfile & { password: string }) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<CustomerProfile>) => void;
};

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [storeSlug, setStoreSlug] = useState<string>("");

  // Load customer from store-specific key when slug changes
  useEffect(() => {
    if (!storeSlug) {
      setCustomer(null);
      return;
    }
    const stored = localStorage.getItem(`atlas-customer-auth-${storeSlug}`);
    if (stored) {
      try {
        setCustomer(JSON.parse(stored));
      } catch {
        setCustomer(null);
      }
    } else {
      setCustomer(null);
    }
  }, [storeSlug]);

  const login = (email: string, password: string) => {
    if (!storeSlug) return false;
    const usersKey = `atlas-store-users-${storeSlug}`;
    const storedUsers = JSON.parse(localStorage.getItem(usersKey) || "[]");
    const user = storedUsers.find(
      (u: any) => u.email === email && u.password === password
    );
    if (user) {
      const { password: _, ...profile } = user;
      setCustomer(profile);
      localStorage.setItem(`atlas-customer-auth-${storeSlug}`, JSON.stringify(profile));
      return true;
    }
    return false;
  };

  const register = (profile: CustomerProfile & { password: string }) => {
    if (!storeSlug) return false;
    const usersKey = `atlas-store-users-${storeSlug}`;
    const storedUsers = JSON.parse(localStorage.getItem(usersKey) || "[]");
    const exists = storedUsers.some((u: any) => u.email === profile.email);
    if (exists) return false;

    const newUser = { ...profile };
    storedUsers.push(newUser);
    localStorage.setItem(usersKey, JSON.stringify(storedUsers));

    const { password: _, ...customerProfile } = profile;
    setCustomer(customerProfile);
    localStorage.setItem(`atlas-customer-auth-${storeSlug}`, JSON.stringify(customerProfile));
    return true;
  };

  const logout = () => {
    setCustomer(null);
    if (storeSlug) {
      localStorage.removeItem(`atlas-customer-auth-${storeSlug}`);
    }
  };

  const updateProfile = (updates: Partial<CustomerProfile>) => {
    setCustomer((prev) => {
      if (!prev || !storeSlug) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(`atlas-customer-auth-${storeSlug}`, JSON.stringify(updated));

      const usersKey = `atlas-store-users-${storeSlug}`;
      const storedUsers = JSON.parse(localStorage.getItem(usersKey) || "[]");
      const updatedUsers = storedUsers.map((u: any) =>
        u.email === updated.email ? { ...u, ...updated } : u
      );
      localStorage.setItem(usersKey, JSON.stringify(updatedUsers));

      return updated;
    });
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        storeSlug,
        setStoreSlug,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  return context;
}