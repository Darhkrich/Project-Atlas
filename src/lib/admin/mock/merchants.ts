import type { Merchant } from "../types/merchant";

export const mockMerchants: Merchant[] = [
  {
    id: "MER-001",
    businessName: "TechHub Store",
    contactPerson: "Nana Kofi",
    email: "nana@techhub.com",
    phone: "+233 24 555 6666",
    storeConfig: {
      storeName: "TechHub",
      slug: "techhub",
      primaryColor: "#166e59",
      accentColor: "#ffa000",
      templateId: "tpl-general-store",
      subdomain: "techhub.atlas.store",
      customDomain: "shop.techhub.com",
    },
    subscription: {
      planId: "pro",
      status: "active",
      startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      billingCycle: "monthly",
    },
    verificationStatus: "verified",
    merchantStatus: "active",
    storeStatus: "live",
    totalOrders: 150,
    totalRevenue: 25000,
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 200).toISOString(),
    recentOrders: [
      { id: "ORD-1001", itemCount: 2, total: 350, date: new Date().toISOString() },
      { id: "ORD-1002", itemCount: 1, total: 120, date: new Date(Date.now() - 86400000).toISOString() },
    ],
    recentPayments: [
      { id: "PAY-2001", amount: 350, method: "Card", date: new Date().toISOString() },
      { id: "PAY-2002", amount: 120, method: "MoMo", date: new Date(Date.now() - 86400000).toISOString() },
    ],
    walletBalance: 800,
    walletTransactions: [
      { id: "WT-1", type: "Payment credit", amount: 350, date: new Date().toISOString() },
      { id: "WT-2", type: "Payment credit", amount: 120, date: new Date(Date.now() - 86400000).toISOString() },
    ],
    activityLog: [
      { id: "MA-1", timestamp: new Date().toISOString(), action: "Logged in" },
    ],
    auditTrail: [
      { id: "AT-1", timestamp: new Date().toISOString(), admin: "finance@atlas.com", action: "Changed plan to Pro" },
    ],
  },
  // ... other merchants (add walletBalance and walletTransactions similarly)
];