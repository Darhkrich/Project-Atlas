import { DEFAULT_PICKUP_INSTRUCTIONS } from "./types";
import type { ShippingConfig, ShippingZone } from "./types";

function defaultZones(): ShippingZone[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Greater Accra",
      fee: 20,
      freeAbove: 300,
      enabled: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Ashanti",
      fee: 30,
      freeAbove: 400,
      enabled: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Western",
      fee: 35,
      freeAbove: 500,
      enabled: true,
    },
    {
      id: crypto.randomUUID(),
      name: "Other regions",
      fee: 45,
      freeAbove: 600,
      enabled: true,
    },
  ];
}

export function seedShippingConfig(storefrontId: string): ShippingConfig {
  return {
    storefrontId,
    zones: defaultZones(),
    pickupEnabled: false,
    pickupAddress: "",
    pickupInstructions: DEFAULT_PICKUP_INSTRUCTIONS,
  };
}

export function defaultZonesForNewConfig(): ShippingZone[] {
  return defaultZones();
}