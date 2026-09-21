"use client";

import type { EcommerceTemplate } from "@/lib/admin/types/ecommerce-template";
import { Button } from "@/components/admin/ui/button";
import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  PLAN_CODE_LABEL,
  PLAN_CODE_VARIANT,
  TEMPLATE_CATEGORY_LABEL,
} from "@/lib/admin/templates/template-labels";

interface TemplatePreviewModalProps {
  open: boolean;
  template: EcommerceTemplate | null;
  onClose: () => void;
}

export function TemplatePreviewModal({
  open,
  template,
  onClose,
}: TemplatePreviewModalProps) {
  if (!open || !template) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={template.name + " preview"}
      description={template.description}
      size="lg"
      footer={
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Badge variant="neutral" size="sm">
            {TEMPLATE_CATEGORY_LABEL[template.category]}
          </Badge>
          <span className="font-mono text-neutral-500 dark:text-neutral-400">
            {template.id}
          </span>
          <span className="font-mono text-neutral-500 dark:text-neutral-400">
            {template.componentName}
          </span>
        </div>

        <div className="rounded-md border border-info-200 bg-info-50 p-3 text-xs text-info-900 dark:border-info-800/60 dark:bg-info-900/20 dark:text-info-100">
          <p className="flex items-start gap-2">
            <AtlasIcon
              name="info"
              aria-hidden="true"
              className="mt-0.5 h-3.5 w-3.5 shrink-0"
            />
            <span>
              Mock preview. Real template rendering arrives once the
              storefront runtime accepts a template ID.
            </span>
          </p>
        </div>

        <div
          aria-hidden="true"
          className="rounded-lg border border-neutral-200 p-6 dark:border-neutral-700"
        >
          <div className="flex h-48 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-900/20">
            <p className="text-4xl font-bold text-brand-700 dark:text-brand-300">
              Storefront
            </p>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="h-32 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-32 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-32 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Available to plans
          </p>
          <ul role="list" className="flex flex-wrap gap-1">
            {template.allowedPlans.map((plan) => (
              <li key={plan}>
                <Badge variant={PLAN_CODE_VARIANT[plan]} size="sm">
                  {PLAN_CODE_LABEL[plan]}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ModalShell>
  );
}