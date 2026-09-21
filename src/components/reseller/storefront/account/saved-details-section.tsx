"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";

export function SavedDetailsSection() {
  const { customer, saveDetail } = useStorefrontCustomer();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    phoneNumber: customer?.savedDetails?.phoneNumber ?? "",
    meterNumber: customer?.savedDetails?.meterNumber ?? "",
    smartCardNumber: customer?.savedDetails?.smartCardNumber ?? "",
  });

  if (!customer) return null;

  const handleSave = () => {
    saveDetail("phoneNumber", draft.phoneNumber);
    saveDetail("meterNumber", draft.meterNumber);
    saveDetail("smartCardNumber", draft.smartCardNumber);
    setEditing(false);
  };

  return (
    <section aria-labelledby="storefront-saved-details-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="storefront-saved-details-heading"
          className="text-lg font-semibold text-neutral-900"
        >
          Saved details
        </h2>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Edit
          </button>
        ) : null}
      </div>

      <AtlasCard>
        {!editing ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Phone</span>
              <span className="font-medium text-neutral-900">
                {customer.savedDetails?.phoneNumber || "\u2014"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Meter number</span>
              <span className="font-medium text-neutral-900">
                {customer.savedDetails?.meterNumber || "\u2014"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Smart card number</span>
              <span className="font-medium text-neutral-900">
                {customer.savedDetails?.smartCardNumber || "\u2014"}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <AtlasInput
              label="Phone number"
              type="tel"
              value={draft.phoneNumber}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
            />
            <AtlasInput
              label="Meter number"
              type="text"
              value={draft.meterNumber}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, meterNumber: e.target.value }))
              }
            />
            <AtlasInput
              label="Smart card number"
              type="text"
              value={draft.smartCardNumber}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  smartCardNumber: e.target.value,
                }))
              }
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        )}
      </AtlasCard>
    </section>
  );
}