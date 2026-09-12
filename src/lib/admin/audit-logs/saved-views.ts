// lib/admin/audit-logs/saved-views.ts

import type { SavedView } from "@/components/admin/ui/saved-views";

export const BUILTIN_AUDIT_VIEWS: SavedView[] = [
  { name: "All changes", filters: {} },
  { name: "Failures", filters: { result: "failure" } },
  { name: "Role changes", filters: { action: "role_change" } },
  { name: "Wallet adjustments", filters: { action: "wallet_adjustment" } },
  { name: "Settings changes", filters: { action: "settings_change" } },
];