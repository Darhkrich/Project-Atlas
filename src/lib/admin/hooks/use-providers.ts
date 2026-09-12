/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import {
  getProviders,
  getProviderById,
  getHealthHistory,
  getTransactions,
  getAuditLog,
  subscribeToProviderStore,
  type ProviderStoreSnapshot,
} from "@/lib/admin/mock/providers-store";
import type {
  Provider,
  HealthCheckHistory,
  ProviderTransaction,
  ProviderAuditEntry,
} from "@/lib/admin/types/provider";

/* ------------------------------ List ---------------------------------- */

export interface UseProvidersResult {
  providers: Provider[];
  loading: boolean;
  error: string | null;
}

export function useProviders(): UseProvidersResult {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const pull = () => {
      if (cancelled) return;
      try {
        setProviders(getProviders());
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load providers"
        );
      } finally {
        setLoading(false);
      }
    };

    const t = window.setTimeout(pull, 300);
    const unsubscribe = subscribeToProviderStore(pull);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      unsubscribe();
    };
  }, []);

  return { providers, loading, error };
}

/* ------------------------------ Detail -------------------------------- */

export interface UseProviderResult {
  provider: Provider | null;
  healthHistory: HealthCheckHistory[];
  transactions: ProviderTransaction[];
  auditLog: ProviderAuditEntry[];
  loading: boolean;
  notFound: boolean;
  error: string | null;
}

export function useProvider(id: string | undefined): UseProviderResult {
  const [snapshot, setSnapshot] = useState<ProviderStoreSnapshot | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setSnapshot(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const pull = () => {
      if (cancelled) return;
      try {
        const provider = getProviderById(id);
        if (!provider) {
          setSnapshot(null);
          setError(null);
          return;
        }
        setSnapshot({
          providers: getProviders(),
          healthHistory: getHealthHistory(id),
          transactions: getTransactions(id),
          auditLog: getAuditLog(id),
        });
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load provider"
        );
      } finally {
        setLoading(false);
      }
    };

    pull();
    const unsubscribe = subscribeToProviderStore(pull);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [id]);

  const provider =
    snapshot && id
      ? snapshot.providers.find((p) => p.id === id) ?? null
      : null;

  const notFound =
    !loading && Boolean(id) && !provider && error === null;

  return {
    provider,
    healthHistory: snapshot?.healthHistory ?? [],
    transactions: snapshot?.transactions ?? [],
    auditLog: snapshot?.auditLog ?? [],
    loading,
    notFound,
    error,
  };
}