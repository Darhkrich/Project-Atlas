const SKU_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SKU_RANDOM_LENGTH = 6;

function randomSuffix(length: number): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SKU_ALPHABET[bytes[i] % SKU_ALPHABET.length];
  }
  return out;
}

export function generateSku(): string {
  return "ATL-" + String(new Date().getFullYear()) + "-" + randomSuffix(SKU_RANDOM_LENGTH);
}

export function generateUniqueSku(existingSkus: string[]): string {
  const taken = new Set<string>();
  for (const s of existingSkus) {
    const key = s.trim().toUpperCase();
    if (key.length > 0) taken.add(key);
  }
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = generateSku();
    if (!taken.has(candidate.toUpperCase())) return candidate;
  }
  return "ATL-" + String(new Date().getFullYear()) + "-" + randomSuffix(10);
}