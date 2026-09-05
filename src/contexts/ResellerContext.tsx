/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  mockResellerOrders,
  type ResellerOrder,
} from "@/lib/mock-data";

type ResellerContextType = {
  orders: ResellerOrder[];
  todaySales: number;
  totalOrders: number;
  customers: number;
  walletBalance: number;
  totalCommissions: number;
  completeResellerPurchase: (purchase: {
    service: string;
    plan: string;
    recipient: string;
    amount: number;
    customerName?: string;
  }) => void;
  completeCustomerPurchase: (purchase: {
    service: string;
    plan: string;
    recipient: string;
    amount: number;
    customerName?: string;
  }) => void;
};

const ResellerContext = createContext<ResellerContextType>({
  orders: [],
  todaySales: 0,
  totalOrders: 0,
  customers: 0,
  walletBalance: 0,
  totalCommissions: 0,
  completeResellerPurchase: () => {},
  completeCustomerPurchase: () => {},
});

export function useReseller() {
  return useContext(ResellerContext);
}

const STORAGE_KEY = "atlas-reseller-data";
const COMMISSION_RATE = 0.05;

function getServiceImage(service: string): string | undefined {
  const lower = service.toLowerCase();
  if (lower.includes("mtn")) return "/mtn1.png";
  if (lower.includes("telecel")) return "/telecel1.jpg";
  if (lower.includes("ecg") || lower.includes("electricity")) return "/ecg.png";
  if (lower.includes("dstv") || lower.includes("tv")) return "/dstv1.jpg";
  if (lower.includes("glo")) return "/glo.png";
  return undefined;
}

function getCategoryFromService(service: string): string {
  const lower = service.toLowerCase();
  if (lower.includes("data")) return "Data";
  if (lower.includes("airtime")) return "Airtime";
  if (lower.includes("ecg") || lower.includes("electricity")) return "Electricity";
  if (lower.includes("dstv") || lower.includes("tv")) return "Cable TV";
  return "Other";
}

export function ResellerProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<ResellerOrder[]>(mockResellerOrders);
  const [todaySales, setTodaySales] = useState(2450);
  const [totalOrders, setTotalOrders] = useState(42);
  const [customers, setCustomers] = useState(128);
  const [walletBalance, setWalletBalance] = useState(850);
  const [totalCommissions, setTotalCommissions] = useState(122.5);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrders(parsed.orders || mockResellerOrders);
        setTodaySales(parsed.todaySales ?? 2450);
        setTotalOrders(parsed.totalOrders ?? 42);
        setCustomers(parsed.customers ?? 128);
        setWalletBalance(parsed.walletBalance ?? 850);
        setTotalCommissions(parsed.totalCommissions ?? 122.5);
      } catch {}
    }
  }, []);

  const persist = (data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const completeResellerPurchase = (purchase: {
    service: string;
    plan: string;
    recipient: string;
    amount: number;
    customerName?: string;
  }) => {
    const commission = parseFloat((purchase.amount * COMMISSION_RATE).toFixed(2));
    const newOrder: ResellerOrder = {
      id: `ro-${Date.now()}`,
      orderNumber: `R-${Math.floor(Math.random() * 10000)}`,
      service: purchase.service,
      category: getCategoryFromService(purchase.service),
      customer: purchase.customerName || "Walk-in Customer",
      amount: `GHS ${purchase.amount.toFixed(2)}`,
      commission: `GHS ${commission.toFixed(2)}`,
      date: "Just now",
      status: "Successful",
      statusVariant: "success",
      image: getServiceImage(purchase.service),
    };

    const updated = {
      orders: [newOrder, ...orders],
      todaySales: todaySales + purchase.amount,
      totalOrders: totalOrders + 1,
      customers,
      walletBalance: Math.max(0, walletBalance - purchase.amount),
      totalCommissions: totalCommissions + commission,
    };

    setOrders(updated.orders);
    setTodaySales(updated.todaySales);
    setTotalOrders(updated.totalOrders);
    setCustomers(updated.customers);
    setWalletBalance(updated.walletBalance);
    setTotalCommissions(updated.totalCommissions);

    persist(updated);
  };

  const completeCustomerPurchase = (purchase: {
    service: string;
    plan: string;
    recipient: string;
    amount: number;
    customerName?: string;
  }) => {
    const commission = parseFloat((purchase.amount * COMMISSION_RATE).toFixed(2));
    const newOrder: ResellerOrder = {
      id: `cust-${Date.now()}`,
      orderNumber: `R-${Math.floor(Math.random() * 10000)}`,
      service: purchase.service,
      category: getCategoryFromService(purchase.service),
      customer: purchase.customerName || "Online Customer",
      amount: `GHS ${purchase.amount.toFixed(2)}`,
      commission: `GHS ${commission.toFixed(2)}`,
      date: "Just now",
      status: "Successful",
      statusVariant: "success",
      image: getServiceImage(purchase.service),
    };

    const updated = {
      orders: [newOrder, ...orders],
      todaySales: todaySales + purchase.amount,
      totalOrders: totalOrders + 1,
      customers: customers + (purchase.customerName ? 1 : 0),
      walletBalance,
      totalCommissions: totalCommissions + commission,
    };

    setOrders(updated.orders);
    setTodaySales(updated.todaySales);
    setTotalOrders(updated.totalOrders);
    setCustomers(updated.customers);
    setWalletBalance(updated.walletBalance);
    setTotalCommissions(updated.totalCommissions);

    persist(updated);
  };

  return (
    <ResellerContext.Provider
      value={{
        orders,
        todaySales,
        totalOrders,
        customers,
        walletBalance,
        totalCommissions,
        completeResellerPurchase,
        completeCustomerPurchase,
      }}
    >
      {children}
    </ResellerContext.Provider>
  );
}