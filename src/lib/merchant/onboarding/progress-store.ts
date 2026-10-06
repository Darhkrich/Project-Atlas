import type { MerchantOnboardingDraft } from "./types";
import { ONBOARDING_DRAFT_STORAGE_KEY } from "./constants";

let current: MerchantOnboardingDraft | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function persist(): void {
  if (typeof window === "undefined") return;
  if (current === null) {
    window.localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
    return;
  }
  try {
    window.localStorage.setItem(
      ONBOARDING_DRAFT_STORAGE_KEY,
      JSON.stringify(current)
    );
  } catch {
    // Quota exceeded. The draft stays in memory only.
  }
}

function load(): void {
  if (loaded) return;
  if (typeof window === "undefined") return;
  loaded = true;
  const raw = window.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as MerchantOnboardingDraft;
    if (parsed && typeof parsed.draftId === "string") {
      current = parsed;
    }
  } catch {
    window.localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
  }
}

if (typeof window !== "undefined") {
  load();
}

export function getOnboardingDraft(): MerchantOnboardingDraft | null {
  return current;
}

export function setOnboardingDraft(
  next: MerchantOnboardingDraft | null
): void {
  current = next;
  persist();
  emit();
}

export function patchOnboardingDraft(
  patch: Partial<MerchantOnboardingDraft>
): void {
  if (!current) return;
  current = { ...current, ...patch, updatedAt: Date.now() };
  persist();
  emit();
}

export function subscribeToOnboardingDraft(
  listener: () => void
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}