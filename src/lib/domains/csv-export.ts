import type { StorefrontDomain } from "./types";
import type { DomainRow } from "./projection";
import { subdomainFor } from "./projection";
import { VERIFICATION_STATUS_LABEL } from "./labels";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function domainsToCsv(rows: DomainRow[]): string {
  const header = [
    "storefrontId",
    "storefrontName",
    "storefrontType",
    "ownerName",
    "subdomain",
    "subdomainCustomSlug",
    "customHostname",
    "verificationStatus",
    "verificationMethod",
    "isPrimary",
    "verifiedAt",
    "failureReason",
    "updatedAt",
  ];

  const body = rows.map(({ domain, storefront }) => {
    const cd = domain.customDomain;
    return [
      storefront.id,
      storefront.storeName,
      storefront.type,
      storefront.ownerName,
      subdomainFor(domain),
      domain.subdomain.isCustomSlug ? "yes" : "no",
      cd?.hostname ?? "",
      cd ? VERIFICATION_STATUS_LABEL[cd.verificationStatus] : "",
      cd?.verificationMethod ?? "",
      cd?.isPrimary ? "yes" : "no",
      cd?.verifiedAt ?? "",
      cd?.failureReason ?? "",
      domain.updatedAt,
    ];
  });

  return rowsToCsv(header, body);
}

export type { StorefrontDomain };