export type CustomerOrder = {
  id: string;
  orderNumber: string;
  date: string;
  items: number;
  total: string;
  status: "Paid" | "Pending" | "Processing" | "Delivered" | "Failed" | "Refunded";
};

export type CustomerTransaction = {
  id: string;
  description: string;
  date: string;
  amount: string;
  type: "credit" | "debit";
};

export type MerchantCustomerDetail = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: "Active" | "Inactive";
  totalOrders: number;
  totalSpent: string;
  lastActivity: string;
  notes?: string;
  orders: CustomerOrder[];
  transactions: CustomerTransaction[];
};

export const mockMerchantCustomerDetails: Record<string, MerchantCustomerDetail> = {
  cust1: {
    id: "cust1",
    name: "Abena Owusu",
    email: "abena@example.com",
    phone: "024 123 4567",
    address: "123 Palm Street",
    city: "Accra",
    country: "Ghana",
    status: "Active",
    totalOrders: 12,
    totalSpent: "GH₵ 1,450.00",
    lastActivity: "Today, 10:30 AM",
    notes: "Prefers WhatsApp communication. Loyal customer since 2024.",
    orders: [
      {
        id: "ord1",
        orderNumber: "ATL-ORD-1001",
        date: "Today, 10:30 AM",
        items: 3,
        total: "GH₵ 320.00",
        status: "Paid",
      },
      {
        id: "ord4",
        orderNumber: "ATL-ORD-1004",
        date: "Yesterday, 5:20 PM",
        items: 1,
        total: "GH₵ 210.00",
        status: "Delivered",
      },
      {
        id: "ord7",
        orderNumber: "ATL-ORD-1007",
        date: "Aug 20, 2025",
        items: 1,
        total: "GH₵ 60.00",
        status: "Refunded",
      },
    ],
    transactions: [
      {
        id: "tx1",
        description: "Payment for ATL-ORD-1001",
        date: "Today, 10:32 AM",
        amount: "GH₵ 320.00",
        type: "debit",
      },
      {
        id: "tx2",
        description: "Refund for ATL-ORD-1007",
        date: "Aug 20, 2025",
        amount: "GH₵ 60.00",
        type: "credit",
      },
      {
        id: "tx3",
        description: "Payment for ATL-ORD-1004",
        date: "Yesterday, 5:22 PM",
        amount: "GH₵ 210.00",
        type: "debit",
      },
    ],
  },
  cust2: {
    id: "cust2",
    name: "Kwame Mensah",
    email: "kwame@example.com",
    phone: "055 987 6543",
    address: "456 Independence Ave",
    city: "Kumasi",
    country: "Ghana",
    status: "Active",
    totalOrders: 8,
    totalSpent: "GH₵ 980.00",
    lastActivity: "Today, 9:15 AM",
    orders: [
      {
        id: "ord2",
        orderNumber: "ATL-ORD-1002",
        date: "Today, 9:15 AM",
        items: 1,
        total: "GH₵ 150.00",
        status: "Processing",
      },
      {
        id: "ord5",
        orderNumber: "ATL-ORD-1005",
        date: "Yesterday, 9:30 PM",
        items: 2,
        total: "GH₵ 75.00",
        status: "Failed",
      },
    ],
    transactions: [
      {
        id: "tx4",
        description: "Payment for ATL-ORD-1002",
        date: "Today, 9:16 AM",
        amount: "GH₵ 150.00",
        type: "debit",
      },
      {
        id: "tx5",
        description: "Failed payment attempt",
        date: "Yesterday, 9:31 PM",
        amount: "GH₵ 75.00",
        type: "debit",
      },
    ],
  },
};

export const fallbackCustomerDetail: MerchantCustomerDetail = {
  id: "unknown",
  name: "Unknown Customer",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  status: "Inactive",
  totalOrders: 0,
  totalSpent: "GH₵ 0.00",
  lastActivity: "",
  orders: [],
  transactions: [],
};