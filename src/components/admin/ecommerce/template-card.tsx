"use client";

import Link from "next/link";
import type { TemplateWithUsage } from "@/lib/admin/templates/template-projection";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  PLAN_CODE_LABEL,
  PLAN_CODE_VARIANT,
  TEMPLATE_CATEGORY_LABEL,
  TEMPLATE_STATUS_LABEL,
  TEMPLATE_STATUS_VARIANT,
} from "@/lib/admin/templates/template-labels";

interface TemplateCardProps {
  template: TemplateWithUsage;
  onEdit: (template: TemplateWithUsage) => void;
  onToggleActive: (template: TemplateWithUsage) => void;
  onPreview: (template: TemplateWithUsage) => void;
  onDuplicate: (template: TemplateWithUsage) => void;
  onDelete: (template: TemplateWithUsage) => void;
}

export function TemplateCard({
  template,
  onEdit,
  onToggleActive,
  onPreview,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const status = template.isActive ? "active" : "inactive";

  return (
    <Card
      data-template-id={template.id}
      className="flex h-full flex-col"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            <AtlasIcon name="file-text" aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <CardTitle className="text-base">
              <span className="truncate">{template.name}</span>
            </CardTitle>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {TEMPLATE_CATEGORY_LABEL[template.category]}
              {" · "}
              <span className="font-mono">{template.id}</span>
            </p>
          </div>
        </div>
        <Badge
          variant={TEMPLATE_STATUS_VARIANT[status]}
          size="sm"
          className="shrink-0"
        >
          {TEMPLATE_STATUS_LABEL[status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-3">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
          {template.description}
        </p>

        <div>
          <p className="mb-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Allowed plans
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

        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          {template.usageCount > 0 ? (
            <Link
              href={
                "/admin/ecommerce/merchants?template=" +
                encodeURIComponent(template.id)
              }
              className="rounded-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
            >
              {template.usageCount} merchant
              {template.usageCount === 1 ? "" : "s"}
            </Link>
          ) : (
            <span>No merchants</span>
          )}
          <span className="font-mono">{template.componentName}</span>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <Can permission={PERMISSIONS.TEMPLATES_MANAGE}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(template)}
              aria-label={"Edit " + template.name}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(template)}
              aria-label={
                (template.isActive ? "Deactivate " : "Activate ") +
                template.name
              }
            >
              {template.isActive ? "Deactivate" : "Activate"}
            </Button>
          </Can>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview(template)}
            aria-label={"Preview " + template.name}
          >
            <AtlasIcon
              name="eye"
              aria-hidden="true"
              className="mr-1 h-3.5 w-3.5"
            />
            Preview
          </Button>
          <Can permission={PERMISSIONS.TEMPLATES_MANAGE}>
            <div className="ml-auto flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(template)}
                aria-label={"Duplicate " + template.name}
              >
                <AtlasIcon
                  name="copy"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "text-danger-600",
                  template.usageCount > 0 && "opacity-70"
                )}
                onClick={() => onDelete(template)}
                aria-label={"Delete " + template.name}
              >
                <AtlasIcon
                  name="trash"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
              </Button>
            </div>
          </Can>
        </div>
      </CardContent>
    </Card>
  );
}