import type { Reseller } from "@/lib/admin/types/reseller";
import type { VerificationDocument } from "@/lib/admin/types/verification-document";

export interface QueueSummary {
  pending: number;
  verified: number;
  rejected: number;
  notSubmitted: number;
  longestWaitDays: number;
  longestWaitResellerName: string | null;
}

export interface QueueRow {
  reseller: Reseller;
  waitingDays: number;
  documentsSubmitted: number;
  documentsTotal: number;
}

export function waitingDays(reseller: Reseller): number {
  const base = reseller.verificationSubmittedAt ?? reseller.joinedAt;
  const diff = Date.now() - new Date(base).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

export function projectQueue(resellers: Reseller[]): Reseller[] {
  return resellers
    .filter((r) => r.verificationStatus === "pending")
    .sort(
      (a, b) =>
        new Date(a.verificationSubmittedAt ?? a.joinedAt).getTime() -
        new Date(b.verificationSubmittedAt ?? b.joinedAt).getTime()
    );
}

export function documentCounts(
  resellerId: string,
  documents: Record<string, VerificationDocument[]>
): { submitted: number; total: number } {
  const list = documents[resellerId] ?? [];
  let submitted = 0;
  for (const d of list) if (d.status === "submitted") submitted += 1;
  return { submitted, total: list.length };
}

export function projectQueueRows(
  resellers: Reseller[],
  documents: Record<string, VerificationDocument[]>
): QueueRow[] {
  return projectQueue(resellers).map((reseller) => {
    const counts = documentCounts(reseller.id, documents);
    return {
      reseller,
      waitingDays: waitingDays(reseller),
      documentsSubmitted: counts.submitted,
      documentsTotal: counts.total,
    };
  });
}

export function projectQueueSummary(resellers: Reseller[]): QueueSummary {
  let pending = 0;
  let verified = 0;
  let rejected = 0;
  let notSubmitted = 0;
  let longestDays = 0;
  let longestName: string | null = null;

  for (const r of resellers) {
    if (r.verificationStatus === "pending") {
      pending += 1;
      const days = waitingDays(r);
      if (days > longestDays) {
        longestDays = days;
        longestName = r.businessName;
      }
    } else if (r.verificationStatus === "verified") verified += 1;
    else if (r.verificationStatus === "rejected") rejected += 1;
    else notSubmitted += 1;
  }

  return {
    pending,
    verified,
    rejected,
    notSubmitted,
    longestWaitDays: longestDays,
    longestWaitResellerName: longestName,
  };
}