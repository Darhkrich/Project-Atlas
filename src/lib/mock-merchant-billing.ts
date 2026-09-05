import type { AtlasIconName } from "@/components/atlas/icons";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  downloadUrl: string;
};

export type PaymentMethod = {
  id: string;
  type: "Card" | "Mobile Money" | "Bank Transfer";
  details: string;
  isDefault: boolean;
  icon: AtlasIconName;
};

export const currentSubscription = {
  planName: "Growth",
  planCode: "growth",
  priceMonthly: "GH₵ 150",
  priceAnnual: "GH₵ 1,500",
  billingCycle: "monthly" as "monthly" | "annual",
  nextBillingDate: "September 22, 2025",
  status: "Active",
};

export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm1",
    type: "Card",
    details: "Visa ending in 4242",
    isDefault: true,
    icon: "card",
  },
  {
    id: "pm2",
    type: "Mobile Money",
    details: "MTN MoMo • 024 123 4567",
    isDefault: false,
    icon: "mobile",
  },
  {
    id: "pm3",
    type: "Bank Transfer",
    details: "Bank of Ghana • 0123456789",
    isDefault: false,
    icon: "bank",
  },
];

export const invoices: Invoice[] = [
  {
    id: "inv1",
    invoiceNumber: "INV-2025-001",
    date: "Aug 22, 2025",
    amount: "GH₵ 150.00",
    status: "Paid",
    downloadUrl: "#",
  },
  {
    id: "inv2",
    invoiceNumber: "INV-2025-002",
    date: "Jul 22, 2025",
    amount: "GH₵ 150.00",
    status: "Paid",
    downloadUrl: "#",
  },
  {
    id: "inv3",
    invoiceNumber: "INV-2025-003",
    date: "Jun 22, 2025",
    amount: "GH₵ 150.00",
    status: "Paid",
    downloadUrl: "#",
  },
  {
    id: "inv4",
    invoiceNumber: "INV-2025-004",
    date: "May 22, 2025",
    amount: "GH₵ 150.00",
    status: "Paid",
    downloadUrl: "#",
  },
  {
    id: "inv5",
    invoiceNumber: "INV-2025-005",
    date: "Apr 22, 2025",
    amount: "GH₵ 150.00",
    status: "Pending",
    downloadUrl: "#",
  },
];