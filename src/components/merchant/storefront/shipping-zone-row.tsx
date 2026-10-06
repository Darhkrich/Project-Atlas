/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { ShippingZone } from "@/lib/merchant/storefront/shipping/types";

interface ShippingZoneRowProps {
  zone: ShippingZone;
  canRemove: boolean;
  onChange: (patch: Partial<Omit<ShippingZone, "id">>) => void;
  onRemove: () => void;
}

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500";

export function ShippingZoneRow({
  zone,
  canRemove,
  onChange,
  onRemove,
}: ShippingZoneRowProps) {
  const [name, setName] = useState(zone.name);
  const [fee, setFee] = useState(String(zone.fee));
  const [freeAbove, setFreeAbove] = useState(
    zone.freeAbove === null ? "" : String(zone.freeAbove)
  );
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    setName(zone.name);
    setFee(String(zone.fee));
    setFreeAbove(zone.freeAbove === null ? "" : String(zone.freeAbove));
  }, [zone.id, zone.name, zone.fee, zone.freeAbove]);

  const commitName = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setName(zone.name);
      return;
    }
    if (trimmed !== zone.name) onChange({ name: trimmed });
  };

  const commitFee = () => {
    const parsed = Number(fee);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setFee(String(zone.fee));
      return;
    }
    if (parsed !== zone.fee) onChange({ fee: parsed });
  };

  const commitFreeAbove = () => {
    const trimmed = freeAbove.trim();
    if (!trimmed) {
      if (zone.freeAbove !== null) onChange({ freeAbove: null });
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFreeAbove(zone.freeAbove === null ? "" : String(zone.freeAbove));
      return;
    }
    if (parsed !== zone.freeAbove) onChange({ freeAbove: parsed });
  };

  return (
    <div
      className={cn(
        "grid gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800 sm:grid-cols-[1fr_130px_130px_auto] sm:items-end",
        !zone.enabled && "opacity-60"
      )}
    >
      <div>
        <label
          htmlFor={"zone-name-" + zone.id}
          className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
        >
          Region
        </label>
        <input
          id={"zone-name-" + zone.id}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          placeholder="e.g., Greater Accra"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor={"zone-fee-" + zone.id}
          className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
        >
          Fee (GH{"\u20B5"})
        </label>
        <input
          id={"zone-fee-" + zone.id}
          type="number"
          min={0}
          step={1}
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          onBlur={commitFee}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor={"zone-free-" + zone.id}
          className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400"
        >
          Free above
        </label>
        <input
          id={"zone-free-" + zone.id}
          type="number"
          min={0}
          step={1}
          value={freeAbove}
          onChange={(e) => setFreeAbove(e.target.value)}
          onBlur={commitFreeAbove}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              e.currentTarget.blur();
            }
          }}
          placeholder="None"
          className={inputClass}
        />
      </div>

      <div className="flex items-center gap-1">
        <label className="relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            checked={zone.enabled}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="peer sr-only"
            aria-label={"Enable " + zone.name}
          />
          <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:bg-neutral-700" />
          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
        </label>

        {canRemove && !confirmRemove && (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            aria-label={"Remove " + zone.name}
            className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-900/20 dark:hover:text-danger-400"
          >
            <AtlasIcon name="trash" className="h-4 w-4" />
          </button>
        )}

        {canRemove && confirmRemove && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setConfirmRemove(false);
                onRemove();
              }}
              className="rounded-md px-2 py-1 text-xs font-semibold text-danger-600 hover:underline dark:text-danger-400"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setConfirmRemove(false)}
              className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}