// components/admin/services/service-category-editors.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { useNow } from "@/lib/admin/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/admin/support/format";
import { formatCurrency } from "@/lib/admin/formatters";
import type {
  FormFieldConfig,
  Plan,
  PlanCategory,
  ServiceCategory,
} from "@/lib/services-page-data";
import type { ServiceAuditEntry } from "@/lib/admin/services/audit";
import { buildPlanId, slugify } from "@/lib/admin/services/helpers";
import { resolveServiceIcon } from "@/lib/admin/services/icon-catalog";

/* ======================================================================
   Form fields editor
   ====================================================================== */

interface ServiceFieldsEditorProps {
  category: ServiceCategory;
  onChange: (patch: Partial<ServiceCategory>) => void;
}

const FIELD_TYPE_OPTIONS: FormFieldConfig["type"][] = [
  "text",
  "tel",
  "select",
  "number",
];

export function ServiceFieldsEditor({
  category,
  onChange,
}: ServiceFieldsEditorProps) {
  const fields = category.formConfig?.fields ?? [];

  const patchFields = (next: FormFieldConfig[]) => {
    onChange({
      formConfig: {
        ...(category.formConfig ?? { fields: [] }),
        fields: next,
      },
    });
  };

  const addField = () => {
    const next: FormFieldConfig = {
      name: "",
      label: "",
      type: "text",
      placeholder: "",
    };
    patchFields([...fields, next]);
  };

  const updateField = (index: number, patch: Partial<FormFieldConfig>) => {
    const next = fields.map((f, i) => (i === index ? { ...f, ...patch } : f));
    patchFields(next);
  };

  const removeField = (index: number) => {
    patchFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const next = [...fields];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    patchFields(next);
  };

  return (
    <div className="space-y-4">
      <section>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Selection type
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Determines whether the customer picks from a plan list or enters a
          custom amount.
        </p>
        <select
          aria-label="Selection type"
          className="mt-2 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={category.formConfig?.selectionType ?? "amounts"}
          onChange={(e) =>
            onChange({
              formConfig: {
                ...(category.formConfig ?? { fields: [] }),
                selectionType: e.target.value as "plans" | "amounts",
              },
            })
          }
        >
          <option value="amounts">Amounts</option>
          <option value="plans">Plans</option>
        </select>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Form fields ({fields.length})
          </h3>
          <Button variant="outline" size="sm" onClick={addField}>
            Add field
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            No fields yet. Add at least one so the customer can submit.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {fields.map((field, index) => (
              <li
                key={index}
                className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant="neutral" size="sm">
                    Field {index + 1}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveField(index, "up")}
                      aria-label="Move field up"
                    >
                      Up
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={index === fields.length - 1}
                      onClick={() => moveField(index, "down")}
                      aria-label="Move field down"
                    >
                      Down
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Field name
                    </span>
                    <Input
                      className="mt-1"
                      value={field.name}
                      onChange={(e) =>
                        updateField(index, { name: e.target.value })
                      }
                      placeholder="e.g. phoneNumber"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Label
                    </span>
                    <Input
                      className="mt-1"
                      value={field.label}
                      onChange={(e) =>
                        updateField(index, { label: e.target.value })
                      }
                      placeholder="e.g. Phone Number"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Type
                    </span>
                    <select
                      aria-label={`Field ${index + 1} type`}
                      className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                      value={field.type}
                      onChange={(e) =>
                        updateField(index, {
                          type: e.target.value as FormFieldConfig["type"],
                        })
                      }
                    >
                      {FIELD_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Placeholder
                    </span>
                    <Input
                      className="mt-1"
                      value={field.placeholder ?? ""}
                      onChange={(e) =>
                        updateField(index, { placeholder: e.target.value })
                      }
                    />
                  </label>
                </div>

                {field.type === "select" && (
                  <label className="mt-2 block">
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Options (comma separated)
                    </span>
                    <Input
                      className="mt-1"
                      value={field.options?.join(", ") ?? ""}
                      onChange={(e) =>
                        updateField(index, {
                          options: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </label>
                )}

                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={field.required ?? false}
                    onChange={(e) =>
                      updateField(index, { required: e.target.checked })
                    }
                  />
                  Required
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Custom amount
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Optional. Lets the customer enter any amount within a range instead
          of picking a preset.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Minimum (GHS)
            </span>
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={category.formConfig?.customAmount?.min ?? ""}
              onChange={(e) =>
                onChange({
                  formConfig: {
                    ...(category.formConfig ?? { fields: [] }),
                    customAmount: {
                      label:
                        category.formConfig?.customAmount?.label ??
                        "Custom Amount",
                      min: e.target.value ? Number(e.target.value) : undefined,
                      max: category.formConfig?.customAmount?.max,
                    },
                  },
                })
              }
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Maximum (GHS)
            </span>
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={category.formConfig?.customAmount?.max ?? ""}
              onChange={(e) =>
                onChange({
                  formConfig: {
                    ...(category.formConfig ?? { fields: [] }),
                    customAmount: {
                      label:
                        category.formConfig?.customAmount?.label ??
                        "Custom Amount",
                      min: category.formConfig?.customAmount?.min,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    },
                  },
                })
              }
            />
          </label>
        </div>
      </section>
    </div>
  );
}

/* ======================================================================
   Plans editor (flat plans OR network plan categories)
   ====================================================================== */

interface ServicePlansEditorProps {
  category: ServiceCategory;
  onChange: (patch: Partial<ServiceCategory>) => void;
}

export function ServicePlansEditor({
  category,
  onChange,
}: ServicePlansEditorProps) {
  const tree = category.formConfig?.networkPlanCategories;
  const flatPlans = category.formConfig?.plans ?? [];

  const patchFlatPlans = (next: Plan[]) => {
    onChange({
      formConfig: {
        ...(category.formConfig ?? { fields: [] }),
        plans: next,
      },
    });
  };

  const patchNetworkTree = (
    next: Record<string, PlanCategory[]>
  ) => {
    onChange({
      formConfig: {
        ...(category.formConfig ?? { fields: [] }),
        networkPlanCategories: next,
      },
    });
  };

  if (tree && Object.keys(tree).length > 0) {
    return (
      <NetworkPlanTreeEditor
        tree={tree}
        networks={category.networkOptions ?? []}
        onTreeChange={patchNetworkTree}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Plans ({flatPlans.length})
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            Flat list of plans. Customers pick one.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const newPlan: Plan = {
              id: buildPlanId("New plan"),
              name: "New Plan",
              price: 0,
            };
            patchFlatPlans([...flatPlans, newPlan]);
          }}
        >
          Add plan
        </Button>
      </div>

      {flatPlans.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No plans yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {flatPlans.map((plan, index) => (
            <li
              key={index}
              className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_6rem_6rem]">
                <label className="block">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    ID
                  </span>
                  <Input
                    className="mt-1"
                    value={plan.id}
                    onChange={(e) => {
                      const next = [...flatPlans];
                      next[index] = { ...plan, id: slugify(e.target.value) };
                      patchFlatPlans(next);
                    }}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Name
                  </span>
                  <Input
                    className="mt-1"
                    value={plan.name}
                    onChange={(e) => {
                      const next = [...flatPlans];
                      next[index] = { ...plan, name: e.target.value };
                      patchFlatPlans(next);
                    }}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Price (GHS)
                  </span>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    step={0.01}
                    value={plan.price}
                    onChange={(e) => {
                      const next = [...flatPlans];
                      next[index] = { ...plan, price: Number(e.target.value) };
                      patchFlatPlans(next);
                    }}
                  />
                </label>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      patchFlatPlans(flatPlans.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <label className="mt-2 block">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Description
                </span>
                <Input
                  className="mt-1"
                  value={plan.description ?? ""}
                  onChange={(e) => {
                    const next = [...flatPlans];
                    next[index] = { ...plan, description: e.target.value };
                    patchFlatPlans(next);
                  }}
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------------- Network plan tree editor (Data service) --------------- */

interface NetworkPlanTreeEditorProps {
  tree: Record<string, PlanCategory[]>;
  networks: string[];
  onTreeChange: (next: Record<string, PlanCategory[]>) => void;
}

function NetworkPlanTreeEditor({
  tree,
  networks,
  onTreeChange,
}: NetworkPlanTreeEditorProps) {
  const treeNetworks = Object.keys(tree);
  const [activeNetwork, setActiveNetwork] = useState<string>(
    treeNetworks[0] ?? ""
  );

  const activeCategories = tree[activeNetwork] ?? [];

  const patchCategories = (next: PlanCategory[]) => {
    onTreeChange({ ...tree, [activeNetwork]: next });
  };

  const patchCategory = (index: number, patch: Partial<PlanCategory>) => {
    const next = activeCategories.map((c, i) =>
      i === index ? { ...c, ...patch } : c
    );
    patchCategories(next);
  };

  const addCategory = () => {
    const usedNetworks = new Set(treeNetworks);
    const available = networks.filter((n) => !usedNetworks.has(n));
    const newName = available[0] ?? `Category ${activeCategories.length + 1}`;
    patchCategories([...activeCategories, { name: newName, plans: [] }]);
  };

  const removeCategory = (index: number) => {
    patchCategories(activeCategories.filter((_, i) => i !== index));
  };

  const addPlan = (categoryIndex: number) => {
    const category = activeCategories[categoryIndex];
    if (!category) return;
    const planId = buildPlanId("New plan", activeNetwork);
    const newPlan: Plan = { id: planId, name: "New Plan", price: 0 };
    const next = activeCategories.map((c, i) =>
      i === categoryIndex ? { ...c, plans: [...c.plans, newPlan] } : c
    );
    patchCategories(next);
  };

  const updatePlan = (
    categoryIndex: number,
    planIndex: number,
    patch: Partial<Plan>
  ) => {
    const next = activeCategories.map((c, i) => {
      if (i !== categoryIndex) return c;
      return {
        ...c,
        plans: c.plans.map((p, j) =>
          j === planIndex ? { ...p, ...patch } : p
        ),
      };
    });
    patchCategories(next);
  };

  const removePlan = (categoryIndex: number, planIndex: number) => {
    const next = activeCategories.map((c, i) => {
      if (i !== categoryIndex) return c;
      return { ...c, plans: c.plans.filter((_, j) => j !== planIndex) };
    });
    patchCategories(next);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-info-200 bg-info-50 p-3 text-xs dark:border-info-800/60 dark:bg-info-900/20">
        <p className="font-medium text-info-900 dark:text-info-100">
          Network-scoped plan catalog
        </p>
        <p className="mt-1 text-info-800 dark:text-info-200">
          Plans are grouped by network and then by category. This structure is
          used by services where each network has its own distinct plans.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Networks"
        className="flex flex-wrap gap-1 border-b border-neutral-200 dark:border-neutral-800"
      >
        {treeNetworks.map((network) => {
          const isActive = network === activeNetwork;
          return (
            <button
              key={network}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`plans-panel-${network}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveNetwork(network)}
              className={cn(
                "whitespace-nowrap border-b-2 px-3 py-1.5 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive
                  ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              {network}
              <span className="ml-1.5 text-neutral-400">
                ({tree[network]?.reduce((s, c) => s + c.plans.length, 0) ?? 0})
              </span>
            </button>
          );
        })}
      </div>

      <div id={`plans-panel-${activeNetwork}`} role="tabpanel">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {activeNetwork} plan categories ({activeCategories.length})
          </h3>
          <Button variant="outline" size="sm" onClick={addCategory}>
            Add category
          </Button>
        </div>

        {activeCategories.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            No plan categories for this network yet.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {activeCategories.map((category, categoryIndex) => (
              <li
                key={categoryIndex}
                className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    aria-label="Category name"
                    className="max-w-xs"
                    value={category.name}
                    onChange={(e) =>
                      patchCategory(categoryIndex, { name: e.target.value })
                    }
                  />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {category.plans.length} plan
                    {category.plans.length === 1 ? "" : "s"}
                  </span>
                  <div className="ml-auto flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addPlan(categoryIndex)}
                    >
                      Add plan
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCategory(categoryIndex)}
                    >
                      Remove category
                    </Button>
                  </div>
                </div>

                {category.plans.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {category.plans.map((plan, planIndex) => (
                      <li
                        key={planIndex}
                        className="grid gap-2 rounded-md bg-neutral-50 p-2 sm:grid-cols-[1fr_1fr_6rem_auto] dark:bg-neutral-900"
                      >
                        <Input
                          aria-label="Plan ID"
                          value={plan.id}
                          onChange={(e) =>
                            updatePlan(categoryIndex, planIndex, {
                              id: slugify(e.target.value),
                            })
                          }
                        />
                        <Input
                          aria-label="Plan name"
                          value={plan.name}
                          onChange={(e) =>
                            updatePlan(categoryIndex, planIndex, {
                              name: e.target.value,
                            })
                          }
                        />
                        <Input
                          aria-label="Plan price"
                          type="number"
                          min={0}
                          step={0.01}
                          value={plan.price}
                          onChange={(e) =>
                            updatePlan(categoryIndex, planIndex, {
                              price: Number(e.target.value),
                            })
                          }
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlan(categoryIndex, planIndex)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ======================================================================
   Networks editor
   ====================================================================== */

interface ServiceNetworksEditorProps {
  category: ServiceCategory;
  onChange: (patch: Partial<ServiceCategory>) => void;
}

export function ServiceNetworksEditor({
  category,
  onChange,
}: ServiceNetworksEditorProps) {
  const [draft, setDraft] = useState("");
  const networks = category.networkOptions ?? [];

  const add = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (networks.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange({ networkOptions: [...networks, trimmed] });
    setDraft("");
  };

  const remove = (network: string) => {
    onChange({ networkOptions: networks.filter((n) => n !== network) });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Networks that this service offers. Used on the storefront to filter
        plans and on the Data Plans admin to group plans.
      </p>

      <div className="flex gap-2">
        <Input
          aria-label="Add network"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. MTN"
        />
        <Button variant="outline" size="sm" onClick={add} disabled={!draft.trim()}>
          Add
        </Button>
      </div>

      {networks.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No networks yet.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {networks.map((network) => (
            <li
              key={network}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm dark:bg-neutral-800"
            >
              <span className="text-neutral-800 dark:text-neutral-200">
                {network}
              </span>
              <button
                type="button"
                aria-label={`Remove ${network}`}
                onClick={() => remove(network)}
                className="text-neutral-500 hover:text-danger-600 dark:hover:text-danger-400"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ======================================================================
   Preview panel
   ====================================================================== */

interface ServicePreviewPanelProps {
  category: ServiceCategory;
}

export function ServicePreviewPanel({ category }: ServicePreviewPanelProps) {
  const icon = resolveServiceIcon(category.icon);
  const fields = category.formConfig?.fields ?? [];
  const previewPlans = useMemo(() => {
    const tree = category.formConfig?.networkPlanCategories;
    if (tree) {
      const firstNetwork = Object.keys(tree)[0];
      const firstCategory = firstNetwork ? tree[firstNetwork]?.[0] : undefined;
      return firstCategory?.plans ?? [];
    }
    return category.formConfig?.plans ?? [];
  }, [category.formConfig]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon name={icon} className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {category.name || "Untitled service"}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {category.description || "No description yet."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Storefront preview
        </p>

        {fields.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No form fields configured.
          </p>
        ) : (
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={`${field.name}-${idx}`}>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {field.label || field.name || `Field ${idx + 1}`}
                  {field.required && (
                    <span className="ml-1 text-danger-600 dark:text-danger-400">
                      *
                    </span>
                  )}
                </label>
                {field.type === "select" ? (
                  <select
                    disabled
                    className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-neutral-50 px-3 text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    disabled
                    className="mt-1"
                    placeholder={field.placeholder}
                    type={field.type}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {previewPlans.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {category.formConfig?.selectionType === "amounts"
                ? "Preset amounts"
                : "Plans"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {previewPlans.map((plan) => (
                <span
                  key={plan.id}
                  className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                >
                  <span className="text-neutral-900 dark:text-neutral-100">
                    {plan.name}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {formatCurrency(plan.price)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {category.formConfig?.customAmount && (
          <div className="mt-4">
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Custom amount
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Min {category.formConfig.customAmount.min ?? "-"} · Max{" "}
              {category.formConfig.customAmount.max ?? "-"} GHS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================================
   Audit panel
   ====================================================================== */

interface ServiceAuditPanelProps {
  entries: ServiceAuditEntry[];
}

export function ServiceAuditPanel({ entries }: ServiceAuditPanelProps) {
  const now = useNow();

  if (entries.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No changes recorded for this service yet.
      </p>
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="neutral" size="sm">
              {entry.action}
            </Badge>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {entry.adminName}
            </span>
            <time
              dateTime={entry.timestamp}
              title={formatAbsolute(entry.timestamp)}
              className="ml-auto text-xs text-neutral-500 dark:text-neutral-400"
            >
              {formatRelative(entry.timestamp, now)}
            </time>
          </div>
          <p className="mt-1.5 text-sm text-neutral-800 dark:text-neutral-200">
            {entry.summary}
          </p>
        </li>
      ))}
    </ol>
  );
}