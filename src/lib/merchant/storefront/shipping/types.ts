export interface ShippingZone {
  id: string;
  name: string;
  fee: number;
  freeAbove: number | null;
  enabled: boolean;
}

export interface ShippingConfig {
  storefrontId: string;
  zones: ShippingZone[];
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupInstructions: string;
}

export const DEFAULT_PICKUP_INSTRUCTIONS =
  "Collect in person. Bring your order number.";