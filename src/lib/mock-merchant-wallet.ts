import type { AtlasIconName } from "@/components/atlas/icons";

export type WalletTransaction = {
  id: string;
  description: string;
  date: string;
  amount: string;
  type: "credit" | "debit";
  method: string;
  icon: AtlasIconName;
};

export const merchantWallet = {
  balance: "GH₵ 2,450.00",
  currency: "GHS",
};

export const walletTransactions: WalletTransaction[] = [
  {
    id: "wt1",
    description: "Wallet funding",
    date: "Today, 9:15 AM",
    amount: "GH₵ 500.00",
    type: "credit",
    method: "Mobile Money",
    icon: "mobile",
  },
  {
    id: "wt2",
    description: "Withdrawal to bank",
    date: "Yesterday, 4:30 PM",
    amount: "GH₵ 200.00",
    type: "debit",
    method: "Bank Transfer",
    icon: "bank",
  },
  {
    id: "wt3",
    description: "Order payment received",
    date: "Yesterday, 2:10 PM",
    amount: "GH₵ 320.00",
    type: "credit",
    method: "Card Payment",
    icon: "card",
  },
  {
    id: "wt4",
    description: "Subscription renewal",
    date: "Aug 20, 2025",
    amount: "GH₵ 150.00",
    type: "debit",
    method: "Card Payment",
    icon: "card",
  },
  {
    id: "wt5",
    description: "Withdrawal to mobile money",
    date: "Aug 18, 2025",
    amount: "GH₵ 100.00",
    type: "debit",
    method: "Mobile Money",
    icon: "mobile",
  },
  {
    id: "wt6",
    description: "Order payment received",
    date: "Aug 18, 2025",
    amount: "GH₵ 450.00",
    type: "credit",
    method: "Mobile Money",
    icon: "mobile",
  },
];