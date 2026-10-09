import { ONBOARDING_STORE_KEY } from "./constants";
import type { OnboardingDraft } from "./types";

type DraftMap = Record<string, OnboardingDraft>;

let state: DraftMap = {};
let loaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_STORE_KEY, JSON.stringify(state));
  } catch {
    // localStorage full or disabled
  }
}

function hydrate() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ONBOARDING_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        state = parsed as DraftMap;
      }
    }
  } catch {
    state = {};
  }
  loaded = true;
}

if (typeof window !== "undefined") {
  hydrate();
}

export function isOnboardingStoreLoaded(): boolean {
  return loaded;
}

export function getOnboardingStore(): DraftMap {
  return state;
}

export function subscribeToOnboardingStore(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function setOnboardingDraft(key: string, draft: OnboardingDraft): void {
  state = { ...state, [key]: draft };
  persist();
  notify();
}

export function removeOnboardingDraft(key: string): void {
  if (!state[key]) return;
  const next = { ...state };
  delete next[key];
  state = next;
  persist();
  notify();
}