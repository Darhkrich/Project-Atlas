/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/resellers/reseller-onboard-modal.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { getTiers } from "@/lib/admin/mock/reseller-tier-store";

export interface OnboardResellerInput {
  businessName: string;
  storeName: string;
  contactPerson: string;
  email: string;
  phone: string;
  tierId: string;
  commissionRate: number;
}

interface OnboardModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (input: OnboardResellerInput) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const selectClass =
  "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100";

export function ResellerOnboardModal({
  open,
  onClose,
  onConfirm,
}: OnboardModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tierId, setTierId] = useState(getTiers()[0]?.id ?? "");
  const [commissionRate, setCommissionRate] = useState("4");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setBusinessName("");
    setStoreName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setTierId(getTiers()[0]?.id ?? "");
    setCommissionRate("4");
    setError(null);
  }, [open]);

  const handleSubmit = () => {
    if (!businessName.trim()) {
      setError("Enter the business name.");
      return;
    }
    if (!contactPerson.trim()) {
      setError("Enter the contact person's name.");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setError("Enter a phone number.");
      return;
    }
    const rate = Number(commissionRate);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      setError("Commission rate must be between 0 and 100.");
      return;
    }
    onConfirm({
      businessName: businessName.trim(),
      storeName: storeName.trim() || businessName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim(),
      tierId,
      commissionRate: rate,
    });
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Add reseller"
      description="Create a new reseller account. The reseller will receive an invitation to set up their storefront."
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            Create reseller
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField
            label="Business name"
            htmlFor="onboard-business"
            required
          >
            <Input
              id="onboard-business"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Kwame Store"
            />
          </SettingsField>

          <SettingsField
            label="Store name"
            htmlFor="onboard-store"
            hint="Shown on their storefront. Defaults to the business name."
          >
            <Input
              id="onboard-store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Kwame Digital"
            />
          </SettingsField>

          <SettingsField
            label="Contact person"
            htmlFor="onboard-contact"
            required
          >
            <Input
              id="onboard-contact"
              value={contactPerson}
              onChange={(e) => {
                setContactPerson(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Kwame Mensah"
            />
          </SettingsField>

          <SettingsField label="Phone" htmlFor="onboard-phone" required>
            <Input
              id="onboard-phone"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError(null);
              }}
              placeholder="+233 24 000 0000"
            />
          </SettingsField>
        </div>

        <SettingsField label="Email" htmlFor="onboard-email" required>
          <Input
            id="onboard-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="name@business.com"
          />
        </SettingsField>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField label="Tier" htmlFor="onboard-tier">
            <select
              id="onboard-tier"
              className={selectClass}
              value={tierId}
              onChange={(e) => setTierId(e.target.value)}
            >
              {getTiers().map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name}
                </option>
              ))}
            </select>
          </SettingsField>

          <SettingsField
            label="Commission rate (%)"
            htmlFor="onboard-rate"
            hint="Defaults to a typical value. The tier rate is applied if left unchanged."
          >
            <Input
              id="onboard-rate"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
            />
          </SettingsField>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {error}
          </p>
        )}
      </div>
    </ModalShell>
  );
}