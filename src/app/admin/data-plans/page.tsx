"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { DataPlanSummaryCards } from "@/components/admin/data-plans/data-plan-summary-cards";
import { NetworkSidebar } from "@/components/admin/data-plans/network-sidebar";
import { DataPlansToolbar } from "@/components/admin/data-plans/data-plans-toolbar";
import { CategorySection } from "@/components/admin/data-plans/category-section";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockDataNetworks } from "@/lib/admin/mock/data-plans";
import {
  DataNetwork,
  DataPlanCategory,
  DataPlan,
} from "@/lib/admin/types/data-plan";

type ModalType = "network" | "category" | "plan" | "import" | null;

interface ModalState {
  type: ModalType;
  networkId?: string;
  categoryId?: string;
  planId?: string;
  isNew: boolean;
}

export default function DataPlansPage() {
  const [networks, setNetworks] = useState<DataNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [auditLog, setAuditLog] = useState<
    { id: string; timestamp: string; admin: string; action: string }[]
  >([]);
  const [modal, setModal] = useState<ModalState>({ type: null, isNew: false });
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "network" | "category" | "plan";
    id: string;
    name: string;
    networkId?: string;
    categoryId?: string;
  } | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  // Form states
  const [networkName, setNetworkName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: 0,
    validity: "",
    typeTag: "",
  });

  useEffect(() => {
    setTimeout(() => {
      setNetworks(mockDataNetworks);
      if (mockDataNetworks.length > 0) {
        setSelectedNetworkId(mockDataNetworks[0].id);
      }
      setLoading(false);
    }, 500);
  }, []);

  const selectedNetwork = networks.find((n) => n.id === selectedNetworkId);

  // Auditing
  const addAudit = (action: string) => {
    setAuditLog((prev) => [
      {
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        admin: "current_admin@atlas.com",
        action,
      },
      ...prev,
    ]);
  };

  // Network operations
  const handleAddNetwork = () => {
    setNetworkName("");
    setModal({ type: "network", isNew: true });
  };

  const handleEditNetwork = (id: string) => {
    const net = networks.find((n) => n.id === id);
    if (!net) return;
    setNetworkName(net.name);
    setModal({ type: "network", networkId: id, isNew: false });
  };

  // Category operations
  const handleAddCategory = () => {
    setCategoryName("");
    setModal({ type: "category", networkId: selectedNetworkId, isNew: true });
  };

  const handleEditCategory = (category: DataPlanCategory) => {
    setCategoryName(category.name);
    setModal({
      type: "category",
      networkId: selectedNetworkId,
      categoryId: category.id,
      isNew: false,
    });
  };

  // Plan operations
  const handleAddPlan = (categoryId: string) => {
    setPlanForm({ name: "", description: "", price: 0, validity: "", typeTag: "" });
    setModal({
      type: "plan",
      networkId: selectedNetworkId,
      categoryId,
      isNew: true,
    });
  };

  const handleEditPlan = (plan: DataPlan) => {
    if (!selectedNetwork) return;
    const category = selectedNetwork.categories.find((c) =>
      c.plans.some((p) => p.id === plan.id)
    );
    if (!category) return;
    setPlanForm({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      validity: plan.validity,
      typeTag: plan.typeTag || "",
    });
    setModal({
      type: "plan",
      networkId: selectedNetwork.id,
      categoryId: category.id,
      planId: plan.id,
      isNew: false,
    });
  };

  const handleDuplicatePlan = (plan: DataPlan) => {
    if (!selectedNetwork) return;
    const category = selectedNetwork.categories.find((c) =>
      c.plans.some((p) => p.id === plan.id)
    );
    if (!category) return;

    const copy: DataPlan = {
      ...plan,
      id: `${plan.id}-copy-${Date.now()}`,
      name: `${plan.name} Copy`,
      active: false,
      statusHistory: [],
    };

    setNetworks((prev) =>
      prev.map((n) =>
        n.id === selectedNetwork.id
          ? {
              ...n,
              categories: n.categories.map((c) =>
                c.id === category.id ? { ...c, plans: [...c.plans, copy] } : c
              ),
            }
          : n
      )
    );
    addAudit(`Duplicated plan ${plan.name}`);
  };

  const handleTogglePlanActive = (planId: string) => {
    if (!selectedNetwork) return;
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === selectedNetwork.id
          ? {
              ...n,
              categories: n.categories.map((c) => ({
                ...c,
                plans: c.plans.map((p) =>
                  p.id === planId
                    ? {
                        ...p,
                        active: !p.active,
                        statusHistory: [
                          ...(p.statusHistory || []),
                          {
                            timestamp: new Date().toISOString(),
                            admin: "current_admin@atlas.com",
                            status: p.active ? "inactive" : "active",
                          },
                        ],
                      }
                    : p
                ),
              })),
            }
          : n
      )
    );
  };

  const handleMovePlan = (planId: string, direction: "up" | "down") => {
    if (!selectedNetwork) return;
    setNetworks((prev) =>
      prev.map((n) =>
        n.id === selectedNetwork.id
          ? {
              ...n,
              categories: n.categories.map((c) => {
                const idx = c.plans.findIndex((p) => p.id === planId);
                if (idx === -1) return c;
                const target = direction === "up" ? idx - 1 : idx + 1;
                if (target < 0 || target >= c.plans.length) return c;
                const plans = [...c.plans];
                [plans[idx], plans[target]] = [plans[target], plans[idx]];
                return { ...c, plans };
              }),
            }
          : n
      )
    );
  };

  const handleMoveCategory = (categoryId: string, direction: "up" | "down") => {
    if (!selectedNetwork) return;
    setNetworks((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNetwork.id) return n;
        const idx = n.categories.findIndex((c) => c.id === categoryId);
        if (idx === -1) return n;
        const target = direction === "up" ? idx - 1 : idx + 1;
        if (target < 0 || target >= n.categories.length) return n;
        const categories = [...n.categories];
        [categories[idx], categories[target]] = [categories[target], categories[idx]];
        return { ...n, categories };
      })
    );
  };

  // Save modal
  const handleSaveModal = () => {
    if (!modal.type) return;

    if (modal.type === "network") {
      if (modal.isNew) {
        const newId = `net-${Date.now()}`;
        const newNetwork: DataNetwork = {
          id: newId,
          name: networkName,
          categories: [],
        };
        setNetworks((prev) => [...prev, newNetwork]);
        setSelectedNetworkId(newId);
        addAudit(`Created network ${networkName}`);
      } else if (modal.networkId) {
        setNetworks((prev) =>
          prev.map((n) =>
            n.id === modal.networkId ? { ...n, name: networkName } : n
          )
        );
        addAudit(`Renamed network to ${networkName}`);
      }
    } else if (modal.type === "category" && modal.networkId) {
      if (modal.isNew) {
        const newCategory: DataPlanCategory = {
          id: `cat-${Date.now()}`,
          name: categoryName,
          plans: [],
        };
        setNetworks((prev) =>
          prev.map((n) =>
            n.id === modal.networkId
              ? { ...n, categories: [...n.categories, newCategory] }
              : n
          )
        );
        addAudit(`Added category ${categoryName}`);
      } else if (modal.categoryId) {
        setNetworks((prev) =>
          prev.map((n) =>
            n.id === modal.networkId
              ? {
                  ...n,
                  categories: n.categories.map((c) =>
                    c.id === modal.categoryId
                      ? { ...c, name: categoryName }
                      : c
                  ),
                }
              : n
          )
        );
        addAudit(`Renamed category to ${categoryName}`);
      }
    } else if (
      modal.type === "plan" &&
      modal.networkId &&
      modal.categoryId
    ) {
      if (modal.isNew) {
        const newPlan: DataPlan = {
          id: `plan-${Date.now()}`,
          name: planForm.name,
          description: planForm.description,
          price: planForm.price,
          validity: planForm.validity,
          active: true,
          typeTag: planForm.typeTag,
          providerCost: planForm.price * 0.8,
          statusHistory: [],
        };
        setNetworks((prev) =>
          prev.map((n) =>
            n.id === modal.networkId
              ? {
                  ...n,
                  categories: n.categories.map((c) =>
                    c.id === modal.categoryId
                      ? { ...c, plans: [...c.plans, newPlan] }
                      : c
                  ),
                }
              : n
          )
        );
        addAudit(`Added plan ${planForm.name}`);
      } else if (modal.planId) {
        setNetworks((prev) =>
          prev.map((n) =>
            n.id === modal.networkId
              ? {
                  ...n,
                  categories: n.categories.map((c) =>
                    c.id === modal.categoryId
                      ? {
                          ...c,
                          plans: c.plans.map((p) =>
                            p.id === modal.planId
                              ? {
                                  ...p,
                                  name: planForm.name,
                                  description: planForm.description,
                                  price: planForm.price,
                                  validity: planForm.validity,
                                  typeTag: planForm.typeTag,
                                }
                              : p
                          ),
                        }
                      : c
                  ),
                }
              : n
          )
        );
        addAudit(`Updated plan ${planForm.name}`);
      }
    }

    setModal({ type: null, isNew: false });
  };

  // Delete handlers
  const handleConfirmDelete = () => {
    if (!confirmDelete) return;
    const { type, id, networkId, categoryId } = confirmDelete;

    if (type === "network") {
      setNetworks((prev) => prev.filter((n) => n.id !== id));
      if (selectedNetworkId === id) {
        setSelectedNetworkId(networks.find((n) => n.id !== id)?.id || "");
      }
    } else if (type === "category" && networkId) {
      setNetworks((prev) =>
        prev.map((n) =>
          n.id === networkId
            ? { ...n, categories: n.categories.filter((c) => c.id !== id) }
            : n
        )
      );
    } else if (type === "plan" && networkId && categoryId) {
      setNetworks((prev) =>
        prev.map((n) =>
          n.id === networkId
            ? {
                ...n,
                categories: n.categories.map((c) =>
                  c.id === categoryId
                    ? { ...c, plans: c.plans.filter((p) => p.id !== id) }
                    : c
                ),
              }
            : n
        )
      );
    }

    addAudit(`Deleted ${type} ${confirmDelete.name}`);
    setConfirmDelete(null);
  };

  // Bulk actions
  const togglePlanSelect = (planId: string) => {
    setSelectedPlanIds((prev) =>
      prev.includes(planId)
        ? prev.filter((id) => id !== planId)
        : [...prev, planId]
    );
  };

  const bulkToggle = (active: boolean) => {
    setNetworks((prev) =>
      prev.map((n) => ({
        ...n,
        categories: n.categories.map((c) => ({
          ...c,
          plans: c.plans.map((p) =>
            selectedPlanIds.includes(p.id) ? { ...p, active } : p
          ),
        })),
      }))
    );
    addAudit(
      `Bulk ${active ? "enabled" : "disabled"} ${selectedPlanIds.length} plans`
    );
    setSelectedPlanIds([]);
  };

  // Export
  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export data plans as ${format}`);
  };

  const handleExportAudit = () => {
    const csv =
      "Timestamp,Admin,Action\n" +
      auditLog.map((e) => `${e.timestamp},${e.admin},${e.action}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-plans-audit.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setModal({ type: "import", isNew: true });
  };

  // Filter for search across all networks
  const filteredCategoriesForNetwork = useMemo(() => {
    if (!selectedNetwork) return [];
    return selectedNetwork.categories.map((c) => ({
      ...c,
      plans: c.plans.filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }),
    }));
  }, [selectedNetwork, search]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Data Plans"
        description="Manage data bundle categories and plans across all networks."
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
            />
          ))}
        </div>
      ) : (
        <>
          <DataPlanSummaryCards
            networks={networks}
            onFilterAll={() => setSearch("")}
            onFilterLowMargin={() => console.log("filter low margin")}
            onFilterInactive={() => console.log("filter inactive")}
          />

          <DataPlansToolbar
            search={search}
            onSearchChange={setSearch}
            selectedCount={selectedPlanIds.length}
            onEnable={() => bulkToggle(true)}
            onDisable={() => bulkToggle(false)}
            onClearSelection={() => setSelectedPlanIds([])}
            onExport={handleExport}
            onExportAudit={handleExportAudit}
            onImport={handleImport}
            onAddCategory={handleAddCategory}
          />

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Network sidebar */}
            <NetworkSidebar
              networks={networks}
              selectedNetworkId={selectedNetworkId}
              onSelectNetwork={setSelectedNetworkId}
              onAddNetwork={handleAddNetwork}
            />

            {/* Main content */}
            <div className="min-w-0 flex-1 space-y-4">
              {selectedNetwork ? (
                <>
                  {/* Network header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">
                        {selectedNetwork.name}
                      </h2>
                      <span className="rounded-full bg-info-100 px-2 py-0.5 text-xs font-medium text-info-700 dark:bg-info-900/40 dark:text-info-300">
                        {selectedNetwork.categories.length} categories
                      </span>
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                        {selectedNetwork.categories.reduce(
                          (sum, c) => sum + c.plans.length,
                          0
                        )}{" "}
                        plans
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditNetwork(selectedNetwork.id)}
                      >
                        Rename Network
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setConfirmDelete({
                            type: "network",
                            id: selectedNetwork.id,
                            name: selectedNetwork.name,
                          })
                        }
                      >
                        Delete Network
                      </Button>
                    </div>
                  </div>

                  {/* Categories */}
                  {filteredCategoriesForNetwork.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                      <p className="text-sm text-neutral-500">
                        No categories yet. Add one to get started.
                      </p>
                      <Button
                        size="sm"
                        className="mt-3"
                        onClick={handleAddCategory}
                      >
                        Add Category
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCategoriesForNetwork.map((category, index) => (
                        <CategorySection
                          key={category.id}
                          category={category}
                          planSearch={search}
                          onEditCategory={handleEditCategory}
                          onDeleteCategory={(cat) =>
                            setConfirmDelete({
                              type: "category",
                              id: cat.id,
                              name: cat.name,
                              networkId: selectedNetwork.id,
                            })
                          }
                          onAddPlan={handleAddPlan}
                          onEditPlan={handleEditPlan}
                          onDeletePlan={(plan) =>
                            setConfirmDelete({
                              type: "plan",
                              id: plan.id,
                              name: plan.name,
                              networkId: selectedNetwork.id,
                              categoryId: category.id,
                            })
                          }
                          onDuplicatePlan={handleDuplicatePlan}
                          onTogglePlanActive={handleTogglePlanActive}
                          onMovePlan={handleMovePlan}
                          onMoveCategory={handleMoveCategory}
                          selectedPlanIds={selectedPlanIds}
                          onTogglePlanSelect={togglePlanSelect}
                          disableMoveUp={index === 0}
                          disableMoveDown={
                            index === filteredCategoriesForNetwork.length - 1
                          }
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                  <p className="text-sm text-neutral-500">
                    Select a network to view its data plans.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audit log */}
          {auditLog.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {auditLog.slice(0, 10).map((entry) => (
                    <li
                      key={entry.id}
                      className="flex justify-between text-xs"
                    >
                      <span>{entry.action}</span>
                      <span className="text-neutral-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      {modal.type === "network" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModal({ type: null, isNew: false })}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">
              {modal.isNew ? "Add Network" : "Rename Network"}
            </h3>
            <Input
              className="mt-4"
              value={networkName}
              onChange={(e) => setNetworkName(e.target.value)}
              placeholder="Network name"
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModal({ type: null, isNew: false })}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveModal}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {modal.type === "category" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModal({ type: null, isNew: false })}
          />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">
              {modal.isNew ? "Add Category" : "Rename Category"}
            </h3>
            <Input
              className="mt-4"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Category name"
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModal({ type: null, isNew: false })}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveModal}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {modal.type === "plan" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModal({ type: null, isNew: false })}
          />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">
              {modal.isNew ? "Add Plan" : "Edit Plan"}
            </h3>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Plan name"
                value={planForm.name}
                onChange={(e) =>
                  setPlanForm({ ...planForm, name: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                value={planForm.description}
                onChange={(e) =>
                  setPlanForm({ ...planForm, description: e.target.value })
                }
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Price (GHS)"
                  value={planForm.price}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, price: Number(e.target.value) })
                  }
                />
                <Input
                  placeholder="Validity (e.g., 7 days)"
                  value={planForm.validity}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, validity: e.target.value })
                  }
                />
              </div>
              <Input
                placeholder="Type Tag (e.g., Unlimited)"
                value={planForm.typeTag}
                onChange={(e) =>
                  setPlanForm({ ...planForm, typeTag: e.target.value })
                }
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModal({ type: null, isNew: false })}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveModal}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {modal.type === "import" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setModal({ type: null, isNew: false })}
          />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Import Plans (CSV)</h3>
            <p className="mt-2 text-xs text-neutral-500">
              Format: name, description, price, validity, typeTag
            </p>
            <textarea
              className="mt-4 h-40 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              placeholder="plan1,Description,10,7 days,Unlimited"
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModal({ type: null, isNew: false })}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveModal}>
                Import
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Confirm Delete ${
          confirmDelete ? confirmDelete.type.charAt(0).toUpperCase() + confirmDelete.type.slice(1) : ""
        }`}
        description={`Are you sure you want to delete ${
          confirmDelete?.name || ""
        }? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}