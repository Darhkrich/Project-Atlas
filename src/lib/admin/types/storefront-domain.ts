export type DomainVerificationMethod = "cname" | "txt";

export type DomainVerificationStatus = "pending" | "verified" | "failed";

export interface SubdomainRecord {
  slug: string;
  root: string;
  isCustomSlug: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomDomainRecord {
  hostname: string;
  verificationMethod: DomainVerificationMethod;
  verificationToken: string;
  verificationStatus: DomainVerificationStatus;
  requestedAt: string;
  verifiedAt?: string;
  failureReason?: string;
  isPrimary: boolean;
}

export interface StorefrontDomain {
  storefrontId: string;
  subdomain: SubdomainRecord;
  customDomain?: CustomDomainRecord;
  createdAt: string;
  updatedAt: string;
}


 export type DomainAuditAction =
  | "Subdomain changed"
  | "Custom domain added"
  | "Custom domain removed"
  | "Custom domain verified"
  | "Custom domain verification failed"
  | "Custom domain force verified"
  | "Custom domain force failed"
  | "Primary changed"; 
export interface DomainAuditEntry {
  id: string;
  storefrontId: string;
  storefrontName: string;
  action: DomainAuditAction;
  admin: string;
  adminEmail: string;
  timestamp: string;
  detail?: string;
}