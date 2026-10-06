"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface CurrentMerchant {
  id: string;
  name: string;
  email: string;
  phone?: string;
  storefrontId: string;
  storeSlug: string;
}

const DRAFT_KEY = "atlas-merchant-onboarding-draft";

interface OnboardingDraftShape {
  fullName?: string;
  phone?: string;
}

function readDraft(): OnboardingDraftShape | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const p = parsed as Record<string, unknown>;
    return {
      fullName:
        typeof p.fullName === "string" && p.fullName.trim().length > 0
          ? p.fullName
          : undefined,
      phone:
        typeof p.phone === "string" && p.phone.trim().length > 0
          ? p.phone
          : undefined,
    };
  } catch {
    return null;
  }
}

function looksLikeEmailLocalPart(name: string, email: string): boolean {
  if (!name || !email) return false;
  const local = email.split("@")[0] ?? "";
  return name.trim().toLowerCase() === local.trim().toLowerCase();
}

/**
 * The auth seam for the merchant area. Returns null when there is no
 * signed-in user or the user does not hold the merchant role.
 *
 * Until the onboarding wizard writes the merchant's real name and phone
 * to the auth record, this hook reads the onboarding draft as a fallback
 * when the auth name is still the email local part (the default set at
 * registration). Once the merchant saves their profile, the auth record
 * carries the real values and the fallback stops firing.
 */
export function useCurrentMerchant(): CurrentMerchant | null {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return null;
    if (!user.roles.includes("merchant")) return null;

    const storeSlug = user.email.split("@")[0] || "store";

    let resolvedName = user.name;
    let resolvedPhone = user.phone;

    const nameIsFallback = looksLikeEmailLocalPart(
      resolvedName,
      user.email
    );

    if (nameIsFallback || !resolvedPhone) {
      const draft = readDraft();
      if (nameIsFallback && draft?.fullName) {
        resolvedName = draft.fullName;
      }
      if (!resolvedPhone && draft?.phone) {
        resolvedPhone = draft.phone;
      }
    }

    return {
      id: user.id,
      name: resolvedName,
      email: user.email,
      phone: resolvedPhone,
      storefrontId: "SF-" + user.id,
      storeSlug,
    };
  }, [user]);
}