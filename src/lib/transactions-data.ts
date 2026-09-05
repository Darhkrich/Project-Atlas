export type TransactionType =
  | "Purchase"
  | "Wallet Funding"
  | "Commission"
  | "Refund";

export type TransactionStatus =
  | "Successful"
  | "Pending"
  | "Failed";

export type Transaction = {
  id: string;
  reference: string;
  type: TransactionType;
  description: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  date: string;
  service?: string;
  customer?: string;
  paymentMethod?: string;
};

export const mockResellerTransactions: Transaction[] = [
  {
    id: "txn-001",
    reference: "ATL-TXN-8F21A",
    type: "Purchase",
    description: "MTN Data Bundle",
    amount: -25,
    balanceBefore: 325.5,
    balanceAfter: 300.5,
    status: "Successful",
    date: "Aug 24, 2026 • 10:42 AM",
    service: "MTN Data",
    customer: "Kwame Mensah",
    paymentMethod: "Wallet",
  },
  {
    id: "txn-002",
    reference: "ATL-TXN-7B91C",
    type: "Wallet Funding",
    description: "Wallet funding",
    amount: 200,
    balanceBefore: 125.5,
    balanceAfter: 325.5,
    status: "Successful",
    date: "Aug 24, 2026 • 9:15 AM",
    paymentMethod: "Mobile Money",
  },
  {
    id: "txn-003",
    reference: "ATL-TXN-61A2D",
    type: "Purchase",
    description: "Telecel Data Bundle",
    amount: -15,
    balanceBefore: 140.5,
    balanceAfter: 125.5,
    status: "Successful",
    date: "Aug 23, 2026 • 6:31 PM",
    service: "Telecel Data",
    customer: "Ama Boateng",
    paymentMethod: "Wallet",
  },
  {
    id: "txn-004",
    reference: "ATL-TXN-55D8E",
    type: "Commission",
    description: "Order commission",
    amount: 3.75,
    balanceBefore: 136.75,
    balanceAfter: 140.5,
    status: "Successful",
    date: "Aug 23, 2026 • 6:35 PM",
    service: "Telecel Data",
    customer: "Ama Boateng",
  },
  {
    id: "txn-005",
    reference: "ATL-TXN-43C91",
    type: "Purchase",
    description: "ECG Prepaid Token",
    amount: -50,
    balanceBefore: 186.75,
    balanceAfter: 136.75,
    status: "Successful",
    date: "Aug 22, 2026 • 3:18 PM",
    service: "ECG",
    customer: "Kofi Asare",
    paymentMethod: "Wallet",
  },
  {
    id: "txn-006",
    reference: "ATL-TXN-39A77",
    type: "Wallet Funding",
    description: "Wallet funding",
    amount: 100,
    balanceBefore: 86.75,
    balanceAfter: 186.75,
    status: "Pending",
    date: "Aug 22, 2026 • 2:04 PM",
    paymentMethod: "Mobile Money",
  },
  {
    id: "txn-007",
    reference: "ATL-TXN-2E51B",
    type: "Purchase",
    description: "DSTV Subscription",
    amount: -120,
    balanceBefore: 206.75,
    balanceAfter: 86.75,
    status: "Failed",
    date: "Aug 21, 2026 • 8:41 PM",
    service: "DSTV",
    customer: "Yaw Owusu",
    paymentMethod: "Wallet",
  },
  {
    id: "txn-008",
    reference: "ATL-TXN-1D22F",
    type: "Refund",
    description: "Refund for failed DSTV order",
    amount: 120,
    balanceBefore: 86.75,
    balanceAfter: 206.75,
    status: "Successful",
    date: "Aug 21, 2026 • 8:46 PM",
    service: "DSTV",
    customer: "Yaw Owusu",
  },
];

export function formatTransactionAmount(amount: number) {
  const sign = amount >= 0 ? "+" : "-";

  return `${sign}GH₵${Math.abs(amount).toFixed(2)}`;
}