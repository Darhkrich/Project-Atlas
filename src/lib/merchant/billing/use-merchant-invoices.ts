/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import {
  getInvoiceStoreVersion,
  getInvoicesForMerchant,
  isInvoiceStoreLoaded,
  subscribeToInvoiceStore,
} from "./store";
import {
  projectInvoiceRows,
  projectInvoiceTotals,
  projectInvoiceFilters,
} from "./projection";
import { BILLING_PAGE_SIZE } from "./constants";
import type {
  MerchantInvoice,
  InvoiceRow,
  InvoiceTotals,
  InvoiceFilters,
} from "./types";

export interface UseMerchantInvoicesResult {
  invoices: MerchantInvoice[];
  rows: InvoiceRow[];
  visibleRows: InvoiceRow[];
  totals: InvoiceTotals;
  filters: InvoiceFilters;
  setFilters: (next: Partial<InvoiceFilters>) => void;
  showMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

function subscribe(onChange: () => void): () => void {
  return subscribeToInvoiceStore(onChange);
}

function snapshot(): number {
  if (!isInvoiceStoreLoaded()) return -1;
  return getInvoiceStoreVersion();
}

const DEFAULT_FILTERS: InvoiceFilters = {
  status: "all",
  year: "all",
};

export function useMerchantInvoices(): UseMerchantInvoicesResult {
  const merchant = useCurrentMerchant();
  const version = useSyncExternalStore(subscribe, snapshot, () => -1);
  const [filters, setFiltersState] =
    useState<InvoiceFilters>(DEFAULT_FILTERS);
  const [shown, setShown] = useState(BILLING_PAGE_SIZE);

  const setFilters = (next: Partial<InvoiceFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
    setShown(BILLING_PAGE_SIZE);
  };

  const invoices = useMemo(() => {
    if (!merchant) return [] as MerchantInvoice[];
    return getInvoicesForMerchant(merchant.id);
  }, [merchant, version]);

  const filtered = useMemo(
    () => projectInvoiceFilters(invoices, filters),
    [invoices, filters]
  );

  const rows = useMemo(
    () => projectInvoiceRows(filtered),
    [filtered]
  );

  const visibleRows = useMemo(
    () => rows.slice(0, shown),
    [rows, shown]
  );

  const totals = useMemo(
    () => projectInvoiceTotals(invoices),
    [invoices]
  );

  const showMore = () => setShown((n) => n + BILLING_PAGE_SIZE);

  return {
    invoices,
    rows,
    visibleRows,
    totals,
    filters,
    setFilters,
    showMore,
    hasMore: rows.length > shown,
    loading: !merchant || version < 0,
  };
}