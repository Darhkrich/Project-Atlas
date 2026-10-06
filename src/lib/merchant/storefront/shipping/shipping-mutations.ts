import { seedShippingConfig, defaultZonesForNewConfig } from "./seed";
import {
  getShippingFor,
  setShippingFor,
} from "./shipping-store";
import type { ShippingConfig, ShippingZone } from "./types";

export function ensureShippingSeeded(storefrontId: string): ShippingConfig {
  const existing = getShippingFor(storefrontId);
  if (existing) return existing;
  const fresh = seedShippingConfig(storefrontId);
  setShippingFor(fresh);
  return fresh;
}

function updateConfig(
  storefrontId: string,
  updater: (config: ShippingConfig) => ShippingConfig
): ShippingConfig | null {
  const current = ensureShippingSeeded(storefrontId);
  const next = updater(current);
  setShippingFor(next);
  return next;
}

export function setPickupEnabled(
  storefrontId: string,
  enabled: boolean
): ShippingConfig | null {
  return updateConfig(storefrontId, (config) => ({
    ...config,
    pickupEnabled: enabled,
  }));
}

export function setPickupAddress(
  storefrontId: string,
  address: string
): ShippingConfig | null {
  return updateConfig(storefrontId, (config) => ({
    ...config,
    pickupAddress: address,
  }));
}

export function setPickupInstructions(
  storefrontId: string,
  instructions: string
): ShippingConfig | null {
  return updateConfig(storefrontId, (config) => ({
    ...config,
    pickupInstructions: instructions,
  }));
}

export function addShippingZone(storefrontId: string): ShippingConfig | null {
  return updateConfig(storefrontId, (config) => ({
    ...config,
    zones: [
      ...config.zones,
      {
        id: crypto.randomUUID(),
        name: "New zone",
        fee: 0,
        freeAbove: null,
        enabled: true,
      },
    ],
  }));
}

export function removeShippingZone(
  storefrontId: string,
  zoneId: string
): ShippingConfig | null {
  return updateConfig(storefrontId, (config) => {
    if (config.zones.length <= 1) return config;
    return {
      ...config,
      zones: config.zones.filter((z) => z.id !== zoneId),
    };
  });
}

export function updateShippingZone(
  storefrontId: string,
  zoneId: string,
  patch: Partial<Omit<ShippingZone, "id">>
): ShippingConfig | null {
  return updateConfig(storefrontId, (config) => ({
    ...config,
    zones: config.zones.map((z) =>
      z.id === zoneId ? { ...z, ...patch } : z
    ),
  }));
}

export function resetShippingZones(storefrontId: string): ShippingConfig | null {
  return updateConfig(storefrontId, (config) => ({
    ...config,
    zones: defaultZonesForNewConfig(),
  }));
}