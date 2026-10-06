import type { CustomerReport } from "./types";

type Listener = () => void;

const STORAGE_KEY = "atlas-merchant-customer-reports";

type StoreMap = Record<string, CustomerReport[]>;

let reports: StoreMap | null = null;
const listeners = new Set<Listener>();

function safeParse(raw: string | null): StoreMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const cleaned: StoreMap = {};
    for (const [slug, list] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      if (!Array.isArray(list)) continue;
      const cleanList: CustomerReport[] = [];
      for (const entry of list) {
        if (entry === null || typeof entry !== "object") continue;
        const e = entry as Record<string, unknown>;
        if (typeof e.id !== "string") continue;
        if (typeof e.customerEmail !== "string") continue;
        if (typeof e.reason !== "string") continue;
        cleanList.push({
          id: e.id,
          storeSlug: typeof e.storeSlug === "string" ? e.storeSlug : slug,
          customerId:
            typeof e.customerId === "string" ? e.customerId : "",
          customerEmail: e.customerEmail,
          customerName:
            typeof e.customerName === "string" ? e.customerName : "",
          reason: e.reason as CustomerReport["reason"],
          note: typeof e.note === "string" ? e.note : undefined,
          createdAt:
            typeof e.createdAt === "number" ? e.createdAt : Date.now(),
          status:
            e.status === "withdrawn" ? "withdrawn" : "submitted",
          withdrawnAt:
            typeof e.withdrawnAt === "number" ? e.withdrawnAt : undefined,
        });
      }
      cleaned[slug] = cleanList;
    }
    return cleaned;
  } catch {
    return {};
  }
}

function ensureLoaded(): StoreMap {
  if (reports === null) {
    if (typeof window === "undefined") {
      reports = {};
    } else {
      reports = safeParse(window.localStorage.getItem(STORAGE_KEY));
    }
  }
  return reports;
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ensureLoaded()));
  } catch {
    // Quota. State stays in memory.
  }
}

export function getReportsForStore(storeSlug: string): CustomerReport[] {
  return (ensureLoaded()[storeSlug] ?? []).slice();
}

export function getActiveReportForCustomer(
  storeSlug: string,
  customerId: string,
  customerEmail: string
): CustomerReport | null {
  const list = ensureLoaded()[storeSlug] ?? [];
  for (const r of list) {
    if (r.status !== "submitted") continue;
    if (customerId && r.customerId === customerId) return r;
    if (customerEmail && r.customerEmail === customerEmail) return r;
  }
  return null;
}

export function internalAppendReport(report: CustomerReport): void {
  const map = ensureLoaded();
  const existing = map[report.storeSlug] ?? [];
  reports = { ...map, [report.storeSlug]: [report, ...existing] };
  persist();
  listeners.forEach((l) => l());
}

export function internalWithdrawReport(
  storeSlug: string,
  reportId: string,
  withdrawnAt: number
): boolean {
  const map = ensureLoaded();
  const list = map[storeSlug] ?? [];
  let found = false;
  const next = list.map((r) => {
    if (r.id !== reportId) return r;
    found = true;
    return { ...r, status: "withdrawn" as const, withdrawnAt };
  });
  if (!found) return false;
  reports = { ...map, [storeSlug]: next };
  persist();
  listeners.forEach((l) => l());
  return true;
}

export function subscribeToReports(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isReportsStoreLoaded(): boolean {
  return reports !== null;
}