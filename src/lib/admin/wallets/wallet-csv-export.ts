import type {
  WalletFundingLedgerRow,
  WalletWithdrawalQueueRow,
} from "@/lib/admin/types/customer-wallet";

function esc(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function walletQueueToCsv(rows: WalletWithdrawalQueueRow[]): string {
  const header = [
    "Withdrawal ID",
    "Owner",
    "Owner Type",
    "Storefront",
    "Amount",
    "Fee",
    "Total",
    "Source Method",
    "Source Provider",
    "Source Label",
    "Requires Approval Because",
    "Status",
    "Auto Approved",
    "Requested At",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        esc(r.id),
        esc(r.ownerName),
        esc(r.ownerType),
        esc(r.storefrontId ?? ""),
        esc(r.amount),
        esc(r.fee),
        esc(r.total),
        esc(r.sourceMethodId),
        esc(r.sourceProvider),
        esc(r.sourceMaskedLabel),
        esc(r.approvalRequiredReasons.join("; ")),
        esc(r.statusLabel),
        esc(r.autoApproved ? "yes" : "no"),
        esc(r.requestedAt),
      ].join(",")
    );
  }
  return lines.join("\n");
}

export function walletLedgerToCsv(rows: WalletFundingLedgerRow[]): string {
  const header = [
    "Event ID",
    "Kind",
    "Owner",
    "Owner Type",
    "Amount",
    "Fee",
    "Total",
    "Method",
    "Source",
    "Reference",
    "Created At",
  ];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        esc(r.id),
        esc(r.kind),
        esc(r.ownerName),
        esc(r.ownerType),
        esc(r.amount),
        esc(r.fee),
        esc(r.total),
        esc(r.methodLabel),
        esc(r.sourceLabel),
        esc(r.reference),
        esc(r.createdAt),
      ].join(",")
    );
  }
  return lines.join("\n");
}