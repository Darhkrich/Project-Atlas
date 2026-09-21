import type {
  DomainVerificationMethod,
  DomainVerificationStatus,
} from "./types";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const VERIFICATION_STATUS_LABEL: Record<
  DomainVerificationStatus,
  string
> = {
  pending: "Pending verification",
  verified: "Verified",
  failed: "Failed",
};

export const VERIFICATION_STATUS_VARIANT: Record<
  DomainVerificationStatus,
  BadgeVariant
> = {
  pending: "warning",
  verified: "success",
  failed: "danger",
};

export const VERIFICATION_METHOD_LABEL: Record<
  DomainVerificationMethod,
  string
> = {
  cname: "CNAME record",
  txt: "TXT record",
};

export const DNS_TARGET_HOST = "domains.atlasgh.com";
export const TXT_RECORD_NAME = "_atlas-verification";
export const SUBDOMAIN_ROOT = "atlasgh.com";

export const ALL_VERIFICATION_STATUSES: DomainVerificationStatus[] = [
  "verified",
  "pending",
  "failed",
];