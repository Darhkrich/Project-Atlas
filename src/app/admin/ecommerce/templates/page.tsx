"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { EcommerceTemplate } from "@/lib/admin/types/ecommerce-template";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import { useUrlFilters } from "@/lib/admin/hooks/use-url-filters";
import { useDebouncedValue } from "@/lib/admin/hooks/use-debounced-value";
import { useEcommerceTemplates } from "@/lib/admin/hooks/use-ecommerce-templates";
import { downloadCsv } from "@/lib/admin/support/csv-export";
import { templatesToCsv } from "@/lib/admin/templates/template-csv-export";
import {
  filterTemplates,
  type TemplateFilters,
  type TemplateWithUsage,
} from "@/lib/admin/templates/template-projection";
import {
  ALL_TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY_LABEL,
} from "@/lib/admin/templates/template-labels";
import {
  createTemplate,
  deleteTemplate,
  duplicateTemplate,
  toggleTemplateActive,
  updateTemplate,
  type TemplateActor,
} from "@/lib/admin/mock/template-store";
import { TemplatesSummaryCards } from "@/components/admin/ecommerce/templates-summary-cards";
import { TemplateCard } from "@/components/admin/ecommerce/template-card";
import {
  TemplateEditorModal,
  type TemplateEditorInput,
} from "@/components/admin/ecommerce/template-editor-modal";
import { TemplatePreviewModal } from "@/components/admin/ecommerce/template-preview-modal";
import { TemplateDeleteModal } from "@/components/admin/ecommerce/template-delete-modal";
import {
  DeactivateTemplateModal,
  DuplicateTemplateModal,
} from "@/components/admin/ecommerce/template-action-modals";

interface UrlFilters extends TemplateFilters {
  view: string;
}

const DEFAULT_FILTERS: UrlFilters = {
  q: "",
  category: "",
  status: "",
  view: "all",
};

interface Toast {
  kind: "success" | "error";
  text: string;
}

export default function EcommerceTemplatesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EcommerceTemplatesPageInner />
    </Suspense>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    </div>
  );
}

function EcommerceTemplatesPageInner() {
  const admin = useCurrentAdmin();
  const { templates, summary, loading } = useEcommerceTemplates();

  const { filters, setFilters, clearFilters, hasActive } =
    useUrlFilters<UrlFilters>(DEFAULT_FILTERS);
  const debouncedSearch = useDebouncedValue(filters.q, 300);

  const [editorState, setEditorState] = useState<
    | { kind: "closed" }
    | { kind: "create" }
    | { kind: "edit"; template: EcommerceTemplate }
  >({ kind: "closed" });
  const [previewTarget, setPreviewTarget] =
    useState<EcommerceTemplate | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    useState<TemplateWithUsage | null>(null);
  const [duplicateTarget, setDuplicateTarget] =
    useState<TemplateWithUsage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TemplateWithUsage | null>(
    null
  );
  const [toast, setToast] = useState<Toast | null>(null);

  const actor: TemplateActor = useMemo(
    () =>
      admin
        ? { name: admin.name, email: admin.email }
        : { name: "System", email: "system@atlas.com" },
    [admin]
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showToast = (kind: Toast["kind"], text: string) => {
    setToast({ kind, text });
  };

  const filtered = useMemo(
    () =>
      filterTemplates(templates, {
        q: debouncedSearch,
        category: filters.category,
        status: filters.status,
      }),
    [templates, debouncedSearch, filters.category, filters.status]
  );

  const headerMeta = (
    <>
      <span>
        {summary.totalTemplates} template
        {summary.totalTemplates === 1 ? "" : "s"}
      </span>
      <span aria-hidden="true">·</span>
      <span>{summary.activeTemplates} active</span>
      {summary.inactiveTemplates > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span className="text-neutral-500 dark:text-neutral-400">
            {summary.inactiveTemplates} inactive
          </span>
        </>
      )}
      <span aria-hidden="true">·</span>
      <span>{summary.totalUsage} merchants assigned</span>
    </>
  );

  /* --------------------------- Handlers ----------------------------- */

  const handleCreate = (input: TemplateEditorInput) => {
    const result = createTemplate(input, actor);
    if (result.ok && result.template) {
      showToast("success", result.template.name + " created.");
    } else if (!result.ok) {
      showToast("error", result.error ?? "Could not create template.");
    }
    return result.ok
      ? { ok: true }
      : { ok: false, error: result.error, field: result.field };
  };

  const handleEdit = (input: TemplateEditorInput) => {
    if (editorState.kind !== "edit") {
      return { ok: false, error: "No target." };
    }
    const result = updateTemplate(editorState.template.id, input, actor);
    if (result.ok && result.template) {
      showToast("success", result.template.name + " updated.");
    } else if (!result.ok) {
      showToast("error", result.error ?? "Could not update template.");
    }
    return result.ok
      ? { ok: true }
      : { ok: false, error: result.error, field: result.field };
  };

  const handleToggleActive = (template: TemplateWithUsage) => {
    if (template.isActive && template.usageCount > 0) {
      setDeactivateTarget(template);
      return;
    }
    const result = toggleTemplateActive(template.id, actor);
    if (result.ok && result.template) {
      showToast(
        "success",
        result.template.name +
          (result.template.isActive ? " activated." : " deactivated.")
      );
    } else {
      showToast("error", result.error ?? "Could not toggle template.");
    }
  };

  const confirmDeactivate = () => {
    if (!deactivateTarget) return;
    const result = toggleTemplateActive(deactivateTarget.id, actor);
    if (result.ok && result.template) {
      showToast("success", result.template.name + " deactivated.");
    } else {
      showToast("error", result.error ?? "Could not deactivate template.");
    }
    setDeactivateTarget(null);
  };

  const confirmDuplicate = () => {
    if (!duplicateTarget) return;
    const result = duplicateTemplate(duplicateTarget.id, actor);
    if (result.ok && result.template) {
      showToast("success", result.template.name + " created.");
    } else {
      showToast("error", result.error ?? "Could not duplicate template.");
    }
    setDuplicateTarget(null);
  };

  const handleDeleteConfirm = (reason: string) => {
    if (!deleteTarget) return;
    const result = deleteTemplate(deleteTarget.id, reason, actor);
    if (result.ok) {
      showToast("success", deleteTarget.name + " deleted.");
    } else {
      showToast("error", result.error ?? "Could not delete template.");
    }
    setDeleteTarget(null);
  };

  const handleExport = () => {
    const csv = templatesToCsv(filtered);
    downloadCsv(
      "atlas-ecommerce-templates-" +
        new Date().toISOString().slice(0, 10) +
        ".csv",
      csv
    );
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Templates"
        description="Ecommerce storefront templates and the plans they are available to."
        meta={headerMeta}
        actions={
          <>
            <ExportMenu onExport={handleExport} formats={["csv"]} />
            <Can permission={PERMISSIONS.TEMPLATES_MANAGE}>
              <Button
                size="sm"
                onClick={() => setEditorState({ kind: "create" })}
              >
                Add template
              </Button>
            </Can>
          </>
        }
      />

      <TemplatesSummaryCards summary={summary} loading={loading} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <AtlasIcon
            name="search"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            aria-label="Search templates"
            placeholder="Search by name, description, or ID"
            className="pl-9"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
        </div>

        <select
          aria-label="Filter by category"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.category}
          onChange={(e) => setFilters({ category: e.target.value })}
        >
          <option value="">All categories</option>
          {ALL_TEMPLATE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {TEMPLATE_CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {hasActive && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <p
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400"
      >
        Showing {filtered.length} of {templates.length} template
        {templates.length === 1 ? "" : "s"}
        {hasActive ? " (filtered)" : ""}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_data"
            title="No templates yet"
            description="Add your first template to make it available to merchants."
            action={
              <Can permission={PERMISSIONS.TEMPLATES_MANAGE}>
                <Button
                  size="sm"
                  onClick={() => setEditorState({ kind: "create" })}
                >
                  Add template
                </Button>
              </Can>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <EmptyState
            variant="no_results"
            title="No templates match these filters"
            description="Try a different search or clear the filters."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <ul
          role="list"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((template) => (
            <li key={template.id}>
              <TemplateCard
                template={template}
                onEdit={(t) => {
                  const source = templates.find((x) => x.id === t.id);
                  if (!source) return;
                  setEditorState({ kind: "edit", template: source });
                }}
                onToggleActive={handleToggleActive}
                onPreview={(t) =>
                  setPreviewTarget(templates.find((x) => x.id === t.id) ?? null)
                }
                onDuplicate={(t) => setDuplicateTarget(t)}
                onDelete={(t) => setDeleteTarget(t)}
              />
            </li>
          ))}
        </ul>
      )}

      <TemplateEditorModal
        open={editorState.kind !== "closed"}
        mode={editorState.kind === "edit" ? "edit" : "create"}
        template={editorState.kind === "edit" ? editorState.template : null}
        onClose={() => setEditorState({ kind: "closed" })}
        onSubmit={editorState.kind === "edit" ? handleEdit : handleCreate}
      />

      <TemplatePreviewModal
        open={previewTarget !== null}
        template={previewTarget}
        onClose={() => setPreviewTarget(null)}
      />

      <DeactivateTemplateModal
        open={deactivateTarget !== null}
        template={deactivateTarget}
        usageCount={deactivateTarget?.usageCount ?? 0}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={confirmDeactivate}
      />

      <DuplicateTemplateModal
        open={duplicateTarget !== null}
        template={duplicateTarget}
        onClose={() => setDuplicateTarget(null)}
        onConfirm={confirmDuplicate}
      />

      <TemplateDeleteModal
        open={deleteTarget !== null}
        template={deleteTarget}
        usageCount={deleteTarget?.usageCount ?? 0}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={
            toast.kind === "success"
              ? "rounded-md border border-success-200 bg-success-50 p-3 text-sm text-success-800 dark:border-success-800/60 dark:bg-success-900/20 dark:text-success-200"
              : "rounded-md border border-danger-200 bg-danger-50 p-3 text-sm text-danger-800 dark:border-danger-800/60 dark:bg-danger-900/20 dark:text-danger-200"
          }
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}