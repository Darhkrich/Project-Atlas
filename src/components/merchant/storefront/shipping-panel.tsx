"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { useShipping } from "@/lib/merchant/storefront/shipping/use-shipping";
import {
  addShippingZone,
  removeShippingZone,
  resetShippingZones,
  setPickupAddress,
  setPickupEnabled,
  setPickupInstructions,
  updateShippingZone,
} from "@/lib/merchant/storefront/shipping/shipping-mutations";
import { ShippingZoneRow } from "./shipping-zone-row";

interface ShippingPanelProps {
  storefrontId: string;
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

export function ShippingPanel({ storefrontId }: ShippingPanelProps) {
  const { config } = useShipping(storefrontId);

  const handleResetZones = () => {
    resetShippingZones(storefrontId);
  };

  const totalZones = config.zones.length;
  const enabledZones = config.zones.filter((z) => z.enabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Shipping
        </h2>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          Set delivery fees per region and decide whether pickup is
          available.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Delivery zones
            </p>
            <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              {enabledZones} of {totalZones} zones active. Customers pick
              their zone at checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetZones}
            className="text-[11px] font-medium text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Reset to defaults
          </button>
        </div>

        <div className="space-y-2">
          {config.zones.map((zone) => (
            <ShippingZoneRow
              key={zone.id}
              zone={zone}
              canRemove={config.zones.length > 1}
              onChange={(patch) =>
                updateShippingZone(storefrontId, zone.id, patch)
              }
              onRemove={() => removeShippingZone(storefrontId, zone.id)}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => addShippingZone(storefrontId)}
        >
          <AtlasIcon name="plus" aria-hidden="true" className="h-4 w-4" />
          Add zone
        </Button>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <label className="flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50">
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Offer pickup
            </span>
            <span className="mt-0.5 block text-[11px] text-neutral-500 dark:text-neutral-400">
              Let customers collect orders in person, at no delivery fee.
            </span>
          </span>
          <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={config.pickupEnabled}
              onChange={(e) =>
                setPickupEnabled(storefrontId, e.target.checked)
              }
              className="peer sr-only"
              aria-label="Offer pickup"
            />
            <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:bg-neutral-700" />
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>

        {config.pickupEnabled && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="pickup-address"
                className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Pickup address
              </label>
              <input
                id="pickup-address"
                type="text"
                value={config.pickupAddress}
                onChange={(e) =>
                  setPickupAddress(storefrontId, e.target.value)
                }
                placeholder="e.g., 12 Oxford Street, Osu, Accra"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="pickup-instructions"
                className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Pickup instructions
              </label>
              <textarea
                id="pickup-instructions"
                value={config.pickupInstructions}
                onChange={(e) =>
                  setPickupInstructions(storefrontId, e.target.value)
                }
                rows={2}
                placeholder="Tell customers when and how to collect."
                className={inputClass + " resize-none"}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-info-200 bg-info-50 p-3 dark:border-info-800/60 dark:bg-info-900/20">
        <AtlasIcon
          name="info"
          aria-hidden="true"
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info-600 dark:text-info-400"
        />
        <p className="text-[11px] leading-relaxed text-info-900 dark:text-info-200">
          Shipping fees are shown at checkout. Cash on delivery settings
          live in the Settings tab.
        </p>
      </div>
    </div>
  );
}