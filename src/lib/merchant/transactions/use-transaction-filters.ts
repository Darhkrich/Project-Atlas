"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  TransactionFilters,
  TransactionKind,
  TransactionKindFilter,
  TransactionRange,
  TransactionWalletFilter,
  TransactionWalletType,
} from "./types";
import { KIND_OPTIONS, RANGE_OPTIONS, WALLET_OPTIONS } from "./constants";

const VALID_KINDS: readonly string[] = ["all", ...KIND_OPTIONS];
const VALID_WALLETS: readonly string[] = ["all", ...WALLET_OPTIONS];
const VALID_RANGES: readonly string[] = RANGE_OPTIONS;

const DEFAULT_FILTERS: TransactionFilters = {
  kind: "all",
  wallet: "all",
  range: "30d",
  search: "",
};

export interface UseTransactionFiltersResult {
  filters: TransactionFilters;
  page: number;
  setKind: (kind: TransactionKindFilter) => void;
  setWallet: (wallet: TransactionWalletFilter) => void;
  setRange: (range: TransactionRange) => void;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  reset: () => void;
}

export function useTransactionFilters(): UseTransactionFiltersResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo<TransactionFilters>(() => {
    const kind = searchParams.get("kind") ?? "all";
    const wallet = searchParams.get("wallet") ?? "all";
    const range = searchParams.get("range") ?? "30d";
    const search = searchParams.get("q") ?? "";
    return {
      kind: VALID_KINDS.includes(kind)
        ? (kind as TransactionKindFilter)
        : "all",
      wallet: VALID_WALLETS.includes(wallet)
        ? (wallet as TransactionWalletFilter)
        : "all",
      range: VALID_RANGES.includes(range)
        ? (range as TransactionRange)
        : "30d",
      search,
    };
  }, [searchParams]);

  const page = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
  }, [searchParams]);

  const setParam = useCallback(
    (updates: Record<string, string | null>, resetPage: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      if (resetPage) params.delete("page");
      const query = params.toString();
      router.replace(query ? pathname + "?" + query : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );

  const setKind = useCallback(
    (kind: TransactionKindFilter) =>
      setParam({ kind: kind === "all" ? null : kind }, true),
    [setParam]
  );
  const setWallet = useCallback(
    (wallet: TransactionWalletFilter) =>
      setParam({ wallet: wallet === "all" ? null : wallet }, true),
    [setParam]
  );
  const setRange = useCallback(
    (range: TransactionRange) => {
      setParam({ range: range === "30d" ? null : range }, true);
    },
    [setParam]
  );
  const setSearch = useCallback(
    (search: string) =>
      setParam({ q: search.trim() === "" ? null : search }, true),
    [setParam]
  );
  const setPage = useCallback(
    (next: number) =>
      setParam({ page: next <= 1 ? null : String(next) }, false),
    [setParam]
  );
  const reset = useCallback(
    () => router.replace(pathname, { scroll: false }),
    [router, pathname]
  );

  return {
    filters,
    page,
    setKind,
    setWallet,
    setRange,
    setSearch,
    setPage,
    reset,
  };
}

export { DEFAULT_FILTERS };
export type { TransactionKind, TransactionWalletType };