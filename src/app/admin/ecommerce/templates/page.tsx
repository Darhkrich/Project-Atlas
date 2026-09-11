"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { TemplatesSummaryCards } from "@/components/admin/ecommerce/templates-summary-cards";
import { TemplateCard } from "@/components/admin/ecommerce/template-card";
import { TemplateEditorDrawer } from "@/components/admin/ecommerce/template-editor-drawer";
import { TemplatePreviewModal } from "@/components/admin/ecommerce/template-preview-modal";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { mockEcommerceTemplates } from "@/lib/admin/mock/ecommerce-templates";
import { EcommerceTemplate } from "@/lib/admin/types/ecommerce-template";

export default function EcommerceTemplatesPage() {
  const [templates, setTemplates] = useState<EcommerceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<EcommerceTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EcommerceTemplate | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setTemplates(mockEcommerceTemplates);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = templates.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(templates.map(t => t.category)));

  const summaryData = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.isActive).length,
    inactiveTemplates: templates.filter(t => !t.isActive).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
  };

  const handleToggleActive = (id: string) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  const handleSaveTemplate = (template: EcommerceTemplate) => {
    if (templates.some(t => t.id === template.id)) {
      setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    } else {
      setTemplates(prev => [...prev, template]);
    }
    setSelectedTemplate(null);
  };

  const handleDuplicate = (template: EcommerceTemplate) => {
    const duplicate: EcommerceTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} Copy`,
      isActive: false,
      usageCount: 0,
    };
    setTemplates(prev => [...prev, duplicate]);
  };

  const handleAddTemplate = () => {
    const newTemplate: EcommerceTemplate = {
      id: `tpl-new-${Date.now()}`,
      name: "New Template",
      category: "General",
      description: "Description",
      componentName: "NewTemplate",
      allowedPlans: ["starter"],
      isActive: false,
      usageCount: 0,
    };
    setSelectedTemplate(newTemplate);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export templates as ${format}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Templates"
        description="Manage e-commerce storefront templates and plan assignments."
        actions={
          <>
            <ExportMenu onExport={handleExport} />
            <Button size="sm" onClick={handleAddTemplate}>Add Template</Button>
          </>
        }
      />

      <TemplatesSummaryCards data={summaryData} />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search templates..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={setSelectedTemplate}
              onToggleActive={handleToggleActive}
              onPreview={setPreviewTemplate}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      {/* Conditionally render the drawer only when a template is selected */}
      {selectedTemplate && (
        <TemplateEditorDrawer
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onSave={handleSaveTemplate}
        />
      )}

      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
}