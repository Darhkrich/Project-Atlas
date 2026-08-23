/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AtlasIconName } from "@/components/atlas/icons";

export type OrderItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  image: string;
};

export type OrderTimelineEvent = {
  title: string;
  description: string;
  time: string;
  status: "completed" | "current" | "pending";
};

export type MerchantOrderDetail = {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  date: string;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Failed";
  subtotal: string;
  shipping: string;
  discount: string;
  total: string;
  items: OrderItem[];
  timeline: OrderTimelineEvent[];
  notes: string;
};

export const mockMerchantOrderDetail: Record<string, MerchantOrderDetail> = {
  ord1: {
    id: "ord1",
    orderNumber: "ATL-ORD-1001",
    customer: {
      name: "Abena Owusu",
      email: "abena@example.com",
      phone: "024 123 4567",
      address: "123 Palm Street",
      city: "Accra",
      country: "Ghana",
    },
    date: "Today, 10:30 AM",
    paymentMethod: "Mobile Money",
    paymentStatus: "Paid",
    subtotal: "GH₵ 305.00",
    shipping: "GH₵ 15.00",
    discount: "GH₵ 0.00",
    total: "GH₵ 320.00",
    items: [
      {
        id: "oi1",
        name: "Vitamin C Face Serum",
        sku: "ATL-2025-1001",
        quantity: 2,
        unitPrice: "GH₵ 120.00",
        totalPrice: "GH₵ 240.00",
        image: "🧴",
      },
      {
        id: "oi2",
        name: "Shea Butter Body Cream",
        sku: "ATL-2025-1002",
        quantity: 1,
        unitPrice: "GH₵ 65.00",
        totalPrice: "GH₵ 65.00",
        image: "🧴",
      },
    ],
    timeline: [
      {
        title: "Order Placed",
        description: "Customer placed the order",
        time: "Today, 10:30 AM",
        status: "completed",
      },
      {
        title: "Payment Confirmed",
        description: "Payment received via Mobile Money",
        time: "Today, 10:32 AM",
        status: "completed",
      },
      {
        title: "Processing",
        description: "Order is being prepared",
        time: "Today, 10:35 AM",
        status: "current",
      },
      {
        title: "Shipped",
        description: "Package will be sent to customer",
        time: "Pending",
        status: "pending",
      },
      {
        title: "Delivered",
        description: "Customer receives package",
        time: "Pending",
        status: "pending",
      },
    ],
    notes: "Customer requested gift wrapping.",
  },
  // Add other orders if needed for demonstration
  ord2: {
    id: "ord2",
    orderNumber: "ATL-ORD-1002",
    customer: {
      name: "Kwame Mensah",
      email: "kwame@example.com",
      phone: "055 987 6543",
      address: "456 Independence Ave",
      city: "Kumasi",
      country: "Ghana",
    },
    date: "Today, 9:15 AM",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    subtotal: "GH₵ 150.00",
    shipping: "GH₵ 0.00",
    discount: "GH₵ 0.00",
    total: "GH₵ 150.00",
    items: [
      {
        id: "oi3",
        name: "Aloe Vera Gel",
        sku: "ATL-2025-1003",
        quantity: 1,
        unitPrice: "GH₵ 150.00",
        totalPrice: "GH₵ 150.00",
        image: "🌿",
      },
    ],
    timeline: [
      {
        title: "Order Placed",
        description: "Customer placed the order",
        time: "Today, 9:15 AM",
        status: "completed",
      },
      {
        title: "Payment Confirmed",
        description: "Payment received via Card",
        time: "Today, 9:16 AM",
        status: "completed",
      },
      {
        title: "Processing",
        description: "Order is being prepared",
        time: "Today, 9:20 AM",
        status: "current",
      },
      {
        title: "Shipped",
        description: "Package will be sent to customer",
        time: "Pending",
        status: "pending",
      },
      {
        title: "Delivered",
        description: "Customer receives package",
        time: "Pending",
        status: "pending",
      },
    ],
    notes: "",
  },
};

// Fallback if orderId not found
export const fallbackOrderDetail: MerchantOrderDetail = {
  id: "unknown",
  orderNumber: "Unknown",
  customer: {
    name: "Unknown Customer",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  },
  date: "",
  paymentMethod: "",
  paymentStatus: "Pending",
  subtotal: "GH₵ 0.00",
  shipping: "GH₵ 0.00",
  discount: "GH₵ 0.00",
  total: "GH₵ 0.00",
  items: [],
  timeline: [],
  notes: "",
};