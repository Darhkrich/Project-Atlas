// lib/admin/merchants/csv-export.ts

import type { Merchant } from "@/lib/admin/types/merchant";
import { subscriptionPlans } from "@/config/subscription-plans";
import { getMerchantMrr } from "@/lib/admin/types/merchant";
import {
  MERCHANT_STATUS_LABEL,
  STORE_STATUS_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
  VERIFICATION_LABEL,
} from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function planName(code: Merchant["subscription"]["planId"]): string {
  return subscriptionPlans.find((p) => p.code === code)?.name ?? code;
}

export function merchantsToCsv(merchants: Merchant[]): string {
  const header = [
    "id",
    "businessName",
    "storeName",
    "contactPerson",
    "email",
    "phone",
    "merchantStatus",
    "verificationStatus",
    "storeStatus",
    "plan",
    "billingCycle",
    "subscriptionStatus",
    "mrr",
    "contractMrr",
    "subscriptionStart",
    "subscriptionEnd",
    "totalOrders",
    "totalRevenue",
    "walletBalance",
    "createdAt",
    "lastActive",
  ];

  const rows = merchants.map((m) => [
    m.id,
    m.businessName,
    m.storeConfig.storeName,
    m.contactPerson,
    m.email,
    m.phone,
    MERCHANT_STATUS_LABEL[m.merchantStatus] ?? m.merchantStatus,
    VERIFICATION_LABEL[m.verificationStatus] ?? m.verificationStatus,
    STORE_STATUS_LABEL[m.storeStatus] ?? m.storeStatus,
    planName(m.subscription.planId),
    m.subscription.billingCycle,
    SUBSCRIPTION_STATUS_LABEL[m.subscription.status] ?? m.subscription.status,
    getMerchantMrr(m),
    m.contractMrr ?? "",
    m.subscription.startDate,
    m.subscription.endDate,
    m.totalOrders,
    m.totalRevenue,
    m.walletBalance ?? 0,
    m.createdAt,
    m.lastActive,
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}