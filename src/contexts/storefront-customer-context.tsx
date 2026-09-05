/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { StorefrontCustomer, StorefrontOrder, CustomerAuthForm } from "@/lib/storefront/customer-types";

interface StorefrontCustomerContextValue {
  customer: StorefrontCustomer | null;
  isAuthenticated: boolean;
  login: (resellerSlug: string, form: CustomerAuthForm) => Promise<{ success: boolean; error?: string }>;
  signup: (resellerSlug: string, form: CustomerAuthForm) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  saveDetail: (key: keyof NonNullable<StorefrontCustomer["savedDetails"]>, value: string) => void;
  setPreferredPaymentMethod: (methodId: string) => void;
  addOrder: (order: StorefrontOrder) => void;
}

const StorefrontCustomerContext = createContext<StorefrontCustomerContextValue | undefined>(undefined);

// Mock in-memory user database (replace with real API later)
const mockUsers: Record<string, StorefrontCustomer & { password: string }> = {};

export function StorefrontCustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<StorefrontCustomer | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = useCallback(async (resellerSlug: string, form: CustomerAuthForm) => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // simulate API
    const existing = Object.values(mockUsers).find(
      (u) => u.email === form.email && u.password === form.password && u.resellerSlug === resellerSlug,
    );
    if (!existing) {
      return { success: false, error: "Invalid email or password." };
    }
    const { password, ...publicUser } = existing;
    setCustomer(publicUser);
    setIsAuthenticated(true);
    return { success: true };
  }, []);

  const signup = useCallback(async (resellerSlug: string, form: CustomerAuthForm) => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // simulate API
    const existing = Object.values(mockUsers).find(
      (u) => u.email === form.email && u.resellerSlug === resellerSlug,
    );
    if (existing) {
      return { success: false, error: "An account with this email already exists." };
    }
    const id = `CUS-${Date.now().toString(36).toUpperCase()}`;
    const newUser: StorefrontCustomer & { password: string } = {
      id,
      resellerSlug,
      name: form.name || "Customer",
      email: form.email,
      phone: form.phone,
      savedDetails: {},
      orders: [],
      createdAt: new Date().toISOString(),
      password: form.password,
    };
    mockUsers[id] = newUser;
    const { password, ...publicUser } = newUser;
    setCustomer(publicUser);
    setIsAuthenticated(true);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setCustomer(null);
    setIsAuthenticated(false);
  }, []);

  const saveDetail = useCallback((key: keyof NonNullable<StorefrontCustomer["savedDetails"]>, value: string) => {
    setCustomer((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        savedDetails: { ...prev.savedDetails, [key]: value },
      };
      // Update mock DB
      const stored = mockUsers[prev.id];
      if (stored) {
        stored.savedDetails = updated.savedDetails;
      }
      return updated;
    });
  }, []);

  const setPreferredPaymentMethod = useCallback((methodId: string) => {
    setCustomer((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, preferredPaymentMethod: methodId };
      const stored = mockUsers[prev.id];
      if (stored) {
        stored.preferredPaymentMethod = methodId;
      }
      return updated;
    });
  }, []);

  const addOrder = useCallback((order: StorefrontOrder) => {
    setCustomer((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, orders: [order, ...prev.orders] };
      const stored = mockUsers[prev.id];
      if (stored) {
        stored.orders = updated.orders;
      }
      return updated;
    });
  }, []);

  const value: StorefrontCustomerContextValue = {
    customer,
    isAuthenticated,
    login,
    signup,
    logout,
    saveDetail,
    setPreferredPaymentMethod,
    addOrder,
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
    throw new Error("useStorefrontCustomer must be used within a StorefrontCustomerProvider");
  }
  return context;
}