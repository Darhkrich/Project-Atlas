/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AtlasIconName } from "@/components/atlas/icons";

export type MerchantOrderStatus =
  | "Paid"
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Failed"
  | "Refunded";

export type MerchantOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  total: string;
  items: number;
  status: MerchantOrderStatus;
  paymentMethod: string;
};

export const mockMerchantOrders: MerchantOrder[] = [
  {
    id: "ord1",
    orderNumber: "ATL-ORD-1001",
    customerName: "Abena Owusu",
    customerEmail: "abena@example.com",
    date: "Today, 10:30 AM",
    total: "GH₵ 320.00",
    items: 3,
    status: "Paid",
    paymentMethod: "Mobile Money",
  },
  {
    id: "ord2",
    orderNumber: "ATL-ORD-1002",
    customerName: "Kwame Mensah",
    customerEmail: "kwame@example.com",
    date: "Today, 9:15 AM",
    total: "GH₵ 150.00",
    items: 1,
    status: "Processing",
    paymentMethod: "Card",
  },
  {
    id: "ord3",
    orderNumber: "ATL-ORD-1003",
    customerName: "Yaa Boateng",
    customerEmail: "yaa@example.com",
    date: "Yesterday, 8:40 PM",
    total: "GH₵ 95.00",
    items: 2,
    status: "Pending",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "ord4",
    orderNumber: "ATL-ORD-1004",
    customerName: "Ama Serwaa",
    customerEmail: "ama@example.com",
    date: "Yesterday, 5:20 PM",
    total: "GH₵ 210.00",
    items: 1,
    status: "Delivered",
    paymentMethod: "Mobile Money",
  },
  {
    id: "ord5",
    orderNumber: "ATL-ORD-1005",
    customerName: "Kofi Adjei",
    customerEmail: "kofi@example.com",
    date: "Yesterday, 9:30 PM",
    total: "GH₵ 75.00",
    items: 2,
    status: "Failed",
    paymentMethod: "Mobile Money",
  },
  {
    id: "ord6",
    orderNumber: "ATL-ORD-1006",
    customerName: "Efua Owusua",
    customerEmail: "efua@example.com",
    date: "Aug 20, 2025",
    total: "GH₵ 420.00",
    items: 4,
    status: "Shipped",
    paymentMethod: "Card",
  },
  {
    id: "ord7",
    orderNumber: "ATL-ORD-1007",
    customerName: "Nana Yaa",
    customerEmail: "nana@example.com",
    date: "Aug 20, 2025",
    total: "GH₵ 60.00",
    items: 1,
    status: "Refunded",
    paymentMethod: "Mobile Money",
  },
  {
    id: "ord8",
    orderNumber: "ATL-ORD-1008",
    customerName: "Akosua Manu",
    customerEmail: "akosua@example.com",
    date: "Aug 19, 2025",
    total: "GH₵ 185.00",
    items: 3,
    status: "Delivered",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "ord9",
    orderNumber: "ATL-ORD-1009",
    customerName: "Yaw Darko",
    customerEmail: "yaw@example.com",
    date: "Aug 19, 2025",
    total: "GH₵ 300.00",
    items: 2,
    status: "Processing",
    paymentMethod: "Card",
  },
  {
    id: "ord10",
    orderNumber: "ATL-ORD-1010",
    customerName: "Adwoa Poku",
    customerEmail: "adwoa@example.com",
    date: "Aug 18, 2025",
    total: "GH₵ 50.00",
    items: 1,
    status: "Paid",
    paymentMethod: "Mobile Money",
  },
];