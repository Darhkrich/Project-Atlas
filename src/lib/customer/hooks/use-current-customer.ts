"use client";

import { useAuth } from "@/contexts/auth-context";

export interface CurrentCustomer {
  id: string;
  name: string;
  email: string;
}

// Until the real auth layer ships, this returns the seeded customer. The
// mock session in useAuth returns ids like `user-<timestamp>` that do not
// match the wallet store's CUST-XXX ids, so the fallback keeps the wallet
// rendering. When real auth ships, replace the fallback with a lookup on
// the signed-in user and map the session id to a CUST-XXX id. The customer
// wallet store is already multi-tenant, so no store changes are needed at
// that point.
const FALLBACK_CUSTOMER: CurrentCustomer = {
  id: "CUST-001",
  name: "Ama Serwaa",
  email: "ama@example.com",
};

export function useCurrentCustomer(): CurrentCustomer | null {
  const { user } = useAuth();
  void user;
  return FALLBACK_CUSTOMER;
}