import type {
  StorefrontCustomerRecord,
  StorefrontCustomerSavedDetails,
} from "../../storefront/types";
import {
  getStorefrontCustomerState,
  internalPatchStorefrontCustomer,
  internalUpsertStorefrontCustomer,
} from "./customer-store";

export interface CreateStorefrontCustomerInput {
  id: string;
  resellerSlug: string;
  storefrontId?: string;
  name: string;
  email: string;
  phone: string;
}

export function createStorefrontCustomer(
  input: CreateStorefrontCustomerInput
): StorefrontCustomerRecord {
  const nowIso = new Date().toISOString();
  return internalUpsertStorefrontCustomer({
    id: input.id,
    resellerSlug: input.resellerSlug,
    storefrontId: input.storefrontId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    twoFactorEnabled: false,
    preferredPaymentMethod: undefined,
    savedDetails: {},
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

export function saveCustomerDetail(
  customerId: string,
  key: keyof StorefrontCustomerSavedDetails,
  value: string
): StorefrontCustomerRecord | null {
  return internalPatchStorefrontCustomer(customerId, (c) => ({
    ...c,
    savedDetails: { ...c.savedDetails, [key]: value },
    updatedAt: new Date().toISOString(),
  }));
}

export function setCustomerPhone(
  customerId: string,
  phone: string
): StorefrontCustomerRecord | null {
  return internalPatchStorefrontCustomer(customerId, (c) => ({
    ...c,
    phone: phone.trim(),
    updatedAt: new Date().toISOString(),
  }));
}

export function setCustomerPreferredPaymentMethod(
  customerId: string,
  methodId: string
): StorefrontCustomerRecord | null {
  return internalPatchStorefrontCustomer(customerId, (c) => ({
    ...c,
    preferredPaymentMethod: methodId,
    updatedAt: new Date().toISOString(),
  }));
}

export function setCustomerTwoFactor(
  customerId: string,
  enabled: boolean
): StorefrontCustomerRecord | null {
  return internalPatchStorefrontCustomer(customerId, (c) => ({
    ...c,
    twoFactorEnabled: enabled,
    updatedAt: new Date().toISOString(),
  }));
}

export function findCustomerById(
  customerId: string
): StorefrontCustomerRecord | null {
  return getStorefrontCustomerState().customers[customerId] ?? null;
}