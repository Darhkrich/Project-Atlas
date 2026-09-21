import type { WalletAutoApproveConfig } from "./enums";
import {
  getStorefrontUserState,
  internalPatchStorefrontUserConfig,
} from "./storefront-user-state";

export interface StorefrontUserConfigActor {
  id: string;
  name: string;
  email: string;
}

export interface UpdateStorefrontUserConfigInput {
  thresholdGHS?: number;
  feeRatePercent?: number;
  dailyCap?: number;
}

export interface UpdateStorefrontUserConfigResult {
  ok: boolean;
  error?: string;
  config?: WalletAutoApproveConfig;
}

export function getStorefrontUserConfig(): WalletAutoApproveConfig {
  return getStorefrontUserState().config;
}

export function updateStorefrontUserConfig(
  patch: UpdateStorefrontUserConfigInput,
  actor: StorefrontUserConfigActor
): UpdateStorefrontUserConfigResult {
  if (patch.thresholdGHS !== undefined) {
    if (
      !Number.isFinite(patch.thresholdGHS) ||
      !Number.isInteger(patch.thresholdGHS) ||
      patch.thresholdGHS < 100 ||
      patch.thresholdGHS > 100_000
    ) {
      return {
        ok: false,
        error: "Threshold must be between 100 and 100000.",
      };
    }
  }
  if (patch.feeRatePercent !== undefined) {
    if (
      !Number.isFinite(patch.feeRatePercent) ||
      patch.feeRatePercent < 0 ||
      patch.feeRatePercent > 10
    ) {
      return { ok: false, error: "Fee rate must be between 0 and 10." };
    }
  }
  if (patch.dailyCap !== undefined) {
    if (
      !Number.isInteger(patch.dailyCap) ||
      patch.dailyCap < 0 ||
      patch.dailyCap > 20
    ) {
      return { ok: false, error: "Daily cap must be between 0 and 20." };
    }
  }

  const next = internalPatchStorefrontUserConfig((current) => ({
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.name,
  }));
  return { ok: true, config: next };
}