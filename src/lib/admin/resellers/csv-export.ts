import type { Reseller } from "@/lib/admin/types/reseller";
import type { ResellerCommission } from "@/lib/admin/types/commission";
import { STATUS_LABEL, VERIFICATION_LABEL } from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function resellersToCsv(
  resellers: Reseller[],
  walletBalanceById: Map<string, number>
): string {
  const header = [
    "id",
    "businessName",
    "storeName",
    "contactPerson",
    "email",
    "phone",
    "status",
    "verificationStatus",
    "tierName",
    "walletBalance",
    "totalOrders",
    "totalRevenue",
    "commissionsEarned",
    "commissionsPending",
    "commissionsPaid",
    "joinedAt",
    "lastActive",
  ];

  const rows = resellers.map((r) => [
    r.id,
    r.businessName,
    r.storeName ?? "",
    r.contactPerson,
    r.email,
    r.phone,
    STATUS_LABEL[r.status] ?? r.status,
    VERIFICATION_LABEL[r.verificationStatus] ?? r.verificationStatus,
    r.tierName ?? "",
    walletBalanceById.get(r.id) ?? 0,
    r.totalOrders,
    r.totalRevenue,
    r.commissionsEarned,
    r.commissionsPending,
    r.commissionsPaid,
    r.joinedAt,
    r.lastActive,
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}

export function resellerCommissionsToCsv(
  commissions: ResellerCommission[]
): string {
  const header = [
    "id",
    "orderId",
    "service",
    "serviceCategory",
    "providerCost",
    "atlasPrice",
    "resellerPrice",
    "baseCommission",
    "extraAmount",
    "resellerExtraCut",
    "totalCommission",
    "tierName",
    "status",
    "createdAt",
    "paidAt",
  ];

  const rows = commissions.map((c) => [
    c.id,
    c.orderId,
    c.service,
    c.serviceCategory,
    c.providerCost,
    c.atlasPrice,
    c.resellerPrice,
    c.baseCommission,
    c.extraAmount,
    c.resellerExtraCut,
    c.totalCommission,
    c.tierName ?? "",
    c.status,
    c.createdAt,
    c.paidAt ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}