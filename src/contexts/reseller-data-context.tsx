/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { mockResellerOrders } from "@/lib/mock-data"; // adjust import path as needed

export type ResellerOrder = {
  id: string;
  orderNumber: string;
  service: string;
  category: string;
  customer: string;
  amount: string;
  commission: string;
  date: string;
  status: "Successful" | "Pending" | "Failed";
  statusVariant: "success" | "warning" | "danger";
  image?: string;
  icon?: any;
  iconBg?: string;
};

export type ResellerCustomer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orders: number;
  totalSpent: string;
  lastOrder: string;
  status: "Active" | "Inactive";
  initials: string;
};

interface ResellerDataContextValue {
  orders: ResellerOrder[];
  customers: ResellerCustomer[];
  addOrder: (order: ResellerOrder) => void;
  addCustomer: (customer: ResellerCustomer) => void;
  updateCustomerStats: (customerId: string, orderAmount: number) => void;
}

const ResellerDataContext = createContext<ResellerDataContextValue | undefined>(undefined);

export function ResellerDataProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<ResellerOrder[]>(mockResellerOrders);
  const [customers, setCustomers] = useState<ResellerCustomer[]>([]);

  const addOrder = useCallback((order: ResellerOrder) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const addCustomer = useCallback((customer: ResellerCustomer) => {
    setCustomers((prev) => [customer, ...prev]);
  }, []);

  const updateCustomerStats = useCallback((customerId: string, orderAmount: number) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              orders: customer.orders + 1,
              totalSpent: `GHS ${(parseFloat(customer.totalSpent.replace(/[^0-9.]/g, "")) + orderAmount).toFixed(2)}`,
              lastOrder: "Just now",
              status: "Active",
            }
          : customer,
      ),
    );
  }, []);

  const value: ResellerDataContextValue = {
    orders,
    customers,
    addOrder,
    addCustomer,
    updateCustomerStats,
  };

  return <ResellerDataContext.Provider value={value}>{children}</ResellerDataContext.Provider>;
}

export function useResellerData() {
  const context = useContext(ResellerDataContext);
  if (context === undefined) {
    throw new Error("useResellerData must be used within a ResellerDataProvider");
  }
  return context;
}