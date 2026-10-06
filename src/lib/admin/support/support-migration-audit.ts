// lib/admin/support/support-migration-audit.ts
//
// Registry of merchant support tickets migrated from the deleted
// ecommerce parallel store. TKT-XXXX IDs were preserved through the
// migration. This file exists for a build-time existence check and for
// any URL redirect a stale bookmark might need. Delete after one release.

export interface MigratedTicketRecord {
  id: string;
  source: "ecommerce-support";
  originalMerchantId: string;
}

export const MIGRATED_TICKETS: MigratedTicketRecord[] = [
  { id: "TKT-2001", source: "ecommerce-support", originalMerchantId: "MER-001" },
  { id: "TKT-2002", source: "ecommerce-support", originalMerchantId: "MER-002" },
  { id: "TKT-2003", source: "ecommerce-support", originalMerchantId: "MER-003" },
  { id: "TKT-2004", source: "ecommerce-support", originalMerchantId: "MER-004" },
  { id: "TKT-2005", source: "ecommerce-support", originalMerchantId: "MER-005" },
  { id: "TKT-2006", source: "ecommerce-support", originalMerchantId: "MER-006" },
  { id: "TKT-2007", source: "ecommerce-support", originalMerchantId: "MER-007" },
  { id: "TKT-2008", source: "ecommerce-support", originalMerchantId: "MER-001" },
  { id: "TKT-2009", source: "ecommerce-support", originalMerchantId: "MER-008" },
  { id: "TKT-2010", source: "ecommerce-support", originalMerchantId: "MER-001" },
  { id: "TKT-2011", source: "ecommerce-support", originalMerchantId: "MER-002" },
  { id: "TKT-2012", source: "ecommerce-support", originalMerchantId: "MER-003" },
  { id: "TKT-2013", source: "ecommerce-support", originalMerchantId: "MER-004" },
  { id: "TKT-2014", source: "ecommerce-support", originalMerchantId: "MER-005" },
];