export function storefrontSlugSuggestions(storeName: string): string[] {
  const base = storeName
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  if (!base) return [];

  const candidates = [base, base + "-store", base + "-gh", base + "-shop"];

  return candidates.slice(0, 3);
}