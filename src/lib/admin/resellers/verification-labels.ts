import type { Reseller } from "@/lib/admin/types/reseller";
import type { VerificationDocumentStatus } from "@/lib/admin/types/verification-document";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const VERIFICATION_STATUS_LABEL: Record<
  Reseller["verificationStatus"],
  string
> = {
  verified: "Verified",
  pending: "Pending review",
  rejected: "Rejected",
  not_submitted: "Not submitted",
};

export const VERIFICATION_STATUS_VARIANT: Record<
  Reseller["verificationStatus"],
  BadgeVariant
> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  not_submitted: "neutral",
};

export const DOCUMENT_STATUS_LABEL: Record<
  VerificationDocumentStatus,
  string
> = {
  submitted: "Submitted",
  missing: "Missing",
};

export const DOCUMENT_STATUS_VARIANT: Record<
  VerificationDocumentStatus,
  BadgeVariant
> = {
  submitted: "success",
  missing: "danger",
};

export type WaitingTone = "neutral" | "warning" | "danger";

/**
 * Fresh reviews are neutral. Anything over a week is urgent. Anything in
 * between is a heads up.
 */
export function waitingTone(days: number): WaitingTone {
  if (days >= 7) return "danger";
  if (days >= 3) return "warning";
  return "neutral";
}

export const WAITING_TONE_CLASS: Record<WaitingTone, string> = {
  neutral: "text-neutral-500 dark:text-neutral-400",
  warning: "text-warning-700 dark:text-warning-300",
  danger: "text-danger-700 dark:text-danger-300",
};

export function waitingLabel(days: number): string {
  if (days === 0) return "today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}