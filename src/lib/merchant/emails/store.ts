import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_TEMPLATE_KEYS,
} from "./constants";
import type {
  EmailTemplate,
  EmailTemplateKey,
  EmailTemplates,
} from "./types";

const STORAGE_KEY = "atlas-merchant-email-templates";

type StoreMap = Record<string, EmailTemplates>;

let store: StoreMap | null = null;
let loaded = false;
let version = 0;
const listeners = new Set<() => void>();

function emit(): void {
  version += 1;
  listeners.forEach((l) => l());
}

function persist(): void {
  if (typeof window === "undefined") return;
  if (!store) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota. Keep in memory only.
  }
}

function sanitizeTemplate(value: unknown): EmailTemplate | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  return {
    subject: typeof v.subject === "string" ? v.subject : "",
    bodyPrefix: typeof v.bodyPrefix === "string" ? v.bodyPrefix : "",
    bodySuffix: typeof v.bodySuffix === "string" ? v.bodySuffix : "",
    replyTo: typeof v.replyTo === "string" ? v.replyTo : "",
  };
}

function sanitizeTemplates(value: unknown): EmailTemplates {
  const result: EmailTemplates = { ...DEFAULT_EMAIL_TEMPLATES };
  if (!value || typeof value !== "object") return result;
  const v = value as Record<string, unknown>;
  for (const key of EMAIL_TEMPLATE_KEYS) {
    const parsed = sanitizeTemplate(v[key]);
    if (parsed) result[key] = parsed;
  }
  return result;
}

function load(): void {
  if (loaded) return;
  if (typeof window === "undefined") return;
  loaded = true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    store = {};
    return;
  }
  try {
    const parsed = JSON.parse(raw) as StoreMap;
    if (!parsed || typeof parsed !== "object") {
      store = {};
      return;
    }
    const normalised: StoreMap = {};
    for (const key of Object.keys(parsed)) {
      normalised[key] = sanitizeTemplates(parsed[key]);
    }
    store = normalised;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    store = {};
  }
}

if (typeof window !== "undefined") {
  load();
}

export function getEmailTemplatesVersion(): number {
  return version;
}

export function getEmailTemplatesFor(storefrontId: string): EmailTemplates {
  if (!store) load();
  if (!store) return { ...DEFAULT_EMAIL_TEMPLATES };
  return store[storefrontId] ?? { ...DEFAULT_EMAIL_TEMPLATES };
}

export function setEmailTemplatesFor(
  storefrontId: string,
  templates: EmailTemplates
): void {
  if (!store) load();
  store = { ...(store ?? {}), [storefrontId]: templates };
  persist();
  emit();
}

export function subscribeToEmailTemplates(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function defaultFor(key: EmailTemplateKey): EmailTemplate {
  return DEFAULT_EMAIL_TEMPLATES[key];
}