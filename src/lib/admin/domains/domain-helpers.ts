const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "mail",
  "ftp",
  "cdn",
  "static",
  "assets",
  "docs",
  "blog",
  "help",
  "support",
  "status",
  "dashboard",
  "store",
  "shop",
  "atlas",
]);

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const MIN_SLUG_LENGTH = 3;
const MAX_SLUG_LENGTH = 63;

export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH);
}

export function generateSlugFromName(name: string): string {
  const slug = normalizeSlug(name);
  if (slug.length >= MIN_SLUG_LENGTH && !RESERVED_SLUGS.has(slug)) {
    return slug;
  }
  if (RESERVED_SLUGS.has(slug)) return slug + "-store";
  return slug.length > 0 ? slug + "-store" : "storefront";
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export type SlugValidation =
  | { ok: true }
  | { ok: false; reason: string };

export function validateSlug(
  slug: string,
  existing: string[],
  currentSlug: string
): SlugValidation {
  if (slug.length < MIN_SLUG_LENGTH) {
    return {
      ok: false,
      reason: "Slug must be at least " + MIN_SLUG_LENGTH + " characters.",
    };
  }
  if (slug.length > MAX_SLUG_LENGTH) {
    return {
      ok: false,
      reason: "Slug must be " + MAX_SLUG_LENGTH + " characters or fewer.",
    };
  }
  if (!SLUG_REGEX.test(slug)) {
    return {
      ok: false,
      reason:
        "Only lowercase letters, numbers, and hyphens. Must start and end with a letter or number.",
    };
  }
  if (isReservedSlug(slug)) {
    return { ok: false, reason: '"' + slug + '" is a reserved name.' };
  }
  if (slug !== currentSlug && existing.includes(slug)) {
    return { ok: false, reason: "That slug is already in use." };
  }
  return { ok: true };
}

/* ------------------------------ Custom domain ------------------------- */

const HOSTNAME_REGEX = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z0-9-]{1,63})+$/i;

export function normalizeHostname(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.+$/, "");
}

export type HostnameValidation =
  | { ok: true }
  | { ok: false; reason: string };

export function validateHostname(
  hostname: string,
  existing: string[]
): HostnameValidation {
  if (!hostname) {
    return { ok: false, reason: "Enter a domain name." };
  }
  if (hostname.length > 253) {
    return { ok: false, reason: "Domain name is too long." };
  }
  if (!HOSTNAME_REGEX.test(hostname)) {
    return {
      ok: false,
      reason: "Enter a valid domain name, for example www.example.com.",
    };
  }
  if (hostname.endsWith("atlasgh.com")) {
    return {
      ok: false,
      reason:
        "Custom domains cannot use the Atlas root domain. Use a subdomain slug instead.",
    };
  }
  if (existing.includes(hostname)) {
    return { ok: false, reason: "That domain is already in use." };
  }
  return { ok: true };
}

/* ------------------------------ Token --------------------------------- */

export function generateVerificationToken(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}