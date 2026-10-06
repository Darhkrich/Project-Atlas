import type { WalletAutoApproveConfig } from "./enums";

type Listener = () => void;

let config: WalletAutoApproveConfig | null = null;
const listeners = new Set<Listener>();

const ANCHOR_MS = Date.now();

function seed(): WalletAutoApproveConfig {
  return {
    thresholdGHS: 5000,
    feeRatePercent: 0.5,
    dailyCap: 2,
    refundAutoApproveThreshold: 5000,
    updatedAt: new Date(ANCHOR_MS - 30 * 86_400_000).toISOString(),
    updatedBy: "System",
  };
}

function ensureLoaded(): WalletAutoApproveConfig {
  if (config === null) config = seed();
  return config;
}

export function getWalletConfig(): WalletAutoApproveConfig {
  return ensureLoaded();
}

export function subscribeToWalletConfig(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isWalletConfigLoaded(): boolean {
  return config !== null;
}

export function notifyWalletConfig(): void {
  listeners.forEach((l) => l());
}

export function resetWalletConfigForTest(): void {
  config = seed();
  listeners.clear();
}

export function internalPatchWalletConfig(
  updater: (c: WalletAutoApproveConfig) => WalletAutoApproveConfig
): WalletAutoApproveConfig {
  const current = ensureLoaded();
  config = updater(current);
  return config;
}