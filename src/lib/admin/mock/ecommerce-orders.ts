import type { EcommerceOrder } from "../types/ecommerce-order";

export const mockEcommerceOrders: EcommerceOrder[] = [
  {
    id: "ORD-1001",
    merchantId: "MER-001",
    merchantName: "TechHub Store",
    customerName: "Ama Serwaa",
    items: [
      { id: "ITEM-1", productName: "Wireless Earbuds", quantity: 1, unitPrice: 150, totalPrice: 150 },
      { id: "ITEM-2", productName: "Laptop Stand", quantity: 1, unitPrice: 200, totalPrice: 200 },
    ],
    totalAmount: 350,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "card",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ORD-1002",
    merchantId: "MER-002",
    merchantName: "FashionPlus",
    customerName: "Efua Mensimah",
    items: [
      { id: "ITEM-3", productName: "Summer Dress", quantity: 2, unitPrice: 60, totalPrice: 120 },
    ],
    totalAmount: 120,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "momo",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "ORD-1003",
    merchantId: "MER-003",
    merchantName: "HomeEssentials",
    customerName: "Kojo Appiah",
    items: [
      { id: "ITEM-4", productName: "Blender", quantity: 1, unitPrice: 80, totalPrice: 80 },
    ],
    totalAmount: 80,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "bank_transfer",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ORD-1004",
    merchantId: "MER-004",
    merchantName: "GadgetWorld",
    customerName: "Yaw Boateng",
    items: [
      { id: "ITEM-5", productName: "Smart Watch", quantity: 1, unitPrice: 220, totalPrice: 220 },
    ],
    totalAmount: 220,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "card",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];