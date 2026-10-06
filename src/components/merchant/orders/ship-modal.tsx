/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import {
  ORDER_CARRIER_MAX_LENGTH,
  ORDER_TRACKING_NUMBER_MAX_LENGTH,
} from "@/lib/merchant/orders/constants";

interface ShipModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    carrier: string;
    trackingNumber: string;
  }) => { ok: boolean; error?: string };
}

export function ShipModal({ open, onClose, onSubmit }: ShipModalProps) {
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCarrier("");
      setTrackingNumber("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    const result = onSubmit({ carrier, trackingNumber });
    if (!result.ok) {
      setError(result.error ?? "Could not mark the order as shipped.");
      return;
    }
    setError(null);
  };

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Mark as shipped"
      description="Add the carrier and tracking number for this shipment."
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="ship-carrier"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Carrier <span className="text-danger-500">*</span>
          </label>
          <input
            id="ship-carrier"
            value={carrier}
            maxLength={ORDER_CARRIER_MAX_LENGTH}
            onChange={(e) => {
              setCarrier(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g., GIG Logistics"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        <div>
          <label
            htmlFor="ship-tracking"
            className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Tracking number <span className="text-danger-500">*</span>
          </label>
          <input
            id="ship-tracking"
            value={trackingNumber}
            maxLength={ORDER_TRACKING_NUMBER_MAX_LENGTH}
            onChange={(e) => {
              setTrackingNumber(e.target.value);
              if (error) setError(null);
            }}
            placeholder="e.g., GIG-7741220"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Mark as shipped
          </button>
        </div>
      </div>
    </AtlasModalShell>
  );
}