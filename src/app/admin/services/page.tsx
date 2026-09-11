"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServicesSummaryCards } from "@/components/admin/services/services-summary-cards";
import { ServicesFilters } from "@/components/admin/services/services-filters";
import { ServicesToolbar } from "@/components/admin/services/services-toolbar";
import { ServiceCategoryCard } from "@/components/admin/services/service-category-card";
import { ServiceCategoryDrawer } from "@/components/admin/services/service-category-drawer";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { mockServiceCategories } from "@/lib/admin/mock/services-admin";
import { ServiceCategory } from "@/lib/services-page-data";

interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [filters, setFilters] = useState<{
    search: string;
    filterGroup: string;
    status: string;
  }>({
    search: "",
    filterGroup: "",
    status: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setCategories(mockServiceCategories);
      setLoading(false);
    }, 500);
  }, []);

  const addAudit = (action: string) => {
    const entry: AuditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      admin: "current_admin@atlas.com",
      action,
    };
    setAuditLog((prev) => [entry, ...prev]);
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      if (
        filters.search &&
        !cat.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !cat.description.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;

      if (filters.filterGroup && cat.filterGroup !== filters.filterGroup) return false;

      if (filters.status === "available" && !cat.available) return false;
      if (filters.status === "coming_soon" && !cat.comingSoon) return false;
      if (filters.status === "inactive" && cat.available) return false;

      return true;
    });
  }, [categories, filters]);

  const handleFilterChange = (newFilters: {
    search: string;
    filterGroup: string;
    status: string;
  }) => {
    setFilters(newFilters);
  };

  const handleSaveCategory = (updated: ServiceCategory) => {
    if (isAdding) {
      setCategories((prev) => [...prev, updated]);
      addAudit(`Created service ${updated.name}`);
      setIsAdding(false);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      addAudit(`Updated service ${updated.name}`);
    }
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addAudit(`Deleted service ${cat?.name ?? id}`);
    setSelectedCategory(null);
  };

  const handleDuplicateCategory = (category: ServiceCategory) => {
    const duplicate: ServiceCategory = {
      ...category,
      id: `${category.id}-copy-${Date.now()}`,
      name: `${category.name} Copy`,
      available: false,
    };
    setCategories((prev) => [...prev, duplicate]);
    addAudit(`Duplicated service ${category.name}`);
  };

  const handleToggleAvailable = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, available: !c.available } : c))
    );
    const cat = categories.find((c) => c.id === id);
    addAudit(`Toggled availability for ${cat?.name ?? id}`);
  };

  const handleAddNew = () => {
    const newService: ServiceCategory = {
      id: `svc-${Date.now()}`,
      name: "New Service",
      description: "Description",
      icon: "grid",
      available: false,
      filterGroup: "more",
      networkOptions: [],
    };
    setSelectedCategory(newService);
    setIsAdding(true);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const bulkToggleAvailable = (available: boolean) => {
    setCategories((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, available } : c))
    );
    addAudit(
      `Bulk ${available ? "enabled" : "disabled"} ${selectedIds.length} services`
    );
    setSelectedIds([]);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export services as ${format}`);
  };

  const filterByStatus = (status: "available" | "coming_soon" | "inactive" | "all") => {
    setFilters({ ...filters, status: status === "all" ? "" : status });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        description="Manage service categories, form configuration, and offerings."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <ServicesSummaryCards
        categories={categories}
        onFilterAll={() => filterByStatus("all")}
        onFilterAvailable={() => filterByStatus("available")}
        onFilterComingSoon={() => filterByStatus("coming_soon")}
        onFilterInactive={() => filterByStatus("inactive")}
      />

      <ServicesFilters onFilterChange={handleFilterChange} />

      <ServicesToolbar
        selectedCount={selectedIds.length}
        onEnable={() => bulkToggleAvailable(true)}
        onDisable={() => bulkToggleAvailable(false)}
        onClearSelection={() => setSelectedIds([])}
        onExport={handleExport}
        onAddService={handleAddNew}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500">
            No services match your filters.
          </p>
          <button
            onClick={() => setFilters({ search: "", filterGroup: "", status: "" })}
            className="mt-2 text-sm text-brand-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <ServiceCategoryCard
              key={category.id}
              category={category}
              isSelected={selectedIds.includes(category.id)}
              onToggleSelect={() => toggleSelected(category.id)}
              onEdit={(cat) => {
                setSelectedCategory(cat);
                setIsAdding(false);
              }}
              onToggleAvailable={handleToggleAvailable}
              onDuplicate={handleDuplicateCategory}
            />
          ))}
        </div>
      )}

      {(selectedCategory || isAdding) && (
        <ServiceCategoryDrawer
          category={selectedCategory}
          onClose={() => {
            setSelectedCategory(null);
            setIsAdding(false);
          }}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
          onDuplicate={handleDuplicateCategory}
          auditLog={auditLog.filter((entry) =>
            entry.action.includes(selectedCategory?.name || "")
          )}
        />
      )}
    </div>
  );
}