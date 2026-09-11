/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import {
  ServiceCategory,
  FormFieldConfig,
  Plan,
} from "@/lib/services-page-data";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface ServiceCategoryDrawerProps {
  category: ServiceCategory | null;
  onClose: () => void;
  onSave: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
  onDuplicate: (category: ServiceCategory) => void;
  auditLog: { id: string; timestamp: string; admin: string; action: string }[];
}

type Tab = "general" | "form" | "plans" | "amounts" | "networks" | "preview" | "audit";

export function ServiceCategoryDrawer({
  category,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  auditLog,
}: ServiceCategoryDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [edited, setEdited] = useState<ServiceCategory | null>(category);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setEdited(category);
    setActiveTab("general");
  }, [category]);

  if (!edited) return null;

  const updateField = (field: keyof ServiceCategory, value: any) => {
    setEdited((prev) => ({ ...prev!, [field]: value }));
  };

  const updateFormConfig = (formConfig: ServiceCategory["formConfig"]) => {
    setEdited((prev) => ({ ...prev!, formConfig }));
  };

  const addField = () => {
    const newField: FormFieldConfig = {
      name: "",
      label: "",
      type: "text",
      placeholder: "",
    };
    const fields = edited.formConfig?.fields
      ? [...edited.formConfig.fields, newField]
      : [newField];
    updateFormConfig({ ...edited.formConfig!, fields });
  };

  const updateFieldConfig = (index: number, field: Partial<FormFieldConfig>) => {
    const fields = [...(edited.formConfig?.fields || [])];
    fields[index] = { ...fields[index], ...field };
    updateFormConfig({ ...edited.formConfig!, fields });
  };

  const removeField = (index: number) => {
    const fields = edited.formConfig?.fields?.filter((_, i) => i !== index) || [];
    updateFormConfig({ ...edited.formConfig!, fields });
  };

  const addItem = () => {
    const newItem: Plan = {
      id: `item-${Date.now()}`,
      name: "New Item",
      price: 0,
    };
    const items = edited.formConfig?.plans
      ? [...edited.formConfig.plans, newItem]
      : [newItem];
    updateFormConfig({ ...edited.formConfig!, plans: items });
  };

  const updateItem = (index: number, item: Partial<Plan>) => {
    const items = [...(edited.formConfig?.plans || [])];
    items[index] = { ...items[index], ...item };
    updateFormConfig({ ...edited.formConfig!, plans: items });
  };

  const removeItem = (index: number) => {
    const items = edited.formConfig?.plans?.filter((_, i) => i !== index) || [];
    updateFormConfig({ ...edited.formConfig!, plans: items });
  };

  const handleSave = () => {
    onSave(edited);
    setShowConfirmSave(false);
    onClose();
  };

  const availableTabs: { key: Tab; label: string; icon: AtlasIconName }[] = [
    { key: "general", label: "General", icon: "settings" },
    { key: "form", label: "Form Config", icon: "list" },
    {
      key: edited.formConfig?.selectionType === "plans" && edited.id !== "data"
        ? "plans"
        : "amounts",
      label:
        edited.formConfig?.selectionType === "plans" && edited.id !== "data"
          ? "Plans"
          : "Amounts",
      icon: "tag",
    },
    ...(edited.filterGroup === "airtime" || edited.filterGroup === "data"
      ? [{ key: "networks" as Tab, label: "Networks", icon: "globe" as AtlasIconName }]
      : []),
    { key: "preview", label: "Preview", icon: "eye" },
    { key: "audit", label: "Audit", icon: "list" },
  ];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name={edited.icon as AtlasIconName} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{edited.name}</p>
              <p className="text-xs text-neutral-500">
                {edited.filterGroup} · {edited.available ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-xs font-medium",
                activeTab === tab.key
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              )}
            >
              <AtlasIcon name={tab.icon} className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* General Tab */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-500">Name</label>
                <Input
                  value={edited.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-500">
                  Description
                </label>
                <Input
                  value={edited.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-500">Icon</label>
                  <Input
                    value={edited.icon}
                    onChange={(e) => updateField("icon", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-500">
                    Filter Group
                  </label>
                  <select
                    className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    value={edited.filterGroup}
                    onChange={(e) => updateField("filterGroup", e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="airtime">Airtime</option>
                    <option value="data">Data</option>
                    <option value="tv">TV</option>
                    <option value="bills">Bills</option>
                    <option value="more">More</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={edited.available}
                    onChange={(e) => updateField("available", e.target.checked)}
                    className="h-4 w-4"
                  />
                  Available
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={edited.comingSoon || false}
                    onChange={(e) => updateField("comingSoon", e.target.checked)}
                    className="h-4 w-4"
                  />
                  Coming Soon
                </label>
              </div>
            </div>
          )}

          {/* Form Config Tab */}
          {activeTab === "form" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-500">
                  Selection Type
                </label>
                <select
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={edited.formConfig?.selectionType || "amounts"}
                  onChange={(e) =>
                    updateFormConfig({
                      ...edited.formConfig!,
                      selectionType: e.target.value as "plans" | "amounts",
                    })
                  }
                >
                  <option value="amounts">Amounts</option>
                  <option value="plans">Plans</option>
                </select>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Fields</h3>
                {edited.formConfig?.fields?.map((field, index) => (
                  <div
                    key={index}
                    className="mb-2 space-y-2 rounded-md border p-3 dark:border-neutral-700"
                  >
                    <div className="flex gap-2">
                      <Input
                        placeholder="Name"
                        value={field.name}
                        onChange={(e) =>
                          updateFieldConfig(index, { name: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Label"
                        value={field.label}
                        onChange={(e) =>
                          updateFieldConfig(index, { label: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        value={field.type}
                        onChange={(e) =>
                          updateFieldConfig(index, {
                            type: e.target.value as FormFieldConfig["type"],
                          })
                        }
                      >
                        <option value="text">Text</option>
                        <option value="tel">Tel</option>
                        <option value="select">Select</option>
                        <option value="number">Number</option>
                      </select>
                      <Input
                        placeholder="Placeholder"
                        value={field.placeholder || ""}
                        onChange={(e) =>
                          updateFieldConfig(index, {
                            placeholder: e.target.value,
                          })
                        }
                      />
                    </div>
                    {field.type === "select" && (
                      <Input
                        placeholder="Options (comma separated)"
                        value={field.options?.join(", ") || ""}
                        onChange={(e) =>
                          updateFieldConfig(index, {
                            options: e.target.value.split(",").map((s) => s.trim()),
                          })
                        }
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) =>
                            updateFieldConfig(index, {
                              required: e.target.checked,
                            })
                          }
                        />
                        Required
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addField}>
                  Add Field
                </Button>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Custom Amount</h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={edited.formConfig?.customAmount?.min || ""}
                    onChange={(e) =>
                      updateFormConfig({
                        ...edited.formConfig!,
                        customAmount: {
                          ...edited.formConfig!.customAmount!,
                          label:
                            edited.formConfig?.customAmount?.label ||
                            "Custom Amount",
                          min: Number(e.target.value),
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={edited.formConfig?.customAmount?.max || ""}
                    onChange={(e) =>
                      updateFormConfig({
                        ...edited.formConfig!,
                        customAmount: {
                          ...edited.formConfig!.customAmount!,
                          label:
                            edited.formConfig?.customAmount?.label ||
                            "Custom Amount",
                          max: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Plans/Amounts Tab */}
          {(activeTab === "plans" || activeTab === "amounts") && edited.id !== "data" && (
            <div className="space-y-3">
              {edited.formConfig?.plans?.map((item, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-md border p-3 dark:border-neutral-700"
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="ID"
                      value={item.id}
                      onChange={(e) => updateItem(index, { id: e.target.value })}
                    />
                    <Input
                      placeholder="Name"
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Description"
                      value={item.description || ""}
                      onChange={(e) =>
                        updateItem(index, { description: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(index, { price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem}>
                Add {activeTab === "plans" ? "Plan" : "Amount"}
              </Button>
            </div>
          )}

          {/* Networks Tab */}
          {activeTab === "networks" && (
            <div>
              <label className="text-xs font-medium text-neutral-500">
                Network Options (comma separated)
              </label>
              <Input
                value={edited.networkOptions?.join(", ") || ""}
                onChange={(e) =>
                  updateField(
                    "networkOptions",
                    e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                  )
                }
              />
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
              <h3 className="text-base font-semibold">{edited.name}</h3>
              <p className="text-sm text-neutral-500">{edited.description}</p>
              <div className="mt-4 space-y-3">
                {edited.formConfig?.fields?.map((field, idx) => (
                  <div key={idx}>
                    <label className="text-sm font-medium">{field.label}</label>
                    {field.type === "select" ? (
                      <select className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800">
                        {field.options?.map((opt) => (
                          <option key={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <Input placeholder={field.placeholder} type={field.type} />
                    )}
                  </div>
                ))}
                {edited.formConfig?.selectionType === "amounts" &&
                  edited.formConfig?.plans && (
                    <div className="flex flex-wrap gap-2">
                      {edited.formConfig.plans.map((item) => (
                        <button
                          key={item.id}
                          className="rounded-md border px-3 py-1 text-sm"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
                {edited.formConfig?.selectionType === "plans" &&
                  edited.formConfig?.plans &&
                  edited.id !== "data" && (
                    <div className="flex flex-wrap gap-2">
                      {edited.formConfig.plans.map((item) => (
                        <button
                          key={item.id}
                          className="rounded-md border px-3 py-1 text-sm"
                        >
                          {item.name}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Audit Tab */}
          {activeTab === "audit" && (
            <div>
              <p className="text-sm font-medium">Audit Trail</p>
              {auditLog.length === 0 ? (
                <p className="mt-2 text-sm text-neutral-400">
                  No changes recorded.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {auditLog.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                    >
                      <p className="font-medium">{entry.admin}</p>
                      <p>{entry.action}</p>
                      <p className="text-neutral-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-2 border-t border-neutral-200 p-4 dark:border-neutral-800">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicate(edited)}
          >
            Duplicate
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowConfirmDelete(true)}
          >
            Delete
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setShowConfirmSave(true)}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirmSave}
        title="Confirm Save Changes"
        description="Are you sure you want to save these changes?"
        confirmLabel="Save"
        onConfirm={handleSave}
        onCancel={() => setShowConfirmSave(false)}
      />
      <ConfirmDialog
        open={showConfirmDelete}
        title="Confirm Delete"
        description="Are you sure you want to delete this service? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          onDelete(edited.id);
          onClose();
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
}