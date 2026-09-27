export type ProviderResponseOutcome = "settle" | "delay" | "fail";

const SETTLE_CEILING = 850;
const DELAY_CEILING = 960;

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 1000;
}

export function simulateProviderResponse(
  providerId: string,
  batchId: string
): ProviderResponseOutcome {
  const bucket = hashString(providerId + "|" + batchId);
  if (bucket < SETTLE_CEILING) return "settle";
  if (bucket < DELAY_CEILING) return "delay";
  return "fail";
}

export function delayDurationMs(
  providerId: string,
  batchId: string
): number {
  const bucket = hashString("delay|" + providerId + "|" + batchId);
  return ((bucket % 5) + 1) * 1000;
}

export function firstFireAtMs(
  providerId: string,
  batchId: string,
  nowMs: number
): number {
  return nowMs + delayDurationMs(providerId, batchId);
}

export function rescheduleFireAtMs(nowMs: number): number {
  return nowMs + 3000;
}