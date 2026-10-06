// lib/admin/support/support-status-machine.ts
//
// Single source of truth for support ticket status transitions. All three
// support surfaces (main, reseller, ecommerce) route through this module.
// Prevents the free-transition drift the migration was created to close.

import type { SupportStatus } from "@/lib/admin/types/support";

export interface StatusTransitionResult {
  ok: boolean;
  error?: string;
}

const ALLOWED: Record<SupportStatus, SupportStatus[]> = {
  open: ["pending", "resolved", "closed"],
  pending: ["resolved", "closed"],
  resolved: ["open", "pending", "closed"],
  closed: ["open", "pending"],
};

export function canTransition(
  from: SupportStatus,
  to: SupportStatus
): StatusTransitionResult {
  if (from === to) {
    return { ok: false, error: "Ticket already in that state." };
  }
  if (!ALLOWED[from].includes(to)) {
    return {
      ok: false,
      error: "Cannot move from " + from + " to " + to + ".",
    };
  }
  return { ok: true };
}