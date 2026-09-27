"use client";

import { useAuth } from "@/contexts/auth-context";

export interface CurrentReseller {
  status: string;
  verificationStatus: string;
  id: string;
  name: string;
  email: string;
}

const FALLBACK_RESELLER: CurrentReseller = {
    id: "RS-001",
    name: "Kwame Store",
    email: "kwame@kwamestore.com",
    status: "",
    verificationStatus: ""
};

/**
 * The auth seam for the reseller area. Until the real auth layer ships,
 * returns the seeded reseller regardless of what the mock session holds.
 * The mock session generates ids like `user-<timestamp>` that do not
 * match the wallet store, which would blank the wallet.
 *
 * When real auth ships, this reads the session and returns the signed-in
 * reseller's id, name, and email. Callers do not change.
 */
export function useCurrentReseller(): CurrentReseller | null {
  const { user } = useAuth();
  void user;
  return FALLBACK_RESELLER;
}