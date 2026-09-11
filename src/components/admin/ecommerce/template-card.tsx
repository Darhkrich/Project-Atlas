/* eslint-disable @next/next/no-img-element */
"use client";

import { EcommerceTemplate } from "@/lib/admin/types/ecommerce-template";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";

interface TemplateCardProps {
  template: EcommerceTemplate;
  onEdit: (template: EcommerceTemplate) => void;
  onToggleActive: (id: string) => void;
  onPreview: (template: EcommerceTemplate) => void;
  onDuplicate: (template: EcommerceTemplate) => void;
}

export function TemplateCard({
  template,
  onEdit,
  onToggleActive,
  onPreview,
  onDuplicate,
}: TemplateCardProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-all dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800">
            {template.thumbnail ? (
              <img src={template.thumbnail} alt={template.name} className="h-12 w-12 rounded-md object-cover" />
            ) : (
              <AtlasIcon name="image" className="h-6 w-6 text-neutral-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">{template.name}</h3>
            <p className="text-xs text-neutral-500">{template.category}</p>
          </div>
        </div>
        <Badge variant={template.isActive ? "success" : "neutral"}>{template.isActive ? "Active" : "Inactive"}</Badge>
      </div>

      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{template.description}</p>

      <div className="mt-3 flex flex-wrap gap-1">
        {template.allowedPlans.map(plan => (
          <Badge key={plan} variant="info">{plan}</Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-xs text-neutral-500">Usage: {template.usageCount} stores</span>
        <span className="font-mono text-xs text-neutral-500">{template.componentName}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(template)}>Edit</Button>
        <Button variant="outline" size="sm" onClick={() => onToggleActive(template.id)}>
          {template.isActive ? "Disable" : "Enable"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onPreview(template)}>Preview</Button>
        <Button variant="ghost" size="sm" onClick={() => onDuplicate(template)}>Duplicate</Button>
      </div>
    </div>
  );
}