/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
// components/admin/services/service-category-drawer.tsx
"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import type {
  ServiceCategory,
  ServiceSection,
} from "@/lib/services-page-data";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { StatusDot } from "@/components/admin/ui/status-dot";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import {
  ALL_FILTER_GROUPS,
  ALL_SECTIONS,
  FILTER_GROUP_LABEL,
  SECTION_LABEL,
  STATUS_LABEL,
  STATUS_VARIANT,
  type FilterGroup,
} from "@/lib/admin/services/constants";
import {
  isUniqueId,
  networkCount,
  planCountFor,
  sectionsFor,
  serviceStatus,
  slugify,
} from "@/lib/admin/services/helpers";
import { ServiceIconPicker } from "./service-icon-picker";
import {
  ServiceAuditPanel,
  ServiceFieldsEditor,
  ServiceNetworksEditor,
  ServicePlansEditor,
  ServicePreviewPanel,
} from "./service-category-editors";
import {
  ServiceDeleteModal,
  ServiceDuplicateModal,
  type DuplicateResult,
} from "./service-action-modals";
import type { ServiceAuditEntry } from "@/lib/admin/services/audit";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";

type Tab =
  | "general"
  | "fields"
  | "plans"
  | "networks"
  | "preview"
  | "audit";

const BASE_TABS: { key: Tab; label: string }[] = [
  { key: "general", label: "General" },
  { key: "fields", label: "Form" },
  { key: "plans", label: "Plans" },
  { key: "preview", label: "Preview" },
  { key: "audit", label: "Audit" },
];

interface ServiceCategoryDrawerProps {
  category: ServiceCategory | null;
  isNew: boolean;
  existingIds: string[];
  allCategories: ServiceCategory[];
  auditEntries: ServiceAuditEntry[];
  onClose: () => void;
  onSave: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
  onDuplicate: (source: ServiceCategory, result: DuplicateResult) => void;
  onToggleAvailable: (id: string) => void;
}

export function ServiceCategoryDrawer({
  category,
  isNew,
  existingIds,
  allCategories,
  auditEntries,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  onToggleAvailable,
}: ServiceCategoryDrawerProps) {
  const isOpen = category !== null;
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen, onClose);
  const titleId = useId();

  if (!category) return null;

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      <DrawerBody
        key={category.id}
        category={category}
        isNew={isNew}
        existingIds={existingIds}
        allCategories={allCategories}
        auditEntries={auditEntries}
        titleId={titleId}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onToggleAvailable={onToggleAvailable}
      />
    </div>
  );
}

interface DrawerBodyProps {
  category: ServiceCategory;
  isNew: boolean;
  existingIds: string[];
  allCategories: ServiceCategory[];
  auditEntries: ServiceAuditEntry[];
  titleId: string;
  onClose: () => void;
  onSave: (category: ServiceCategory) => void;
  onDelete: (id: string) => void;
  onDuplicate: (source: ServiceCategory, result: DuplicateResult) => void;
  onToggleAvailable: (id: string) => void;
}

function DrawerBody({
  category,
  isNew,
  existingIds,
  allCategories,
  auditEntries,
  titleId,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  onToggleAvailable,
}: DrawerBodyProps) {
  const [edited, setEdited] = useState<ServiceCategory>(category);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEdited(category);
    setActiveTab("general");
    setError(null);
  }, [category]);

  const status = serviceStatus(edited);
  const sections = sectionsFor(edited);
  const plans = planCountFor(edited);
  const networks = networkCount(edited);

  const showNetworksTab =
    edited.filterGroup === "airtime" || edited.filterGroup === "data";

  const tabs = useMemo(() => {
    const tabs: { key: Tab; label: string }[] = [];
    for (const tab of BASE_TABS) {
      if (tab.key === "plans" && plans === 0 && edited.formConfig?.selectionType === "amounts") {
        tabs.push({ key: tab.key, label: "Amounts" });
        continue;
      }
      tabs.push(tab);
      if (tab.key === "fields" && showNetworksTab) {
        tabs.push({ key: "networks", label: "Networks" });
      }
    }
    return tabs;
  }, [edited.formConfig?.selectionType, plans, showNetworksTab]);

  const patch = (p: Partial<ServiceCategory>) => {
    setEdited((prev) => ({ ...prev, ...p }));
    setError(null);
  };

  const toggleSection = (section: ServiceSection) => {
    const current = sectionsFor(edited);
    const next = current.includes(section)
      ? current.filter((s) => s !== section)
      : [...current, section];
    patch({ sections: next });
  };

  const handleSave = () => {
    const trimmedName = edited.name.trim();
    const trimmedId = slugify(edited.id);

    if (!trimmedName) {
      setError("Enter a service name.");
      return;
    }
    if (!trimmedId) {
      setError("Enter a service ID.");
      return;
    }
    if (
      isNew &&
      !isUniqueId(allCategories, trimmedId)
    ) {
      setError("That ID is already in use.");
      return;
    }

    const next: ServiceCategory = {
      ...edited,
      id: trimmedId,
      name: trimmedName,
      comingSoon: edited.available ? false : Boolean(edited.comingSoon),
      comingSoonReason: edited.available
        ? undefined
        : edited.comingSoon
        ? edited.comingSoonReason
        : undefined,
      disabledReason: edited.available ? undefined : edited.disabledReason,
      availableToResellers: sections.includes("resellers")
        ? edited.availableToResellers ?? true
        : false,
    };

    onSave(next);
    onClose();
  };

  const handleDeleteConfirm = () => {
    onDelete(edited.id);
    onClose();
  };

  const handleDuplicateConfirm = (result: DuplicateResult) => {
    onDuplicate(edited, result);
    onClose();
  };

  return (
    <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-white shadow-xl dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <span className="text-xs font-bold uppercase">
              {edited.name.slice(0, 2)}
            </span>
          </span>
          <div className="min-w-0">
            <p id={titleId} className="truncate text-sm font-semibold">
              {isNew ? "New service" : edited.name}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {FILTER_GROUP_LABEL[edited.filterGroup]} · {plans} plan
              {plans === 1 ? "" : "s"}
              {networks > 0 ? ` · ${networks} network${networks === 1 ? "" : "s"}` : ""}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-center gap-1.5">
          <StatusDot
            tone={
              status === "available"
                ? "success"
                : status === "coming_soon"
                ? "warning"
                : "neutral"
            }
            size="sm"
          />
          <Badge variant={STATUS_VARIANT[status]}>
            {STATUS_LABEL[status]}
          </Badge>
        </div>
        {sections.map((section) => (
          <Badge key={section} variant="brand" size="sm">
            {SECTION_LABEL[section]}
          </Badge>
        ))}
      </div>

      {/* Cross-links */}
      {!isNew && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-neutral-200 px-4 py-2 text-xs dark:border-neutral-800">
          <Link
            href={`/admin/analytics?serviceId=${edited.id}`}
            className="text-brand-700 hover:underline dark:text-brand-300"
          >
            Analytics
          </Link>
          <Link
            href={`/admin/support?q=${encodeURIComponent(edited.name)}`}
            className="text-brand-700 hover:underline dark:text-brand-300"
          >
            Support tickets
          </Link>
          {sections.includes("resellers") && (
            <Link
              href={`/admin/settings?tab=general&focus=commission`}
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Commission rate
            </Link>
          )}
          {plans > 0 && (
            <Link
              href={`/admin/data-plans?serviceId=${edited.id}`}
              className="text-brand-700 hover:underline dark:text-brand-300"
            >
              Data plans
            </Link>
          )}
        </div>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Service sections"
        className="flex overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`service-panel-${tab.key}`}
              id={`service-tab-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-2 text-xs font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive
                  ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                  : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        role="tabpanel"
        id={`service-panel-${activeTab}`}
        aria-labelledby={`service-tab-${activeTab}`}
        className="flex-1 overflow-y-auto p-4"
      >
        {activeTab === "general" && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Name
                </span>
                <Input
                  className="mt-1"
                  value={edited.name}
                  onChange={(e) => patch({ name: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  ID
                </span>
                <Input
                  className="mt-1"
                  value={edited.id}
                  onChange={(e) => patch({ id: slugify(e.target.value) })}
                  disabled={!isNew}
                />
                <span className="mt-1 block text-xs text-neutral-500 dark:text-neutral-400">
                  {isNew
                    ? "Used by the storefront to reference this service. Lowercase, numbers, hyphens."
                    : "ID cannot be changed after creation."}
                </span>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Description
              </span>
              <Input
                className="mt-1"
                value={edited.description}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Icon
                </span>
                <div className="mt-1">
                  <ServiceIconPicker
                    value={edited.icon}
                    onChange={(iconName) => patch({ icon: iconName })}
                  />
                </div>
              </div>
              <label className="block">
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Filter group
                </span>
                <select
                  aria-label="Filter group"
                  className="mt-1 h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  value={edited.filterGroup}
                  onChange={(e) =>
                    patch({ filterGroup: e.target.value as FilterGroup })
                  }
                >
                  {ALL_FILTER_GROUPS.map((group) => (
                    <option key={group} value={group}>
                      {FILTER_GROUP_LABEL[group]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div>
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Sections
              </p>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Which Atlas surfaces consume this service.
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {ALL_SECTIONS.map((section) => {
                  const isOn = sections.includes(section);
                  return (
                    <label
                      key={section}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={isOn}
                        onChange={() => toggleSection(section)}
                      />
                      {SECTION_LABEL[section]}
                    </label>
                  );
                })}
              </div>
            </div>

            {sections.includes("resellers") && (
              <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4"
                  checked={edited.availableToResellers ?? true}
                  onChange={(e) =>
                    patch({ availableToResellers: e.target.checked })
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Available to resellers
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    When off, the service is available on Atlas direct but
                    hidden from reseller storefronts.
                  </span>
                </span>
              </label>
            )}

            <div className="space-y-3 rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4"
                  checked={edited.available}
                  onChange={(e) => {
                    const available = e.target.checked;
                    patch({
                      available,
                      comingSoon: available ? false : edited.comingSoon,
                      comingSoonReason: available
                        ? undefined
                        : edited.comingSoonReason,
                      disabledReason: available ? undefined : edited.disabledReason,
                    });
                  }}
                />
                <span>
                  <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Available
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    Shows on the customer-facing storefront after the catalog
                    is republished.
                  </span>
                </span>
              </label>

              {!edited.available && (
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4"
                    checked={edited.comingSoon ?? false}
                    onChange={(e) => {
                      const comingSoon = e.target.checked;
                      patch({
                        comingSoon,
                        comingSoonReason: comingSoon
                          ? edited.comingSoonReason
                          : undefined,
                        disabledReason: comingSoon
                          ? undefined
                          : edited.disabledReason,
                      });
                    }}
                  />
                  <span>
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Coming soon
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      Announce the service before it opens. It appears in a
                      preview state but cannot be ordered.
                    </span>
                  </span>
                </label>
              )}

              {!edited.available && edited.comingSoon && (
                <label className="block">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Coming soon reason
                  </span>
                  <Input
                    className="mt-1"
                    value={edited.comingSoonReason ?? ""}
                    onChange={(e) =>
                      patch({ comingSoonReason: e.target.value })
                    }
                    placeholder="e.g. Awaiting provider contract"
                  />
                </label>
              )}

              {!edited.available && !edited.comingSoon && (
                <label className="block">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    Disabled reason
                  </span>
                  <Input
                    className="mt-1"
                    value={edited.disabledReason ?? ""}
                    onChange={(e) =>
                      patch({ disabledReason: e.target.value })
                    }
                    placeholder="e.g. Provider outage"
                  />
                </label>
              )}
            </div>

            {edited.providerIds && edited.providerIds.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  Providers
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {edited.providerIds.map((id) => (
                    <li
                      key={id}
                      className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                    >
                      {id}
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Provider assignment is managed from the Providers page.
                </p>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
              >
                {error}
              </p>
            )}
          </div>
        )}

        {activeTab === "fields" && (
          <ServiceFieldsEditor category={edited} onChange={patch} />
        )}

        {activeTab === "networks" && (
          <ServiceNetworksEditor category={edited} onChange={patch} />
        )}

        {activeTab === "plans" && (
          <ServicePlansEditor category={edited} onChange={patch} />
        )}

        {activeTab === "preview" && <ServicePreviewPanel category={edited} />}

        {activeTab === "audit" && (
          <ServiceAuditPanel
            entries={auditEntries.filter((e) => e.serviceId === edited.id)}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
        {!isNew && (
          <Can permission={PERMISSIONS.SERVICES_MANAGE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDuplicateOpen(true)}
            >
              Duplicate
            </Button>
          </Can>
        )}

        {!isNew && (
          <Can permission={PERMISSIONS.SERVICES_MANAGE}>
            <Button
              variant="ghost"
              size="sm"
              className="text-danger-700 hover:bg-danger-50 dark:text-danger-300 dark:hover:bg-danger-900/20"
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </Can>
        )}

        {!isNew && (
          <Can permission={PERMISSIONS.SERVICES_MANAGE}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleAvailable(edited.id)}
            >
              {edited.available ? "Disable" : "Enable"}
            </Button>
          </Can>
        )}

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Can permission={PERMISSIONS.SERVICES_MANAGE}>
            <Button size="sm" onClick={handleSave}>
              {isNew ? "Create service" : "Save changes"}
            </Button>
          </Can>
        </div>
      </div>

      <ServiceDeleteModal
        open={deleteOpen}
        service={edited}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <ServiceDuplicateModal
        open={duplicateOpen}
        service={edited}
        existingIds={existingIds}
        onClose={() => setDuplicateOpen(false)}
        onConfirm={handleDuplicateConfirm}
      />

    </div> 
  );
}