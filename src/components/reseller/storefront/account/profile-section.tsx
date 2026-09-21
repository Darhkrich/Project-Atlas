"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { useStorefrontCustomer } from "@/contexts/storefront-customer-context";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-right text-sm font-medium text-neutral-900">
        {value}
      </span>
    </div>
  );
}

export function ProfileSection() {
  const { customer, setPhone } = useStorefrontCustomer();
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  if (!customer) return null;

  const openPhoneEdit = () => {
    setPhoneDraft(customer.phone ?? "");
    setPhoneError(null);
    setEditingPhone(true);
  };

  const savePhone = () => {
    const trimmed = phoneDraft.trim();
    if (trimmed.length < 7) {
      setPhoneError("Enter a valid phone number.");
      return;
    }
    setPhone(trimmed);
    setEditingPhone(false);
  };

  return (
    <section aria-labelledby="storefront-profile-heading">
      <h2
        id="storefront-profile-heading"
        className="mb-4 text-lg font-semibold text-neutral-900"
      >
        Profile
      </h2>
      <AtlasCard>
        <Row label="Name" value={customer.name} />
        <Row label="Email" value={customer.email} />

        {!editingPhone ? (
          <div className="flex items-start justify-between gap-3 py-2">
            <span className="text-sm text-neutral-500">Phone</span>
            <div className="flex items-center gap-3">
              <span className="text-right text-sm font-medium text-neutral-900">
                {customer.phone || "Not provided"}
              </span>
              <button
                type="button"
                onClick={openPhoneEdit}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                {customer.phone ? "Edit" : "Add"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <AtlasInput
              label="Phone number"
              type="tel"
              value={phoneDraft}
              onChange={(e) => {
                setPhoneDraft(e.target.value);
                setPhoneError(null);
              }}
              error={phoneError ?? undefined}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPhone(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={savePhone}>
                Save
              </Button>
            </div>
          </div>
        )}

        <p className="mt-3 text-xs text-neutral-500">
          Contact the store directly to update your name or email.
        </p>
      </AtlasCard>
    </section>
  );
}