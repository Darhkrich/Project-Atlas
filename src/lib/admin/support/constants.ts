// lib/admin/support/constants.ts

import type {
  DigitalServiceCategory,
  SupportCategory,
  SupportChannel,
  SupportPriority,
  SupportStatus,
  SupportTopic,
  SupportUserType,
} from "@/lib/admin/types/support";

// ASCII escape constants. Source files stay ASCII. The escape renders
// identically at runtime. Literal non-ASCII has caused paste corruption
// in this codebase before.
export const MIDDOT = "\u00B7";
export const ELLIPSIS = "\u2026";
export const EM_DASH = "\u2014";
export const COMMAND_KEY = "\u2318";
export const TRIANGLE_UP = "\u25B2";
export const TRIANGLE_DOWN = "\u25BC";
export const CHECK_MARK = "\u2713";
export const CROSS_MARK = "\u2715";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const statusVariant: Record<SupportStatus, BadgeVariant> = {
  open: "warning",
  pending: "info",
  resolved: "success",
  closed: "neutral",
};

export const statusLabel: Record<SupportStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export const priorityVariant: Record<SupportPriority, BadgeVariant> = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
};

export const priorityLabel: Record<SupportPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const channelLabel: Record<SupportChannel, string> = {
  live_chat: "Live chat",
  ticket: "Ticket",
  whatsapp: "WhatsApp",
  phone: "Phone",
};

export const channelIconName: Record<SupportChannel, string> = {
  live_chat: "message-circle",
  ticket: "mail",
  whatsapp: "message-square",
  phone: "phone",
};

export const userTypeLabel: Record<SupportUserType, string> = {
  customer: "Customer",
  reseller: "Reseller",
  merchant: "Merchant",
};

export const categoryLabel: Record<SupportCategory, string> = {
  fulfillment: "Fulfillment",
  billing: "Billing",
  account: "Account",
  kyc: "KYC",
  technical: "Technical",
  other: "Other",
};

export const digitalServiceCategoryLabel: Record<
  DigitalServiceCategory,
  string
> = {
  airtime: "Airtime",
  data: "Data",
  bills: "Bills",
  tv: "TV",
  results: "Exam results",
  gift_cards: "Gift cards",
  other: "Other",
};

export const SUPPORT_STATUSES: SupportStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
];

export const SUPPORT_PRIORITIES: SupportPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

export const SUPPORT_CHANNELS: SupportChannel[] = [
  "live_chat",
  "ticket",
  "whatsapp",
  "phone",
];

export const SUPPORT_USER_TYPES: SupportUserType[] = [
  "customer",
  "reseller",
  "merchant",
];

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  "fulfillment",
  "billing",
  "account",
  "kyc",
  "technical",
  "other",
];

export const topicsByUserType: Record<SupportUserType, SupportTopic[]> = {
  customer: ["airtime", "data", "bills", "tv", "exam_pins", "gift_cards"],
  reseller: [
    "commissions",
    "payouts",
    "downstream_pricing",
    "reseller_storefront",
  ],
  merchant: [
    "subscription",
    "merchant_storefront",
    "template",
    "merchant_billing",
  ],
};

export const topicLabel: Record<SupportTopic, string> = {
  airtime: "Airtime",
  data: "Data",
  bills: "Bills",
  tv: "TV",
  exam_pins: "Exam pins",
  gift_cards: "Gift cards",
  commissions: "Commissions",
  payouts: "Payouts",
  downstream_pricing: "Downstream pricing",
  reseller_storefront: "Reseller storefront",
  subscription: "Subscription",
  merchant_storefront: "Merchant storefront",
  template: "Template",
  merchant_billing: "Merchant billing",
};