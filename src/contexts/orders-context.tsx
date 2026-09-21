/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  storeSlug: string;
  customerEmail: string;
  date: string;
  total: number;
  status: "New" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  items: OrderItem[];
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending";
  createdAt: number;
  updatedAt: number;
};

interface OrdersContextType {
  orders: CustomerOrder[];
  addOrder: (
    order: Omit<
      CustomerOrder,
      "id" | "orderNumber" | "date" | "status" | "createdAt" | "updatedAt"
    >
  ) => CustomerOrder;
  getOrdersForCustomer: (email: string, storeSlug: string) => CustomerOrder[];
  getOrderById: (orderId: string) => CustomerOrder | undefined;
  getOrdersForStore: (storeSlug: string) => CustomerOrder[];
  updateOrderStatus: (orderId: string, status: CustomerOrder["status"]) => void;
  updateOrderPaymentStatus: (
    orderId: string,
    paymentStatus: CustomerOrder["paymentStatus"]
  ) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const STORAGE_KEY = "atlas-customer-orders";

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allOrders, setAllOrders] = useState<Record<string, CustomerOrder[]>>(
    {}
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAllOrders(JSON.parse(stored));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
    }
  }, [allOrders, loaded]);

  const userKey = user?.email || "guest";
  const orders = allOrders[userKey] || [];

  const persist = (updated: CustomerOrder[]) => {
    setAllOrders((prev) => ({
      ...prev,
      [userKey]: updated,
    }));
  };

  const addOrder = (
    orderData: Omit<
      CustomerOrder,
      "id" | "orderNumber" | "date" | "status" | "createdAt" | "updatedAt"
    >
  ) => {
    const now = Date.now();
    const newOrder: CustomerOrder = {
      ...orderData,
      id: `order-${now}`,
      orderNumber: `ATL-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString("en-GH", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      status: "New",
      createdAt: now,
      updatedAt: now,
    };
    persist([...orders, newOrder]);
    return newOrder;
  };

  const getOrdersForCustomer = (email: string, storeSlug: string) => {
    return orders.filter(
      (order) =>
        order.customerEmail === email && order.storeSlug === storeSlug
    );
  };

  const getOrderById = (orderId: string) => {
    return orders.find((order) => order.id === orderId);
  };

  /**
   * Store-wide read. Walks every customer bucket and returns orders for
   * the given storefront slug. Used by merchant-scoped views that need
   * the full picture, not just one customer's orders.
   */
  const getOrdersForStore = (storeSlug: string): CustomerOrder[] => {
    const out: CustomerOrder[] = [];
    for (const key of Object.keys(allOrders)) {
      const bucket = allOrders[key] ?? [];
      for (const order of bucket) {
        if (order.storeSlug === storeSlug) out.push(order);
      }
    }
    return out;
  };

  const updateOrderStatus = (
    orderId: string,
    status: CustomerOrder["status"]
  ) => {
    const updated = orders.map((order) =>
      order.id === orderId ? { ...order, status, updatedAt: Date.now() } : order
    );
    persist(updated);
  };

  const updateOrderPaymentStatus = (
    orderId: string,
    paymentStatus: CustomerOrder["paymentStatus"]
  ) => {
    const updated = orders.map((order) =>
      order.id === orderId
        ? { ...order, paymentStatus, updatedAt: Date.now() }
        : order
    );
    persist(updated);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        getOrdersForCustomer,
        getOrderById,
        getOrdersForStore,
        updateOrderStatus,
        updateOrderPaymentStatus,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be used within OrdersProvider");
  return context;
}