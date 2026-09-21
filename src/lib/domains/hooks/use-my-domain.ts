"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addCustomDomain as addCustomDomainMutation,
  changeSubdomainSlug,
  getDomainFor,
  removeCustomDomain as removeCustomDomainMutation,
  setCustomDomainMethod,
  setPrimary as setPrimaryMutation,
  subscribeToDomainStore,
  verifyDomain as verifyDomainMutation,
  type DomainMutationResult,
} from "@/lib/domains/store";
import type { DomainActor, StorefrontDomain } from "@/lib/domains/types";

export interface UseMyDomainResult {
  domain: StorefrontDomain | null;
  loading: boolean;
  missing: boolean;
  changeSlug: (slug: string) => DomainMutationResult;
  addCustomDomain: (hostname: string) => DomainMutationResult;
  removeCustomDomain: () => DomainMutationResult;
  setMethod: (method: "cname" | "txt") => DomainMutationResult;
  verify: () => Promise<DomainMutationResult>;
  setPrimary: (isPrimary: boolean) => DomainMutationResult;
}

export function useMyDomain(params: {
  storefrontId: string | undefined;
  ownerName: string;
  ownerEmail: string;
}): UseMyDomainResult {
  const { storefrontId, ownerName, ownerEmail } = params;
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 150);
    const unsub = subscribeToDomainStore(() => setTick((x) => x + 1));
    return () => {
      window.clearTimeout(t);
      unsub();
    };
  }, []);

  const domain = useMemo(
    () => (storefrontId ? getDomainFor(storefrontId) ?? null : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storefrontId, tick]
  );

  const actor: DomainActor = useMemo(
    () => ({
      type: "owner",
      name: ownerName,
      email: ownerEmail,
    }),
    [ownerName, ownerEmail]
  );

  const changeSlug = (slug: string) => {
    if (!storefrontId) {
      return { ok: false, error: "Storefront not available." };
    }
    return changeSubdomainSlug(storefrontId, slug, actor);
  };

  const addCustomDomain = (hostname: string) => {
    if (!storefrontId) {
      return { ok: false, error: "Storefront not available." };
    }
    return addCustomDomainMutation(storefrontId, hostname, actor);
  };

  const removeCustomDomain = () => {
    if (!storefrontId) {
      return { ok: false, error: "Storefront not available." };
    }
    return removeCustomDomainMutation(storefrontId, actor);
  };

  const setMethod = (method: "cname" | "txt") => {
    if (!storefrontId) {
      return { ok: false, error: "Storefront not available." };
    }
    return setCustomDomainMethod(storefrontId, method, actor);
  };

  const verify = async () => {
    if (!storefrontId) {
      return { ok: false, error: "Storefront not available." };
    }
    return verifyDomainMutation(storefrontId, actor);
  };

  const setPrimary = (isPrimary: boolean) => {
    if (!storefrontId) {
      return { ok: false, error: "Storefront not available." };
    }
    return setPrimaryMutation(storefrontId, isPrimary, actor);
  };

  return {
    domain,
    loading,
    missing: !loading && !domain,
    changeSlug,
    addCustomDomain,
    removeCustomDomain,
    setMethod,
    verify,
    setPrimary,
  };
}