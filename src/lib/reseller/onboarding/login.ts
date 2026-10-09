import { CREDENTIAL_STUB_KEY_PREFIX } from "./constants";
import type { LoginResult } from "./types";

/**
 * Stub. Real auth verifies the password. The stub accepts any password
 * for a known email so the flow is walkable end to end. Replace when the
 * auth layer ships.
 */
export function loginReseller(email: string, password: string): LoginResult {
  if (typeof window === "undefined") {
    return { success: false, error: "Storage is unavailable." };
  }
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password) {
    return { success: false, error: "Enter your email and password." };
  }
  try {
    const raw = localStorage.getItem(CREDENTIAL_STUB_KEY_PREFIX + normalized);
    if (!raw) {
      return { success: false, error: "No account matches that email." };
    }
    return { success: true, error: null };
  } catch {
    return { success: false, error: "Could not check your account." };
  }
}