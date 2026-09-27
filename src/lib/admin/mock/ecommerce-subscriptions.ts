import type { MerchantSubscription, Invoice } from "../types/ecommerce";

export const mockMerchantSubscriptions: MerchantSubscription[] = [
  {
    id: "SUB-001",
    merchantId: "MER-001",
    merchantName: "TechHub Store",
    planCode: "pro",
    planName: "Pro",
    status: "active",
    startDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    billingCycle: "monthly",
    amountPaid: 400,
    lastPaymentDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    currency: "",
    nextBillingDate: ""
  },
  {
    id: "SUB-002",
    merchantId: "MER-002",
    merchantName: "FashionPlus",
    planCode: "growth",
    planName: "Growth",
    status: "active",
    startDate: new Date(Date.now() - 86400000 * 90).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 275).toISOString(),
    billingCycle: "annual",
    amountPaid: 1500,
    lastPaymentDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    currency: "",
    nextBillingDate: ""
  },
  {
    id: "SUB-003",
    merchantId: "MER-003",
    merchantName: "HomeEssentials",
    planCode: "pro",
    planName: "Premium",
    status: "past_due",
    startDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    endDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    billingCycle: "monthly",
    amountPaid: 300,
    lastPaymentDate: new Date(Date.now() - 86400000 * 40).toISOString(),
    currency: "",
    nextBillingDate: ""
  },
  {
    id: "SUB-004",
    merchantId: "MER-004",
    merchantName: "GadgetWorld",
    planCode: "starter",
    planName: "Starter",
    status: "cancelled",
    startDate: new Date(Date.now() - 86400000 * 120).toISOString(),
    endDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    billingCycle: "monthly",
    amountPaid: 50,
    lastPaymentDate: new Date(Date.now() - 86400000 * 60).toISOString(),
    currency: "",
    nextBillingDate: ""
  },
  {
    id: "SUB-005",
    merchantId: "MER-005",
    merchantName: "BeautyCorner",
    planCode: "growth",
    planName: "Growth",
    status: "expired",
    startDate: new Date(Date.now() - 86400000 * 365).toISOString(),
    endDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    billingCycle: "annual",
    amountPaid: 1500,
    lastPaymentDate: new Date(Date.now() - 86400000 * 370).toISOString(),
    currency: "",
    nextBillingDate: ""
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "INV-001", subscriptionId: "SUB-001", amount: 400, date: new Date(Date.now() - 86400000 * 2).toISOString(), status: "paid",
    merchantId: "",
    merchantName: "",
    currency: "",
    dueDate: "",
    periodStart: "",
    periodEnd: ""
  },
  {
    id: "INV-002", subscriptionId: "SUB-002", amount: 1500, date: new Date(Date.now() - 86400000 * 10).toISOString(), status: "paid",
    merchantId: "",
    merchantName: "",
    currency: "",
    dueDate: "",
    periodStart: "",
    periodEnd: ""
  },
  {
    id: "INV-003", subscriptionId: "SUB-003", amount: 300, date: new Date(Date.now() - 86400000 * 40).toISOString(), status: "unpaid",
    merchantId: "",
    merchantName: "",
    currency: "",
    dueDate: "",
    periodStart: "",
    periodEnd: ""
  },
];