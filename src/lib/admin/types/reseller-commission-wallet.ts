export interface ResellerCommissionWallet {
  id: string;
  resellerId: string;
  resellerName: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  lastCreditAt: string;
  recentCredits: {
    id: string;
    orderId: string;
    service: string;
    amount: number;
    createdAt: string;
  }[];
  withdrawalRequests: {
    id: string;
    amount: number;
    method: string;
    requestedAt: string;
    status: "pending";
  }[]; // only for amounts >= 5000
  withdrawalHistory: {
    id: string;
    amount: number;
    method: string;
    requestedAt: string;
    status: "completed" | "failed";
  }[];
}