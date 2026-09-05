import type { AtlasIconName } from "@/components/atlas/icons";

export type MerchantTransaction = {
  id: string;
  storeSlug: string;
  description: string;
  orderNumber?: string;
  date: string;
  amount: number;
  type: "Payment" | "Refund" | "Withdrawal";
  status: "Completed" | "Pending";
  icon: AtlasIconName;
};

const baseTransactions: Omit<MerchantTransaction, "storeSlug">[] = [
  {
    id: "tx1",
    description: "Order payment received",
    orderNumber: "ATL-ORD-1001",
    date: "Today, 10:30 AM",
    amount: 320,
    type: "Payment",
    status: "Completed",
    icon: "cart",
  },
  {
    id: "tx2",
    description: "Withdrawal to bank",
    date: "Yesterday, 4:30 PM",
    amount: -200,
    type: "Withdrawal",
    status: "Completed",
    icon: "bank",
  },
  {
    id: "tx3",
    description: "Refund for order",
    orderNumber: "ATL-ORD-1005",
    date: "Aug 20, 2025",
    amount: -75,
    type: "Refund",
    status: "Completed",
    icon: "receipt",
  },
  {
    id: "tx4",
    description: "Order payment received",
    orderNumber: "ATL-ORD-1002",
    date: "Aug 18, 2025",
    amount: 150,
    type: "Payment",
    status: "Pending",
    icon: "cart",
  },
];

export function getMockMerchantTransactions(storeSlug: string): MerchantTransaction[] {
  return baseTransactions.map((tx) => ({ ...tx, storeSlug }));
}