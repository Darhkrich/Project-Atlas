import {
  MAX_SLUG_LENGTH,
  MIN_SLUG_LENGTH,
  RESERVED_SLUGS,
  RUNTIME_STOREFRONT_STORE_KEY,
  SLUG_PATTERN,
} from "./constants";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

function readStorefrontConfigMap(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(RUNTIME_STOREFRONT_STORE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

export type SlugCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid";

export interface SlugCheckOutcome {
  status: SlugCheckStatus;
  message: string;
  suggestion: string | null;
}

function suggestAlternative(base: string): string {
  const map = readStorefrontConfigMap();
  for (let i = 1; i < 100; i += 1) {
    const candidate = i === 1 ? base + "-gh" : base + "-" + String(i);
    if (
      !Object.prototype.hasOwnProperty.call(map, candidate) &&
      !RESERVED_SLUGS.has(candidate)
    ) {
      return candidate;
    }
  }
  return base + "-" + Date.now().toString(36);
}

export function checkSlug(slug: string): SlugCheckOutcome {
  if (!slug) {
    return { status: "idle", message: "", suggestion: null };
  }
  if (slug.length < MIN_SLUG_LENGTH) {
    return {
      status: "invalid",
      message: "At least " + String(MIN_SLUG_LENGTH) + " characters.",
      suggestion: null,
    };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return {
      status: "invalid",
      message: "Use lowercase letters, numbers, and hyphens.",
      suggestion: null,
    };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return {
      status: "taken",
      message: "That link is reserved.",
      suggestion: suggestAlternative(slug),
    };
  }
  const map = readStorefrontConfigMap();
  if (Object.prototype.hasOwnProperty.call(map, slug)) {
    return {
      status: "taken",
      message: "That link is taken.",
      suggestion: suggestAlternative(slug),
    };
  }
  return { status: "available", message: "Available", suggestion: null };
}