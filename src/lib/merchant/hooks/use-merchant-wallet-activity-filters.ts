"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type WalletFilter = "all" | "main" | "billing";

export type KindFilter =
  | "all"
  | "funding"
  | "customer_payment"
  | "plan_charge"
  | "refund"
  | "withdrawal"
  | "transfer"
  | "adjustment";

export interface WalletActivityFilters {
  wallet: WalletFilter;
  kind: KindFilter;
}

const VALID_WALLETS: WalletFilter[] = ["all", "main", "billing"];

const VALID_KINDS: KindFilter[] = [
  "all",
  "funding",
  "customer_payment",
  "plan_charge",
  "refund",
  "withdrawal",
  "transfer",
  "adjustment",
];

export function useMerchantWalletActivityFilters(): {
  filters: WalletActivityFilters;
  setWallet: (w: WalletFilter) => void;
  setKind: (k: KindFilter) => void;
  reset: () => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<WalletActivityFilters>(() => {
    const w = searchParams.get("wallet") ?? "all";
    const k = searchParams.get("kind") ?? "all";
    const wallet = (VALID_WALLETS as readonly string[]).includes(w)
      ? (w as WalletFilter)
      : "all";
    const kind = (VALID_KINDS as readonly string[]).includes(k)
      ? (k as KindFilter)
      : "all";
    return { wallet, kind };
  }, [searchParams]);

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.replace(
      query ? pathname + "?" + query : pathname,
      { scroll: false }
    );
  };

  return {
    filters,
    setWallet: (w) => setParam("wallet", w === "all" ? null : w),
    setKind: (k) => setParam("kind", k === "all" ? null : k),
    reset: () => router.replace(pathname, { scroll: false }),
  };
}