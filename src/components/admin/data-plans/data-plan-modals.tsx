/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { SettingsField } from "@/components/admin/ui/settings-field";
import { formatCurrency } from "@/lib/admin/formatters";
import type { Plan } from "@/lib/services-page-data";
import { IMPORT_MAX_ROWS } from "@/lib/admin/data-plans/constants";
import {
  validateImportCsv,
  dataPlanIdFor,
  type ImportRow,
} from "@/lib/admin/data-plans/helpers";

type PlanDraft = {
  name: string;
  description: string;
  price: string;
  validity: string;
  typeTag: string;
  providerCost: string;
};

const EMPTY_PLAN_DRAFT: PlanDraft = {
  name: "",
  description: "",
  price: "",
  validity: "",
  typeTag: "",
  providerCost: "",
};

/* ======================================================================
   Network add / rename
   ====================================================================== */

interface NetworkEditModalProps {
  open: boolean;
  mode: "create" | "rename";
  currentName?: string;
  existingNames: string[];
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export function NetworkEditModal({
  open,
  mode,
  currentName,
  existingNames,
  onClose,
  onConfirm,
}: NetworkEditModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(currentName ?? "");
    setError(null);
  }, [open, currentName]);

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a network name.");
      return;
    }
    const collision = existingNames.some(
      (existing) =>
        existing.toLowerCase() === trimmed.toLowerCase() &&
        existing !== currentName
    );
    if (collision) {
      setError("A network with that name already exists.");
      return;
    }
    onConfirm(trimmed);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add network" : "Rename network"}
      description={
        mode === "create"
          ? "New networks start empty. Add categories and plans after saving."
          : "Renaming a network updates every plan category under it."
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "Add network" : "Save changes"}
          </Button>
        </>
      }
    >
      <SettingsField
        label="Network name"
        htmlFor="dp-network-name"
        required
        error={error ?? undefined}
      >
        <Input
          id="dp-network-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          autoFocus
          placeholder="e.g. MTN, Telecel, AirtelTigo"
        />
      </SettingsField>
    </ModalShell>
  );
}

/* ======================================================================
   Network delete (type-to-confirm)
   ====================================================================== */

interface NetworkDeleteModalProps {
  open: boolean;
  networkName: string;
  planCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function NetworkDeleteModal({
  open,
  networkName,
  planCount,
  onClose,
  onConfirm,
}: NetworkDeleteModalProps) {
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTyped("");
    setError(null);
  }, [open]);

  if (!open) return null;

  const matches = typed.trim() === networkName;

  const handleSubmit = () => {
    if (!matches) {
      setError(`Type "${networkName}" exactly to confirm.`);
      return;
    }
    onConfirm();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Delete network"
      description={`Deleting ${networkName} removes ${planCount} plan${
        planCount === 1 ? "" : "s"
      } across every category. This cannot be undone.`}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleSubmit}
            disabled={!matches}
          >
            Delete network
          </Button>
        </>
      }
    >
      <SettingsField
        label={`Type ${networkName} to confirm`}
        htmlFor="dp-network-delete"
        required
        error={error ?? undefined}
      >
        <Input
          id="dp-network-delete"
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          autoFocus
          placeholder={networkName}
        />
      </SettingsField>
    </ModalShell>
  );
}

/* ======================================================================
   Category add / rename
   ====================================================================== */

interface CategoryEditModalProps {
  open: boolean;
  mode: "create" | "rename";
  networkName: string;
  currentName?: string;
  existingNames: string[];
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export function CategoryEditModal({
  open,
  mode,
  networkName,
  currentName,
  existingNames,
  onClose,
  onConfirm,
}: CategoryEditModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(currentName ?? "");
    setError(null);
  }, [open, currentName]);

  if (!open) return null;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a category name.");
      return;
    }
    const collision = existingNames.some(
      (existing) =>
        existing.toLowerCase() === trimmed.toLowerCase() &&
        existing !== currentName
    );
    if (collision) {
      setError("A category with that name already exists on this network.");
      return;
    }
    onConfirm(trimmed);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={
        mode === "create" ? `Add category to ${networkName}` : "Rename category"
      }
      description={
        mode === "create"
          ? "Categories group plans under a network. Example: All, Unlimited, Non-Expiry."
          : "Renaming updates the category label only. Plans inside are unchanged."
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "Add category" : "Save changes"}
          </Button>
        </>
      }
    >
      <SettingsField
        label="Category name"
        htmlFor="dp-category-name"
        required
        error={error ?? undefined}
      >
        <Input
          id="dp-category-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          autoFocus
          placeholder="e.g. Unlimited, Non-Expiry, Just4U"
        />
      </SettingsField>
    </ModalShell>
  );
}

/* ======================================================================
   Plan add / edit
   ====================================================================== */

interface PlanEditModalProps {
  open: boolean;
  mode: "create" | "edit";
  networkName: string;
  categoryName: string;
  plan?: Plan | null;
  existingPlanIds: string[];
  onClose: () => void;
  onConfirm: (plan: Plan, mode: "create" | "edit") => void;
}

export function PlanEditModal({
  open,
  mode,
  networkName,
  categoryName,
  plan,
  existingPlanIds,
  onClose,
  onConfirm,
}: PlanEditModalProps) {
  const [draft, setDraft] = useState<PlanDraft>(EMPTY_PLAN_DRAFT);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (plan) {
      setDraft({
        name: plan.name,
        description: plan.description ?? "",
        price: String(plan.price),
        validity: plan.validity ?? "",
        typeTag: plan.typeTag ?? "",
        providerCost:
          plan.providerCost !== undefined ? String(plan.providerCost) : "",
      });
    } else {
      setDraft(EMPTY_PLAN_DRAFT);
    }
    setError(null);
  }, [open, plan]);

  const proposedMargin = useMemo(() => {
    const price = Number(draft.price);
    const cost = draft.providerCost.trim() ? Number(draft.providerCost) : NaN;
    if (!Number.isFinite(price) || !Number.isFinite(cost) || price <= 0) {
      return null;
    }
    const absolute = price - cost;
    return {
      absolute,
      percent: (absolute / price) * 100,
    };
  }, [draft.price, draft.providerCost]);

  if (!open) return null;

  const handleSubmit = () => {
    const name = draft.name.trim();
    if (!name) {
      setError("Enter a plan name.");
      return;
    }

    if (!draft.price.trim()) {
      setError("Enter a price.");
      return;
    }
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a non-negative number.");
      return;
    }

    const providerCostRaw = draft.providerCost.trim();
    let providerCost: number | undefined;
    if (providerCostRaw) {
      const parsed = Number(providerCostRaw);
      if (!Number.isFinite(parsed) || parsed < 0) {
        setError("Provider cost must be a non-negative number or left blank.");
        return;
      }
      if (parsed > price) {
        setError("Provider cost cannot exceed the plan price.");
        return;
      }
      providerCost = parsed;
    }

    const newId = plan?.id ?? dataPlanIdFor(name, networkName);
    if (mode === "create" && existingPlanIds.includes(newId)) {
      setError("A plan with that name already exists on this network.");
      return;
    }

    const next: Plan = {
      ...(plan ?? {}),
      id: newId,
      name,
      description: draft.description.trim() || undefined,
      price,
      validity: draft.validity.trim() || undefined,
      typeTag: draft.typeTag.trim() || undefined,
      providerCost,
      active: plan?.active ?? true,
      statusHistory: plan?.statusHistory ?? [],
    };

    onConfirm(next, mode);
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Add plan" : "Edit plan"}
      description={`${networkName} · ${categoryName}`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            {mode === "create" ? "Add plan" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <SettingsField
          label="Plan name"
          htmlFor="dp-plan-name"
          required
          hint={plan ? `ID: ${plan.id}` : undefined}
        >
          <Input
            id="dp-plan-name"
            value={draft.name}
            onChange={(e) => {
              setDraft({ ...draft, name: e.target.value });
              setError(null);
            }}
            placeholder="e.g. 1GB, Unlimited 7 Days"
          />
        </SettingsField>

        <SettingsField
          label="Description"
          htmlFor="dp-plan-description"
          hint="Shown on the storefront under the plan name."
        >
          <Input
            id="dp-plan-description"
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            placeholder="e.g. Valid for 7 days"
          />
        </SettingsField>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField label="Price (GHS)" htmlFor="dp-plan-price" required>
            <Input
              id="dp-plan-price"
              type="number"
              min={0}
              step={0.01}
              value={draft.price}
              onChange={(e) => {
                setDraft({ ...draft, price: e.target.value });
                setError(null);
              }}
              placeholder="0.00"
            />
          </SettingsField>

          <SettingsField label="Validity" htmlFor="dp-plan-validity">
            <Input
              id="dp-plan-validity"
              value={draft.validity}
              onChange={(e) =>
                setDraft({ ...draft, validity: e.target.value })
              }
              placeholder="e.g. 7 days, No expiry"
            />
          </SettingsField>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsField
            label="Type tag"
            htmlFor="dp-plan-type-tag"
            hint="Optional label. e.g. Unlimited, Just4U, Special."
          >
            <Input
              id="dp-plan-type-tag"
              value={draft.typeTag}
              onChange={(e) => setDraft({ ...draft, typeTag: e.target.value })}
            />
          </SettingsField>

          <SettingsField
            label="Provider cost (GHS)"
            htmlFor="dp-plan-provider-cost"
            hint="Optional. Used to compute margin. Leave blank if unknown."
          >
            <Input
              id="dp-plan-provider-cost"
              type="number"
              min={0}
              step={0.01}
              value={draft.providerCost}
              onChange={(e) => {
                setDraft({ ...draft, providerCost: e.target.value });
                setError(null);
              }}
              placeholder="0.00"
            />
          </SettingsField>
        </div>

        {proposedMargin && (
          <div className="rounded-md border border-neutral-200 p-3 text-xs dark:border-neutral-700">
            <p className="font-medium text-neutral-700 dark:text-neutral-300">
              Margin preview
            </p>
            <p className="mt-1 text-neutral-500 dark:text-neutral-400">
              {formatCurrency(proposedMargin.absolute)} (
              {proposedMargin.percent.toFixed(1)}%)
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
    </ModalShell>
  );
}

/* ======================================================================
   Import plans
   ====================================================================== */

interface ImportPlansModalProps {
  open: boolean;
  networkName: string;
  categoryName: string;
  existingPlanNames: string[];
  onClose: () => void;
  onConfirm: (rows: ImportRow[]) => void;
}

const SAMPLE_CSV = `name,description,price,validity,typeTag
1GB,Valid for 7 days,6,7 days,All
2GB,Valid for 7 days,11,7 days,All
5GB,Valid for 30 days,25,30 days,All`;

export function ImportPlansModal({
  open,
  networkName,
  categoryName,
  existingPlanNames,
  onClose,
  onConfirm,
}: ImportPlansModalProps) {
  const [raw, setRaw] = useState("");

  useEffect(() => {
    if (!open) return;
    setRaw("");
  }, [open]);

  const validation = useMemo(
    () => validateImportCsv(raw, existingPlanNames),
    [raw, existingPlanNames]
  );

  if (!open) return null;

  const tooManyRows = validation.rows.length > IMPORT_MAX_ROWS;
  const canImport =
    validation.rows.length > 0 &&
    validation.errors.length === 0 &&
    !tooManyRows;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Import plans"
      description={`${networkName} · ${categoryName}. Paste a CSV below. Header row is optional.`}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!canImport}
            onClick={() => {
              onConfirm(validation.rows);
              onClose();
            }}
          >
            Import {validation.rows.length} plan
            {validation.rows.length === 1 ? "" : "s"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Columns: name, description, price, validity, typeTag
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRaw(SAMPLE_CSV)}
          >
            Paste sample
          </Button>
        </div>

        <textarea
          aria-label="CSV content"
          className="h-40 w-full rounded-md border border-neutral-300 p-2 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={SAMPLE_CSV}
        />

        {tooManyRows && (
          <p
            role="alert"
            className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/25 dark:text-danger-200"
          >
            {validation.rows.length} rows exceeds the {IMPORT_MAX_ROWS}-row
            limit. Split the import into smaller batches.
          </p>
        )}

        {validation.errors.length > 0 && (
          <div className="rounded-md border border-danger-200 bg-danger-50 p-3 text-xs dark:border-danger-800/60 dark:bg-danger-900/25">
            <p className="font-medium text-danger-800 dark:text-danger-200">
              {validation.errors.length} error
              {validation.errors.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-1 space-y-0.5 text-danger-700 dark:text-danger-300">
              {validation.errors.slice(0, 5).map((err) => (
                <li key={`${err.lineNumber}-${err.message}`}>
                  Line {err.lineNumber}: {err.message}
                </li>
              ))}
              {validation.errors.length > 5 && (
                <li>+{validation.errors.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="rounded-md border border-warning-200 bg-warning-50 p-3 text-xs dark:border-warning-800/60 dark:bg-warning-900/25">
            <p className="font-medium text-warning-900 dark:text-warning-100">
              {validation.warnings.length} warning
              {validation.warnings.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-1 space-y-0.5 text-warning-800 dark:text-warning-200">
              {validation.warnings.slice(0, 5).map((warn) => (
                <li key={`${warn.lineNumber}-${warn.message}`}>
                  Line {warn.lineNumber}: {warn.message}
                </li>
              ))}
              {validation.warnings.length > 5 && (
                <li>+{validation.warnings.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        {validation.rows.length > 0 && (
          <div className="rounded-md border border-neutral-200 dark:border-neutral-700">
            <p className="border-b border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:text-neutral-300">
              Preview ({validation.rows.length} row
              {validation.rows.length === 1 ? "" : "s"})
            </p>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-900">
                  <tr className="text-left text-neutral-500 dark:text-neutral-400">
                    <th scope="col" className="px-3 py-2">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-2">
                      Price
                    </th>
                    <th scope="col" className="px-3 py-2">
                      Validity
                    </th>
                    <th scope="col" className="px-3 py-2">
                      Type tag
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validation.rows.map((row) => (
                    <tr
                      key={`${row.lineNumber}-${row.name}`}
                      className="border-t border-neutral-100 dark:border-neutral-800"
                    >
                      <td className="px-3 py-1.5 text-neutral-900 dark:text-neutral-100">
                        {row.name}
                      </td>
                      <td className="px-3 py-1.5 text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(row.price)}
                      </td>
                      <td className="px-3 py-1.5 text-neutral-500 dark:text-neutral-400">
                        {row.validity || "—"}
                      </td>
                      <td className="px-3 py-1.5 text-neutral-500 dark:text-neutral-400">
                        {row.typeTag ? (
                          <Badge variant="info" size="sm">
                            {row.typeTag}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}