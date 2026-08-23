/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import {
  useSavedDetails,
  type SavedDetailType,
} from "@/contexts/SavedDetailsContext";

const typeLabels: Record<SavedDetailType, string> = {
  phone: "Phone Number",
  meter: "Meter Number",
  smartcard: "Smartcard Number",
  bank: "Bank Account",
};

const typeIcons: Record<SavedDetailType, AtlasIconName> = {
  phone: "phone",
  meter: "zap",
  smartcard: "tv",
  bank: "bank",
};

const typeIconBg: Record<SavedDetailType, string> = {
  phone: "bg-blue-100 dark:bg-blue-900/30",
  meter: "bg-yellow-100 dark:bg-yellow-900/30",
  smartcard: "bg-purple-100 dark:bg-purple-900/30",
  bank: "bg-green-100 dark:bg-green-900/30",
};

export function BeneficiariesList() {
  const {
    savedDetails,
    addSavedDetail,
    deleteSavedDetail,
  } = useSavedDetails();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "phone" as SavedDetailType,
    value: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.value.trim()) newErrors.value = "Value is required.";
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    addSavedDetail({
      name: formData.name,
      type: formData.type,
      value: formData.value,
      service: getServiceByType(formData.type),
    });
    setShowAddModal(false);
    setFormData({ name: "", type: "phone", value: "" });
  };

  const getServiceByType = (type: SavedDetailType): string => {
    switch (type) {
      case "phone":
        return "Airtime / Data";
      case "meter":
        return "Electricity";
      case "smartcard":
        return "Cable TV";
      case "bank":
        return "Wallet Withdrawal";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {savedDetails.length} saved beneficiaries
        </p>
        <Button onClick={() => setShowAddModal(true)}>
          <AtlasIcon name="plus" className="mr-2 h-4 w-4" />
          Add Beneficiary
        </Button>
      </div>

      {savedDetails.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedDetails.map((detail) => (
            <AtlasCard key={detail.id} className="relative">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${typeIconBg[detail.type]}`}
                >
                  <AtlasIcon
                    name={typeIcons[detail.type]}
                    className="h-6 w-6 text-neutral-700 dark:text-neutral-200"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {detail.name}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {detail.value}
                  </p>
                  <div className="mt-2">
                    <AtlasBadge variant="neutral">{detail.service}</AtlasBadge>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteId(detail.id)}
                  className="rounded-md p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-danger-600 dark:hover:bg-neutral-800 dark:hover:text-danger-400"
                  aria-label="Delete beneficiary"
                >
                  <AtlasIcon name="x-circle" className="h-5 w-5" />
                </button>
              </div>
            </AtlasCard>
          ))}
        </div>
      ) : (
        <AtlasEmptyState
          title="No beneficiaries saved"
          description="Save your frequently used recipients to make transactions faster."
          action={
            <Button onClick={() => setShowAddModal(true)}>
              <AtlasIcon name="plus" className="mr-2 h-4 w-4" />
              Add Beneficiary
            </Button>
          }
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setShowAddModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-t-xl bg-white shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Add Beneficiary
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                aria-label="Close"
              >
                <AtlasIcon name="x-circle" className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <AtlasInput
                  label="Name"
                  type="text"
                  placeholder="e.g. Emmanuel Phone"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  error={formErrors.name}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      handleInputChange("type", e.target.value)
                    }
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  >
                    {(Object.keys(typeLabels) as SavedDetailType[]).map((type) => (
                      <option key={type} value={type}>
                        {typeLabels[type]}
                      </option>
                    ))}
                  </select>
                </div>
                <AtlasInput
                  label={typeLabels[formData.type]}
                  type="text"
                  placeholder={
                    formData.type === "phone"
                      ? "024 XXX XXXX"
                      : formData.type === "meter"
                        ? "1234567890"
                        : formData.type === "smartcard"
                          ? "1234567890"
                          : "Account number"
                  }
                  value={formData.value}
                  onChange={(e) => handleInputChange("value", e.target.value)}
                  error={formErrors.value}
                />
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAdd}>
                  Add Beneficiary
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-neutral-950/50 dark:bg-black/60"
            onClick={() => setShowDeleteId(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-t-xl bg-white shadow-xl dark:bg-neutral-900 sm:rounded-xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-100 text-danger-700 dark:bg-danger-900 dark:text-danger-300">
                <AtlasIcon name="x-circle" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Delete Beneficiary?
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    deleteSavedDetail(showDeleteId);
                    setShowDeleteId(null);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}