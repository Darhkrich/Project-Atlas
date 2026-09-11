import type { ResellerCommissionWallet } from "../types/reseller-commission-wallet";

export const mockResellerCommissionWallets: ResellerCommissionWallet[] = [
  {
    id: "CW-001",
    resellerId: "RS-001",
    resellerName: "Kwame Store",
    balance: 1250,
    pendingBalance: 200,
    totalEarned: 4500,
    totalWithdrawn: 3250,
    lastCreditAt: new Date(Date.now() - 3600000).toISOString(),
    recentCredits: [
      { id: "CR-001", orderId: "ATX-983821", service: "MTN Data", amount: 50, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "CR-002", orderId: "ATX-983818", service: "DSTV", amount: 200, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ],
    withdrawalRequests: [
      { id: "WR-001", amount: 7500, method: "Bank Transfer", requestedAt: new Date(Date.now() - 7200000).toISOString(), status: "pending" },
    ],
    withdrawalHistory: [
      { id: "WR-000", amount: 500, method: "Mobile Money", requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: "completed" },
    ],
  },
  {
    id: "CW-002",
    resellerId: "RS-002",
    resellerName: "Adjoa Ventures",
    balance: 800,
    pendingBalance: 0,
    totalEarned: 1900,
    totalWithdrawn: 1100,
    lastCreditAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    recentCredits: [],
    withdrawalRequests: [],
    withdrawalHistory: [],
  },
  {
    id: "CW-003",
    resellerId: "RS-004",
    resellerName: "Efua Trading",
    balance: 450,
    pendingBalance: 30,
    totalEarned: 1400,
    totalWithdrawn: 950,
    lastCreditAt: new Date(Date.now() - 7200000).toISOString(),
    recentCredits: [
      { id: "CR-003", orderId: "ATX-983816", service: "WAEC", amount: 30, createdAt: new Date(Date.now() - 7200000).toISOString() },
    ],
    withdrawalRequests: [],
    withdrawalHistory: [],
  },
];