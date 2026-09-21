import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import type {
  DomainVerificationStatus,
  StorefrontDomain,
} from "./types";

export interface DomainRow {
  domain: StorefrontDomain;
  storefront: UnifiedStorefront;
}

export interface DomainSummary {
  total: number;
  subdomainCount: number;
  customVerified: number;
  customPending: number;
  customFailed: number;
  noCustomDomain: number;
}

export interface DomainFilters {
  q: string;
  type: string;
  status: string;
  primary: string;
}

export interface DnsRecord {
  type: string;
  name: string;
  value: string;
  description: string;
}

export function projectDomains(
  domains: StorefrontDomain[],
  storefronts: UnifiedStorefront[]
): DomainRow[] {
  const byId = new Map(storefronts.map((sf) => [sf.id, sf]));
  const out: DomainRow[] = [];
  for (const d of domains) {
    const storefront = byId.get(d.storefrontId);
    if (!storefront) continue;
    out.push({ domain: d, storefront });
  }
  return out.sort((a, b) =>
    a.storefront.storeName.localeCompare(b.storefront.storeName)
  );
}

export function projectDomainSummary(rows: DomainRow[]): DomainSummary {
  let subdomainCount = 0;
  let customVerified = 0;
  let customPending = 0;
  let customFailed = 0;
  let noCustomDomain = 0;

  for (const { domain } of rows) {
    subdomainCount += 1;
    const cd = domain.customDomain;
    if (!cd) {
      noCustomDomain += 1;
      continue;
    }
    if (cd.verificationStatus === "verified") customVerified += 1;
    else if (cd.verificationStatus === "pending") customPending += 1;
    else if (cd.verificationStatus === "failed") customFailed += 1;
  }

  return {
    total: rows.length,
    subdomainCount,
    customVerified,
    customPending,
    customFailed,
    noCustomDomain,
  };
}

export function filterDomains(
  rows: DomainRow[],
  filters: DomainFilters
): DomainRow[] {
  const q = filters.q.trim().toLowerCase();
  return rows.filter(({ domain, storefront }) => {
    if (q) {
      const hay =
        storefront.storeName +
        " " +
        storefront.ownerName +
        " " +
        domain.subdomain.slug +
        " " +
        (domain.customDomain?.hostname ?? "");
      if (!hay.toLowerCase().includes(q)) return false;
    }
    if (filters.type && storefront.type !== filters.type) return false;
    if (filters.status) {
      const cd = domain.customDomain;
      if (filters.status === "subdomain-only" && cd) return false;
      if (filters.status === "custom-verified") {
        if (!cd || cd.verificationStatus !== "verified") return false;
      }
      if (filters.status === "custom-pending") {
        if (!cd || cd.verificationStatus !== "pending") return false;
      }
      if (filters.status === "custom-failed") {
        if (!cd || cd.verificationStatus !== "failed") return false;
      }
    }
    if (filters.primary === "custom") {
      if (!domain.customDomain?.isPrimary) return false;
    }
    if (filters.primary === "subdomain") {
      if (domain.customDomain?.isPrimary) return false;
    }
    return true;
  });
}

export function subdomainFor(domain: StorefrontDomain): string {
  return domain.subdomain.slug + "." + domain.subdomain.root;
}

export function primaryHostnameFor(domain: StorefrontDomain): string {
  if (
    domain.customDomain?.isPrimary &&
    domain.customDomain.verificationStatus === "verified"
  ) {
    return domain.customDomain.hostname;
  }
  return subdomainFor(domain);
}

export function customDomainStatus(
  domain: StorefrontDomain
): DomainVerificationStatus | null {
  return domain.customDomain?.verificationStatus ?? null;
}

export function dnsRecordsFor(domain: StorefrontDomain): DnsRecord[] {
  const cd = domain.customDomain;
  if (!cd) return [];

  const hostnameParts = cd.hostname.split(".");
  const isApex = hostnameParts.length === 2;
  const nameValue = isApex ? "@" : hostnameParts[0];

  return [
    {
      type: "CNAME",
      name: nameValue,
      value: "domains.atlasgh.com",
      description: isApex
        ? "Point the apex record at Atlas. Some DNS providers require an ALIAS or ANAME record instead."
        : "Point this subdomain at Atlas.",
    },
    {
      type: "TXT",
      name: "_atlas-verification",
      value: "atlas-verification=" + cd.verificationToken,
      description:
        "Fallback method. Use this if your DNS provider does not allow CNAME records.",
    },
  ];
}