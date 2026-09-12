// lib/admin/services/icon-catalog.ts

import type { AtlasIconName } from "@/components/atlas/icons";

export interface ServiceIconOption {
  name: AtlasIconName;
  label: string;
  keywords: string[];
}

/**
 * Curated set of icons that can be assigned to a service category. Kept
 * small on purpose: too many options makes selection harder, not easier.
 * Anything not listed here is not selectable from the picker.
 */
export const SERVICE_ICON_CATALOG: ServiceIconOption[] = [
  { name: "phone", label: "Phone", keywords: ["airtime", "call", "topup"] },
  { name: "globe", label: "Globe", keywords: ["data", "internet", "network", "world"] },
  { name: "wifi", label: "WiFi", keywords: ["internet", "broadband"] },
  { name: "tv", label: "TV", keywords: ["cable", "dstv", "gotv", "startimes"] },
  { name: "zap", label: "Lightning", keywords: ["electricity", "power", "ecg"] },
  { name: "receipt", label: "Receipt", keywords: ["bill", "invoice", "payment"] },
  { name: "graduation", label: "Graduation", keywords: ["exam", "waec", "jamb", "neco", "pins"] },
  { name: "gift", label: "Gift", keywords: ["gift cards", "reward", "voucher"] },
  { name: "grid", label: "Grid", keywords: ["category", "general", "default"] },
  { name: "wallet", label: "Wallet", keywords: ["wallet", "balance", "credit"] },
  { name: "credit-card", label: "Card", keywords: ["payment", "card", "checkout"] },
  { name: "bank", label: "Bank", keywords: ["transfer", "bank", "settlement"] },
  { name: "server", label: "Server", keywords: ["provider", "infra", "api"] },
  { name: "shield", label: "Shield", keywords: ["security", "kyc", "verify"] },
  { name: "star", label: "Star", keywords: ["featured", "premium", "tier"] },
  { name: "clock", label: "Clock", keywords: ["pending", "coming", "schedule"] },
  { name: "check", label: "Check", keywords: ["available", "active"] },
  { name: "x-circle", label: "X circle", keywords: ["inactive", "disabled"] },
  { name: "alert-triangle", label: "Alert", keywords: ["warning", "attention"] },
  { name: "bar-chart", label: "Chart", keywords: ["analytics", "stats", "reports"] },
];

const VALID_ICON_NAMES = new Set<string>(
  SERVICE_ICON_CATALOG.map((entry) => entry.name)
);

export function isServiceIcon(value: string): value is AtlasIconName {
  return VALID_ICON_NAMES.has(value);
}

export function fallbackIcon(): AtlasIconName {
  return "grid";
}

export function resolveServiceIcon(value: string): AtlasIconName {
  return isServiceIcon(value) ? value : fallbackIcon();
}

export function iconLabelFor(value: string): string {
  const match = SERVICE_ICON_CATALOG.find((entry) => entry.name === value);
  return match?.label ?? "Unknown icon";
}

export function searchIcons(query: string): ServiceIconOption[] {
  const q = query.trim().toLowerCase();
  if (!q) return SERVICE_ICON_CATALOG;
  return SERVICE_ICON_CATALOG.filter(
    (entry) =>
      entry.label.toLowerCase().includes(q) ||
      entry.name.toLowerCase().includes(q) ||
      entry.keywords.some((k) => k.includes(q))
  );
}