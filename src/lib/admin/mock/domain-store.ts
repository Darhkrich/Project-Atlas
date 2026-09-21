import type {
  DomainAuditEntry,
  DomainVerificationStatus,
  StorefrontDomain,
} from "@/lib/admin/types/storefront-domain";
import {
  generateVerificationToken,
  normalizeHostname,
  normalizeSlug,
  validateHostname,
  validateSlug,
} from "@/lib/admin/domains/domain-helpers";
import { mockDomains } from "./domains";
import { mockStorefronts } from "./storefronts";

interface StoreState {
  domains: StorefrontDomain[];
  audit: DomainAuditEntry[];
  loaded: boolean;
}

const state: StoreState = {
  domains: [],
  audit: [],
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  state.domains = structuredClone(mockDomains);
  state.loaded = true;
}

export interface DomainActor {
  name: string;
  email: string;
}

export interface DomainMutationResult {
  ok: boolean;
  domain?: StorefrontDomain;
  error?: string;
}

/* ------------------------------ Subscribe ----------------------------- */

export function subscribeToDomainStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getDomains(): StorefrontDomain[] {
  ensureLoaded();
  return state.domains;
}

export function getDomainFor(
  storefrontId: string
): StorefrontDomain | undefined {
  ensureLoaded();
  return state.domains.find((d) => d.storefrontId === storefrontId);
}

export function getDomainAudit(): DomainAuditEntry[] {
  ensureLoaded();
  return state.audit;
}

export function getDomainAuditFor(
  storefrontId: string
): DomainAuditEntry[] {
  ensureLoaded();
  return state.audit
    .filter((a) => a.storefrontId === storefrontId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export function allSlugs(): string[] {
  ensureLoaded();
  return state.domains.map((d) => d.subdomain.slug);
}

export function allHostnames(): string[] {
  ensureLoaded();
  return state.domains
    .map((d) => d.customDomain?.hostname)
    .filter((h): h is string => Boolean(h));
}

/* ------------------------------ Internals ----------------------------- */

function storefrontName(id: string): string {
  return mockStorefronts.find((sf) => sf.id === id)?.storeName ?? id;
}

function pushAudit(input: {
  storefrontId: string;
  action: DomainAuditEntry["action"];
  actor: DomainActor;
  detail?: string;
}): void {
  state.audit = [
    {
      id: crypto.randomUUID(),
      storefrontId: input.storefrontId,
      storefrontName: storefrontName(input.storefrontId),
      action: input.action,
      admin: input.actor.name,
      adminEmail: input.actor.email,
      timestamp: new Date().toISOString(),
      detail: input.detail,
    },
    ...state.audit,
  ];
}

function patch(
  storefrontId: string,
  updater: (d: StorefrontDomain) => StorefrontDomain
): StorefrontDomain | null {
  ensureLoaded();
  let next: StorefrontDomain | null = null;
  state.domains = state.domains.map((d) => {
    if (d.storefrontId !== storefrontId) return d;
    next = updater(d);
    return next;
  });
  if (next) notify();
  return next;
}

/* ------------------------------ Mutations ----------------------------- */

export function changeSubdomainSlug(
  storefrontId: string,
  rawSlug: string,
  actor: DomainActor
): DomainMutationResult {
  ensureLoaded();
  const current = state.domains.find((d) => d.storefrontId === storefrontId);
  if (!current) return { ok: false, error: "Domain not found." };

  const slug = normalizeSlug(rawSlug);
  const others = state.domains
    .filter((d) => d.storefrontId !== storefrontId)
    .map((d) => d.subdomain.slug);
  const validation = validateSlug(slug, others, current.subdomain.slug);
  if (!validation.ok) return { ok: false, error: validation.reason };

  if (slug === current.subdomain.slug) {
    return { ok: true, domain: current };
  }

  const now = new Date().toISOString();
  const next = patch(storefrontId, (d) => ({
    ...d,
    subdomain: {
      ...d.subdomain,
      slug,
      isCustomSlug: true,
      updatedAt: now,
    },
    updatedAt: now,
  }));
  if (!next) return { ok: false, error: "Domain not found." };

  pushAudit({
    storefrontId,
    action: "Subdomain changed",
    actor,
    detail: current.subdomain.slug + " → " + slug,
  });
  return { ok: true, domain: next };
}

export function addCustomDomain(
  storefrontId: string,
  rawHostname: string,
  actor: DomainActor
): DomainMutationResult {
  ensureLoaded();
  const current = state.domains.find((d) => d.storefrontId === storefrontId);
  if (!current) return { ok: false, error: "Domain not found." };
  if (current.customDomain) {
    return {
      ok: false,
      error: "This storefront already has a custom domain. Remove it first.",
    };
  }

  const hostname = normalizeHostname(rawHostname);
  const others = state.domains
    .map((d) => d.customDomain?.hostname)
    .filter((h): h is string => Boolean(h));
  const validation = validateHostname(hostname, others);
  if (!validation.ok) return { ok: false, error: validation.reason };

  const now = new Date().toISOString();
  const next = patch(storefrontId, (d) => ({
    ...d,
    customDomain: {
      hostname,
      verificationMethod: "cname",
      verificationToken: generateVerificationToken(),
      verificationStatus: "pending",
      requestedAt: now,
      isPrimary: false,
    },
    updatedAt: now,
  }));
  if (!next) return { ok: false, error: "Domain not found." };

  pushAudit({
    storefrontId,
    action: "Custom domain added",
    actor,
    detail: hostname,
  });
  return { ok: true, domain: next };
}

export function removeCustomDomain(
  storefrontId: string,
  actor: DomainActor
): DomainMutationResult {
  ensureLoaded();
  const current = state.domains.find((d) => d.storefrontId === storefrontId);
  if (!current || !current.customDomain) {
    return { ok: false, error: "No custom domain on this storefront." };
  }

  const removedHostname = current.customDomain.hostname;
  const now = new Date().toISOString();
  const next = patch(storefrontId, (d) => ({
    ...d,
    customDomain: undefined,
    updatedAt: now,
  }));
  if (!next) return { ok: false, error: "Domain not found." };

  pushAudit({
    storefrontId,
    action: "Custom domain removed",
    actor,
    detail: removedHostname,
  });
  return { ok: true, domain: next };
}

export function setCustomDomainMethod(
  storefrontId: string,
  method: "cname" | "txt",
  actor: DomainActor
): DomainMutationResult {
  ensureLoaded();
  const current = state.domains.find((d) => d.storefrontId === storefrontId);
  if (!current || !current.customDomain) {
    return { ok: false, error: "No custom domain on this storefront." };
  }

  const now = new Date().toISOString();
  const next = patch(storefrontId, (d) => ({
    ...d,
    customDomain: d.customDomain
      ? { ...d.customDomain, verificationMethod: method }
      : undefined,
    updatedAt: now,
  }));
  if (!next) return { ok: false, error: "Domain not found." };
  void actor;
  return { ok: true, domain: next };
}

const FAILURE_REASONS = [
  "CNAME record not found. DNS propagation may still be underway.",
  "TXT record value does not match. Check for typos in the token.",
  "DNS lookup timed out. Try again in a few minutes.",
];

export async function verifyDomain(
  storefrontId: string,
  actor: DomainActor
): Promise<DomainMutationResult> {
  ensureLoaded();
  const current = state.domains.find((d) => d.storefrontId === storefrontId);
  if (!current || !current.customDomain) {
    return { ok: false, error: "No custom domain on this storefront." };
  }
  if (current.customDomain.verificationStatus === "verified") {
    return { ok: false, error: "Already verified." };
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const success = Math.random() < 0.8;
  const now = new Date().toISOString();

  if (success) {
    const next = patch(storefrontId, (d) => ({
      ...d,
      customDomain: d.customDomain
        ? {
            ...d.customDomain,
            verificationStatus: "verified" as DomainVerificationStatus,
            verifiedAt: now,
            failureReason: undefined,
            isPrimary: true,
          }
        : undefined,
      updatedAt: now,
    }));
    if (!next) return { ok: false, error: "Domain not found." };
    pushAudit({
      storefrontId,
      action: "Custom domain verified",
      actor,
      detail: next.customDomain?.hostname,
    });
    return { ok: true, domain: next };
  }

  const reason =
    FAILURE_REASONS[Math.floor(Math.random() * FAILURE_REASONS.length)];
  const next = patch(storefrontId, (d) => ({
    ...d,
    customDomain: d.customDomain
      ? {
          ...d.customDomain,
          verificationStatus: "failed" as DomainVerificationStatus,
          failureReason: reason,
          isPrimary: false,
        }
      : undefined,
    updatedAt: now,
  }));
  if (!next) return { ok: false, error: "Domain not found." };
  pushAudit({
    storefrontId,
    action: "Custom domain verification failed",
    actor,
    detail: reason,
  });
  return { ok: true, domain: next };
}

export function forceVerify(
  storefrontId: string,
  reason: string,
  actor: DomainActor
): DomainMutationResult {
  ensureLoaded();
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }
  const current = state.domains.find((d) => d.storefrontId === storefrontId);
  if (!current || !current.customDomain) {
    return { ok: false, error: "No custom domain on this storefront." };
  }
  if (current.customDomain.verificationStatus === "verified") {
    return { ok: false, error: "Already verified." };
  }

  const now = new Date().toISOString();
  const next = patch(storefrontId, (d) => ({
    ...d,
    customDomain: d.customDomain
      ? {
          ...d.customDomain,
          verificationStatus: "verified" as DomainVerificationStatus,
          verifiedAt: now,
          failureReason: undefined,
          isPrimary: true,
        }
      : undefined,
    updatedAt: now,
  }));
  if (!next) return { ok: false, error: "Domain not found." };

  pushAudit({
    storefrontId,
    action: "Custom domain force verified",
    actor,
    detail: trimmed,
  });
  return { ok: true, domain: next };
}

export function forceFail(
  storefrontId: string,
  reason: string,
  actor: DomainActor
): DomainMutationResult {
  ensureLoaded();
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }
  const current = state.domains.find((d) => d.storefrontId === storefrontId);
  if (!current || !current.customDomain) {
    return { ok: false, error: "No custom domain on this storefront." };
  }

  const now = new Date().toISOString();
  const next = patch(storefrontId, (d) => ({
    ...d,
    customDomain: d.customDomain
      ? {
          ...d.customDomain,
          verificationStatus: "failed" as DomainVerificationStatus,
          failureReason: trimmed,
          isPrimary: false,
        }
      : undefined,
    updatedAt: now,
  }));
  if (!next) return { ok: false, error: "Domain not found." };

  pushAudit({
    storefrontId,
    action: "Custom domain force failed",
    actor,
    detail: trimmed,
  });
  return { ok: true, domain: next };
}

export function setPrimary(
  storefrontId: string,
  isPrimary: boolean,
  actor: DomainActor
): DomainMutationResult {
  ensureLoaded();
  const current = state.domains.find((d) => d.storefrontId === storefrontId);
  if (!current || !current.customDomain) {
    return { ok: false, error: "No custom domain on this storefront." };
  }
  if (
    isPrimary &&
    current.customDomain.verificationStatus !== "verified"
  ) {
    return {
      ok: false,
      error: "Only verified custom domains can be primary.",
    };
  }

  const now = new Date().toISOString();
  const next = patch(storefrontId, (d) => ({
    ...d,
    customDomain: d.customDomain
      ? { ...d.customDomain, isPrimary }
      : undefined,
    updatedAt: now,
  }));
  if (!next) return { ok: false, error: "Domain not found." };

  pushAudit({
    storefrontId,
    action: "Primary changed",
    actor,
    detail: isPrimary ? "Custom domain is primary" : "Subdomain is primary",
  });
  return { ok: true, domain: next };
}

export type { DomainVerificationStatus };