/* eslint-disable @typescript-eslint/no-unused-vars */
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
import type {
  CustomerOrderStatus,
  CustomerOrderPaymentStatus,
  OrderCancelRecord,
  OrderEvent,
  OrderEventActor,
  OrderNote,
  OrderShippingAddress,
} from "@/lib/merchant/orders/types";

export type { CustomerOrderStatus, CustomerOrderPaymentStatus };

export type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  storeSlug: string;
  storefrontId: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: OrderShippingAddress | null;
  date: string;
  total: number;
  status: CustomerOrderStatus;
  paymentStatus: CustomerOrderPaymentStatus;
  paymentMethod: string;
  items: OrderItem[];
  events: OrderEvent[];
  notes: OrderNote[];
  cancelRecord: OrderCancelRecord | null;
  trackingNumber: string | null;
  carrier: string | null;
  refundIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AddOrderInput {
  storeSlug: string;
  storefrontId?: string | null;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: OrderShippingAddress | null;
  total: number;
  items: OrderItem[];
  paymentMethod: string;
  paymentStatus: CustomerOrderPaymentStatus | "Paid" | "Pending";
}

export type LegacyOrderStatusLiteral =
  | "New"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Paid"
  | "Pending"
  | "Failed"
  | "Refunded";

export type LegacyPaymentStatusLiteral = "Paid" | "Pending";

interface OrdersContextType {
  orders: CustomerOrder[];
  addOrder: (input: AddOrderInput) => CustomerOrder;
  updateOrder: (orderId: string, patch: Partial<CustomerOrder>) => void;
  appendOrderEvent: (orderId: string, event: OrderEvent) => void;
  getOrdersForCustomer: (email: string, storeSlug: string) => CustomerOrder[];
  getOrderById: (orderId: string) => CustomerOrder | undefined;
  getOrdersForStore: (storeSlug: string) => CustomerOrder[];
  updateOrderStatus: (
    orderId: string,
    status: CustomerOrderStatus | LegacyOrderStatusLiteral
  ) => void;
  updateOrderPaymentStatus: (
    orderId: string,
    paymentStatus:
      | CustomerOrderPaymentStatus
      | LegacyPaymentStatusLiteral
  ) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

const STORAGE_KEY = "atlas-customer-orders";

function normalizeStatus(raw: unknown): CustomerOrderStatus {
  if (raw === "new" || raw === "New") return "new";
  if (raw === "processing" || raw === "Processing") return "processing";
  if (raw === "shipped" || raw === "Shipped") return "shipped";
  if (raw === "delivered" || raw === "Delivered") return "delivered";
  if (raw === "cancelled" || raw === "Cancelled") return "cancelled";
  if (raw === "Paid" || raw === "Pending" || raw === "Failed") return "new";
  if (raw === "Refunded") return "delivered";
  return "new";
}

function normalizePaymentStatus(
  raw: unknown,
  legacyStatus?: unknown
): CustomerOrderPaymentStatus {
  if (raw === "paid" || raw === "Paid") return "paid";
  if (raw === "pending" || raw === "Pending") return "pending";
  if (raw === "refunded" || raw === "Refunded") return "refunded";
  if (raw === "partially_refunded") return "partially_refunded";
  if (raw === "failed" || raw === "Failed") return "failed";
  if (legacyStatus === "Paid") return "paid";
  if (legacyStatus === "Pending") return "pending";
  if (legacyStatus === "Failed") return "failed";
  if (legacyStatus === "Refunded") return "refunded";
  return "pending";
}

function formatOrderDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeStoredOrder(raw: unknown): CustomerOrder | null {
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string") return null;
  if (typeof r.storeSlug !== "string") return null;

  const createdAt =
    typeof r.createdAt === "number" && Number.isFinite(r.createdAt)
      ? r.createdAt
      : Date.now();
  const updatedAt =
    typeof r.updatedAt === "number" && Number.isFinite(r.updatedAt)
      ? r.updatedAt
      : createdAt;

  const items: OrderItem[] = Array.isArray(r.items)
    ? (r.items as unknown[])
        .filter((it): it is Record<string, unknown> => it !== null && typeof it === "object")
        .map((it) => ({
          name: typeof it.name === "string" ? it.name : "",
          quantity:
            typeof it.quantity === "number" && Number.isFinite(it.quantity)
              ? it.quantity
              : 0,
          price:
            typeof it.price === "number" && Number.isFinite(it.price)
              ? it.price
              : 0,
          image: typeof it.image === "string" ? it.image : undefined,
        }))
        .filter((it) => it.name.length > 0)
    : [];

  const email =
    typeof r.customerEmail === "string" ? r.customerEmail : "";
  const fallbackName = email.split("@")[0] || "Customer";

  const events: OrderEvent[] = Array.isArray(r.events)
    ? (r.events as OrderEvent[]).filter(
        (e): e is OrderEvent =>
          e !== null && typeof e === "object" && typeof e.id === "string"
      )
    : [];

  const notes: OrderNote[] = Array.isArray(r.notes)
    ? (r.notes as OrderNote[]).filter(
        (n): n is OrderNote =>
          n !== null && typeof n === "object" && typeof n.id === "string"
      )
    : [];

  const shippingAddress =
    r.shippingAddress && typeof r.shippingAddress === "object"
      ? (r.shippingAddress as OrderShippingAddress)
      : null;

  const cancelRecord =
    r.cancelRecord && typeof r.cancelRecord === "object"
      ? (r.cancelRecord as OrderCancelRecord)
      : null;

  const refundIds = Array.isArray(r.refundIds)
    ? (r.refundIds as unknown[]).filter(
        (id): id is string => typeof id === "string"
      )
    : [];

  return {
    id: r.id,
    orderNumber:
      typeof r.orderNumber === "string" ? r.orderNumber : "ATL-ORD-0000",
    storeSlug: r.storeSlug,
    storefrontId:
      typeof r.storefrontId === "string" ? r.storefrontId : null,
    customerEmail: email,
    customerName:
      typeof r.customerName === "string" && r.customerName.length > 0
        ? r.customerName
        : fallbackName,
    customerPhone:
      typeof r.customerPhone === "string" ? r.customerPhone : "",
    shippingAddress,
    date:
      typeof r.date === "string" && r.date.length > 0
        ? r.date
        : formatOrderDate(createdAt),
    total:
      typeof r.total === "number" && Number.isFinite(r.total)
        ? r.total
        : 0,
    status: normalizeStatus(r.status),
    paymentStatus: normalizePaymentStatus(r.paymentStatus, r.status),
    paymentMethod:
      typeof r.paymentMethod === "string" ? r.paymentMethod : "Unknown",
    items,
    events,
    notes,
    cancelRecord,
    trackingNumber:
      typeof r.trackingNumber === "string" ? r.trackingNumber : null,
    carrier: typeof r.carrier === "string" ? r.carrier : null,
    refundIds,
    createdAt,
    updatedAt,
  };
}

function isCustomerOrder(value: unknown): value is CustomerOrder {
  if (value === null || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.storeSlug === "string";
}

function sanitizeStoredMap(value: unknown): Record<string, CustomerOrder[]> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const cleaned: Record<string, CustomerOrder[]> = {};
  for (const [key, bucket] of Object.entries(
    value as Record<string, unknown>
  )) {
    if (!Array.isArray(bucket)) continue;
    const normalized: CustomerOrder[] = [];
    for (const entry of bucket) {
      const n = normalizeStoredOrder(entry);
      if (n) normalized.push(n);
    }
    cleaned[key] = normalized;
  }
  return cleaned;
}

function coerceStatus(
  raw: CustomerOrderStatus | LegacyOrderStatusLiteral
): CustomerOrderStatus {
  return normalizeStatus(raw);
}

function coercePaymentStatus(
  raw: CustomerOrderPaymentStatus | LegacyPaymentStatusLiteral
): CustomerOrderPaymentStatus {
  return normalizePaymentStatus(raw);
}

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
        const parsed: unknown = JSON.parse(stored);
        const cleaned = sanitizeStoredMap(parsed);
        setAllOrders(cleaned);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allOrders));
    } catch {
      // Quota. State stays in memory.
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

  const addOrder = (input: AddOrderInput): CustomerOrder => {
    const now = Date.now();
    const actor: OrderEventActor = {
      id: user?.id || "customer",
      name: input.customerName || input.customerEmail,
      email: input.customerEmail,
    };
    const placedEvent: OrderEvent = {
      id: crypto.randomUUID(),
      type: "placed",
      description: "Order placed.",
      actor,
      createdAt: now,
      toStatus: "new",
    };
    const paymentStatus = coercePaymentStatus(input.paymentStatus);
    const paymentEvent: OrderEvent | null =
      paymentStatus === "paid"
        ? {
            id: crypto.randomUUID(),
            type: "payment_confirmed",
            description: "Payment confirmed.",
            actor,
            createdAt: now,
          }
        : null;
    const events = paymentEvent
      ? [placedEvent, paymentEvent]
      : [placedEvent];

    const newOrder: CustomerOrder = {
      id: crypto.randomUUID(),
      orderNumber:
        "ATL-ORD-" + Math.floor(1000 + Math.random() * 9000),
      storeSlug: input.storeSlug,
      storefrontId: input.storefrontId ?? null,
      customerEmail: input.customerEmail,
      customerName:
        input.customerName && input.customerName.length > 0
          ? input.customerName
          : input.customerEmail.split("@")[0] || "Customer",
      customerPhone: input.customerPhone ?? "",
      shippingAddress: input.shippingAddress ?? null,
      date: formatOrderDate(now),
      total: input.total,
      status: "new",
      paymentStatus,
      paymentMethod: input.paymentMethod,
      items: input.items,
      events,
      notes: [],
      cancelRecord: null,
      trackingNumber: null,
      carrier: null,
      refundIds: [],
      createdAt: now,
      updatedAt: now,
    };

    persist([...orders, newOrder]);
    return newOrder;
  };

  const updateOrder = (orderId: string, patch: Partial<CustomerOrder>) => {
    const now = Date.now();
    const updated = orders.map((order) =>
      order.id === orderId
        ? { ...order, ...patch, updatedAt: now }
        : order
    );
    persist(updated);
  };

  const appendOrderEvent = (orderId: string, event: OrderEvent) => {
    const updated = orders.map((order) =>
      order.id === orderId
        ? { ...order, events: [...order.events, event], updatedAt: event.createdAt }
        : order
    );
    persist(updated);
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

  const getOrdersForStore = (storeSlug: string): CustomerOrder[] => {
    const out: CustomerOrder[] = [];
    for (const key of Object.keys(allOrders)) {
      const bucket = allOrders[key];
      if (!Array.isArray(bucket)) continue;
      for (const order of bucket) {
        if (order.storeSlug === storeSlug) out.push(order);
      }
    }
    return out;
  };

  const updateOrderStatus = (
    orderId: string,
    rawStatus: CustomerOrderStatus | LegacyOrderStatusLiteral
  ) => {
    const status = coerceStatus(rawStatus);
    const now = Date.now();
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const event: OrderEvent = {
        id: crypto.randomUUID(),
        type: "status_changed",
        description: "Status updated.",
        actor: {
          id: user?.id || "system",
          name: user?.name || "System",
          email: user?.email || "system@atlas.local",
        },
        createdAt: now,
        fromStatus: order.status,
        toStatus: status,
      };
      return {
        ...order,
        status,
        events: [...order.events, event],
        updatedAt: now,
      };
    });
    persist(updated);
  };

  const updateOrderPaymentStatus = (
    orderId: string,
    rawStatus: CustomerOrderPaymentStatus | LegacyPaymentStatusLiteral
  ) => {
    const paymentStatus = coercePaymentStatus(rawStatus);
    const now = Date.now();
    const updated = orders.map((order) => {
      if (order.id !== orderId) return order;
      const event: OrderEvent = {
        id: crypto.randomUUID(),
        type:
          paymentStatus === "paid"
            ? "payment_confirmed"
            : paymentStatus === "failed"
            ? "payment_failed"
            : "status_changed",
        description: "Payment status updated.",
        actor: {
          id: user?.id || "system",
          name: user?.name || "System",
          email: user?.email || "system@atlas.local",
        },
        createdAt: now,
      };
      return {
        ...order,
        paymentStatus,
        events: [...order.events, event],
        updatedAt: now,
      };
    });
    persist(updated);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        addOrder,
        updateOrder,
        appendOrderEvent,
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