/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import {
  DataNetwork,
  DataPlanCategory,
  DataPlan,
} from "@/lib/admin/types/data-plan";
import { mockDataNetworks } from "@/lib/admin/mock/data-plans";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Badge } from "@/components/admin/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
}

type ModalType = "network" | "category" | "plan" | "import" | null;

interface ModalState {
  type: ModalType;
  networkId?: string;
  categoryId?: string;
  planId?: string;
  isNew: boolean;
}

export function DataPlansManager() {
  const [networks, setNetworks] = useState<DataNetwork[]>(mockDataNetworks);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>(networks[0]?.id || "");
  const [globalSearch, setGlobalSearch] = useState("");
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [modal, setModal] = useState<ModalState>({ type: null, isNew: false });
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; name: string } | null>(null);
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([]);

  // Form states
  const [networkName, setNetworkName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState(0);
  const [planValidity, setPlanValidity] = useState("");
  const [planTypeTag, setPlanTypeTag] = useState("");
  const [csvText, setCsvText] = useState("");

  const selectedNetwork = networks.find(n => n.id === selectedNetworkId) || null;

  const addAudit = (action: string) => {
    const entry: AuditEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      admin: "current_admin@atlas.com",
      action,
    };
    setAuditLog(prev => [entry, ...prev]);
  };

  const openModal = (modalState: ModalState) => setModal(modalState);

  // Handlers for CRUD
  const handleAddNetwork = () => {
    setNetworkName("");
    openModal({ type: "network", isNew: true });
  };

  const handleEditNetwork = (id: string) => {
    const net = networks.find(n => n.id === id);
    if (!net) return;
    setNetworkName(net.name);
    openModal({ type: "network", networkId: id, isNew: false });
  };

  const handleAddCategory = (networkId: string) => {
    setCategoryName("");
    openModal({ type: "category", networkId, isNew: true });
  };

  const handleEditCategory = (networkId: string, categoryId: string) => {
    const net = networks.find(n => n.id === networkId);
    const cat = net?.categories.find(c => c.id === categoryId);
    if (!cat) return;
    setCategoryName(cat.name);
    openModal({ type: "category", networkId, categoryId, isNew: false });
  };

  const handleAddPlan = (networkId: string, categoryId: string) => {
    setPlanName("");
    setPlanDescription("");
    setPlanPrice(0);
    setPlanValidity("");
    setPlanTypeTag("");
    openModal({ type: "plan", networkId, categoryId, isNew: true });
  };

  const handleEditPlan = (networkId: string, categoryId: string, planId: string) => {
    const net = networks.find(n => n.id === networkId);
    const cat = net?.categories.find(c => c.id === categoryId);
    const plan = cat?.plans.find(p => p.id === planId);
    if (!plan) return;
    setPlanName(plan.name);
    setPlanDescription(plan.description);
    setPlanPrice(plan.price);
    setPlanValidity(plan.validity);
    setPlanTypeTag(plan.typeTag || "");
    openModal({ type: "plan", networkId, categoryId, planId, isNew: false });
  };

  const handleSaveModal = () => {
    if (!modal.type) return;

    if (modal.type === "network") {
      // existing code
    } else if (modal.type === "category" && modal.networkId) {
      // existing code
    } else if (modal.type === "plan" && modal.networkId && modal.categoryId) {
      // updated with new fields
      if (modal.isNew) {
        const newPlan: DataPlan = {
          id: `plan-${Date.now()}`,
          name: planName,
          description: planDescription,
          price: planPrice,
          validity: planValidity,
          active: true,
          typeTag: planTypeTag,
          providerCost: planPrice * 0.8,
          statusHistory: [],
        };
        setNetworks(prev => prev.map(n => n.id === modal.networkId ? {
          ...n,
          categories: n.categories.map(c => c.id === modal.categoryId ? { ...c, plans: [...c.plans, newPlan] } : c)
        } : n));
        addAudit(`Added plan ${planName}`);
      } else if (modal.planId) {
        setNetworks(prev => prev.map(n => n.id === modal.networkId ? {
          ...n,
          categories: n.categories.map(c => c.id === modal.categoryId ? {
            ...c,
            plans: c.plans.map(p => p.id === modal.planId ? { ...p, name: planName, description: planDescription, price: planPrice, validity: planValidity, typeTag: planTypeTag } : p)
          } : c)
        } : n));
        addAudit(`Updated plan ${planName}`);
      }
    } else if (modal.type === "import") {
      // CSV import logic
      const lines = csvText.split("\n").filter(line => line.trim());
      const importedPlans: DataPlan[] = lines.slice(1).map(line => {
        const [name, description, price, validity, typeTag] = line.split(",").map(s => s.trim());
        return {
          id: `plan-import-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name,
          description,
          price: Number(price) || 0,
          validity,
          active: true,
          typeTag,
          providerCost: Number(price) * 0.8 || 0,
          statusHistory: [],
        };
      });
      if (selectedNetwork && modal.categoryId) {
        setNetworks(prev => prev.map(n => n.id === selectedNetwork.id ? {
          ...n,
          categories: n.categories.map(c => c.id === modal.categoryId ? { ...c, plans: [...c.plans, ...importedPlans] } : c)
        } : n));
        addAudit(`Imported ${importedPlans.length} plans`);
      }
    }
    setModal({ type: null, isNew: false });
  };

  const handleDelete = (type: string, id: string, name: string) => setConfirmDelete({ type, id, name });

  const confirmDeleteAction = () => {
    if (!confirmDelete) return;
    const { type, id, name } = confirmDelete;

    if (type === "network") {
      setNetworks(prev => prev.filter(n => n.id !== id));
      if (selectedNetworkId === id) setSelectedNetworkId(networks[0]?.id || "");
      addAudit(`Deleted network ${name}`);
    } else if (type === "category" && selectedNetwork) {
      setNetworks(prev => prev.map(n => n.id === selectedNetwork.id ? { ...n, categories: n.categories.filter(c => c.id !== id) } : n));
      addAudit(`Deleted category ${name}`);
    } else if (type === "plan" && selectedNetwork) {
      setNetworks(prev => prev.map(n => n.id === selectedNetwork.id ? {
        ...n,
        categories: n.categories.map(c => ({ ...c, plans: c.plans.filter(p => p.id !== id) }))
      } : n));
      addAudit(`Deleted plan ${name}`);
    }
    setConfirmDelete(null);
  };

  const togglePlanActive = (networkId: string, categoryId: string, planId: string) => {
    setNetworks(prev => prev.map(n => n.id === networkId ? {
      ...n,
      categories: n.categories.map(c => c.id === categoryId ? {
        ...c,
        plans: c.plans.map(p => {
          if (p.id !== planId) return p;
          const newStatus = !p.active;
          const historyEntry: { timestamp: string; admin: string; status: "active" | "inactive" } = {
            timestamp: new Date().toISOString(),
            admin: "current_admin@atlas.com",
            status: newStatus ? "active" : "inactive",
          };
          return { ...p, active: newStatus, statusHistory: [...(p.statusHistory || []), historyEntry] };
        })
      } : c)
    } : n));
  };

  const duplicatePlan = (networkId: string, categoryId: string, planId: string) => {
    const net = networks.find(n => n.id === networkId);
    const cat = net?.categories.find(c => c.id === categoryId);
    const plan = cat?.plans.find(p => p.id === planId);
    if (!plan) return;
    const copy: DataPlan = { ...plan, id: `${plan.id}-copy-${Date.now()}`, name: `${plan.name} Copy`, statusHistory: [] };
    setNetworks(prev => prev.map(n => n.id === networkId ? {
      ...n,
      categories: n.categories.map(c => c.id === categoryId ? { ...c, plans: [...c.plans, copy] } : c)
    } : n));
    addAudit(`Duplicated plan ${plan.name}`);
  };

  const moveItem = (type: "category" | "plan", networkId: string, categoryId: string | null, itemId: string, direction: "up" | "down") => {
    setNetworks(prev => prev.map(n => n.id === networkId ? {
      ...n,
      categories: categoryId ? n.categories.map(c => {
        if (c.id !== categoryId) return c;
        if (type === "plan") {
          const index = c.plans.findIndex(p => p.id === itemId);
          const target = direction === "up" ? index - 1 : index + 1;
          if (index < 0 || target < 0 || target >= c.plans.length) return c;
          const plans = [...c.plans];
          [plans[index], plans[target]] = [plans[target], plans[index]];
          return { ...c, plans };
        }
        return c;
      }) : (type === "category" ? (() => {
        const index = n.categories.findIndex(c => c.id === itemId);
        const target = direction === "up" ? index - 1 : index + 1;
        if (index < 0 || target < 0 || target >= n.categories.length) return n.categories;
        const categories = [...n.categories];
        [categories[index], categories[target]] = [categories[target], categories[index]];
        return categories;
      })() : n.categories)
    } : n));
  };

  const togglePlanSelection = (planId: string) => {
    setSelectedPlanIds(prev => prev.includes(planId) ? prev.filter(id => id !== planId) : [...prev, planId]);
  };

  const bulkToggleActive = (active: boolean) => {
    setNetworks(prev => prev.map(n => ({
      ...n,
      categories: n.categories.map(c => ({
        ...c,
        plans: c.plans.map(p => selectedPlanIds.includes(p.id) ? {
          ...p,
          active,
          statusHistory: [...(p.statusHistory || []), { timestamp: new Date().toISOString(), admin: "current_admin@atlas.com", status: active ? "active" : "inactive" }]
        } : p)
      }))
    })));
    addAudit(`Bulk ${active ? "enabled" : "disabled"} ${selectedPlanIds.length} plans`);
    setSelectedPlanIds([]);
  };

  const exportAuditLog = () => {
    const csv = "Timestamp,Admin,Action\n" + auditLog.map(e => `${e.timestamp},${e.admin},${e.action}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const globalFilteredPlans = (plans: DataPlan[]) => {
    if (!globalSearch) return plans;
    const q = globalSearch.toLowerCase();
    return plans.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  };

  const filteredCategories = selectedNetwork?.categories.map(cat => ({
    ...cat,
    plans: globalFilteredPlans(cat.plans)
  })) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full lg:w-64 shrink-0">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Networks</CardTitle>
            <Button size="sm" variant="ghost" onClick={handleAddNetwork}>
              <AtlasIcon name="plus" className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {networks.map(net => (
                <li key={net.id}>
                  <button
                    onClick={() => setSelectedNetworkId(net.id)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
                      selectedNetworkId === net.id
                        ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    )}
                  >
                    <span>{net.name}</span>
                    <span className="text-xs text-neutral-500">{net.categories.length} categories</span>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {selectedNetwork ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{selectedNetwork.name}</h2>
                <Badge variant="info">{selectedNetwork.categories.length} categories</Badge>
                <Badge variant="info">{selectedNetwork.categories.reduce((sum, c) => sum + c.plans.length, 0)} plans</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditNetwork(selectedNetwork.id)}>Rename</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete("network", selectedNetwork.id, selectedNetwork.name)}>Delete</Button>
                <Button variant="outline" size="sm" onClick={exportAuditLog}>Export Audit</Button>
              </div>
            </div>

            {/* Global search */}
            <Input
              placeholder="Search all plans..."
              className="max-w-xs mb-4"
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
            />

            {/* Bulk actions bar */}
            {selectedPlanIds.length > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-neutral-50 p-2 mb-4 dark:bg-neutral-900">
                <span className="text-sm">{selectedPlanIds.length} selected</span>
                <Button variant="outline" size="sm" onClick={() => bulkToggleActive(true)}>Enable</Button>
                <Button variant="outline" size="sm" onClick={() => bulkToggleActive(false)}>Disable</Button>
              </div>
            )}

            {/* Categories */}
            <div className="space-y-4">
              {filteredCategories.map((category, catIndex) => (
                <Card key={category.id}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle>{category.name}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => moveItem("category", selectedNetwork.id, null, category.id, "up")}>↑</Button>
                      <Button variant="ghost" size="sm" onClick={() => moveItem("category", selectedNetwork.id, null, category.id, "down")}>↓</Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleAddPlan(selectedNetwork.id, category.id)}>Add Plan</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEditCategory(selectedNetwork.id, category.id)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete("category", category.id, category.name)}>Delete</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {category.plans.length === 0 ? (
                      <p className="text-sm text-neutral-400">No plans in this category.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-neutral-500">
                            <th><input type="checkbox" onChange={e => {
                              const ids = category.plans.map(p => p.id);
                              if (e.target.checked) setSelectedPlanIds(prev => [...new Set([...prev, ...ids])]);
                              else setSelectedPlanIds(prev => prev.filter(id => !ids.includes(id)));
                            }} className="h-4 w-4" /></th>
                            <th>Plan</th>
                            <th>Description</th>
                            <th>Validity</th>
                            <th>Type</th>
                            <th>Price</th>
                            <th>Margin</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.plans.map((plan, planIndex) => {
                            const margin = plan.providerCost !== undefined ? plan.price - plan.providerCost : 0;
                            const marginPercent = plan.price > 0 ? (margin / plan.price) * 100 : 0;
                            return (
                              <tr key={plan.id} className="border-t border-neutral-100 dark:border-neutral-800">
                                <td className="py-2">
                                  <input type="checkbox" checked={selectedPlanIds.includes(plan.id)} onChange={() => togglePlanSelection(plan.id)} className="h-4 w-4" />
                                </td>
                                <td className="py-2 font-medium">{plan.name}</td>
                                <td className="py-2">{plan.description}</td>
                                <td className="py-2">{plan.validity}</td>
                                <td className="py-2">{plan.typeTag && <Badge variant="info">{plan.typeTag}</Badge>}</td>
                                <td className="py-2">{formatCurrency(plan.price)}</td>
                                <td className="py-2 text-xs">{formatCurrency(margin)} ({marginPercent.toFixed(1)}%)</td>
                                <td className="py-2">
                                  <Badge variant={plan.active ? "success" : "neutral"}>{plan.active ? "Active" : "Inactive"}</Badge>
                                </td>
                                <td className="py-2">
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditPlan(selectedNetwork.id, category.id, plan.id)}>Edit</Button>
                                    <Button variant="ghost" size="sm" onClick={() => duplicatePlan(selectedNetwork.id, category.id, plan.id)}>Duplicate</Button>
                                    <Button variant="ghost" size="sm" onClick={() => togglePlanActive(selectedNetwork.id, category.id, plan.id)}>
                                      {plan.active ? "Disable" : "Enable"}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete("plan", plan.id, plan.name)}>Delete</Button>
                                    <Button variant="ghost" size="sm" onClick={() => moveItem("plan", selectedNetwork.id, category.id, plan.id, "up")}>↑</Button>
                                    <Button variant="ghost" size="sm" onClick={() => moveItem("plan", selectedNetwork.id, category.id, plan.id, "down")}>↓</Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" size="sm" onClick={() => handleAddCategory(selectedNetwork.id)}>Add Category</Button>
            </div>

            {/* Audit Trail */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Audit Trail</CardTitle>
                <Button size="sm" variant="outline" onClick={exportAuditLog}>Export CSV</Button>
              </CardHeader>
              <CardContent>
                {auditLog.length === 0 ? (
                  <p className="text-sm text-neutral-400">No changes recorded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {auditLog.map(entry => (
                      <li key={entry.id} className="text-sm">
                        {entry.admin} {entry.action} · {new Date(entry.timestamp).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-neutral-500">Select a network to manage.</p>
        )}
      </div>

      {/* Modals remain similar to previous, but add import modal and enhance plan modal with new fields */}
      {modal.type === "network" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal({ type: null, isNew: false })} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">{modal.isNew ? "Add Network" : "Rename Network"}</h3>
            <Input className="mt-4" value={networkName} onChange={e => setNetworkName(e.target.value)} placeholder="Network name" />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModal({ type: null, isNew: false })}>Cancel</Button>
              <Button size="sm" onClick={handleSaveModal}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {modal.type === "category" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal({ type: null, isNew: false })} />
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">{modal.isNew ? "Add Category" : "Rename Category"}</h3>
            <Input className="mt-4" value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="Category name" />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModal({ type: null, isNew: false })}>Cancel</Button>
              <Button size="sm" onClick={handleSaveModal}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {modal.type === "plan" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal({ type: null, isNew: false })} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">{modal.isNew ? "Add Plan" : "Edit Plan"}</h3>
            <div className="mt-4 space-y-3">
              <Input placeholder="Plan name" value={planName} onChange={e => setPlanName(e.target.value)} />
              <Input placeholder="Description" value={planDescription} onChange={e => setPlanDescription(e.target.value)} />
              <div className="flex gap-2">
                <Input type="number" placeholder="Price (GHS)" value={planPrice} onChange={e => setPlanPrice(Number(e.target.value))} />
                <Input placeholder="Validity (e.g., 7 days)" value={planValidity} onChange={e => setPlanValidity(e.target.value)} />
              </div>
              <Input placeholder="Type Tag (e.g., Unlimited, Non-Expiry)" value={planTypeTag} onChange={e => setPlanTypeTag(e.target.value)} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModal({ type: null, isNew: false })}>Cancel</Button>
              <Button size="sm" onClick={handleSaveModal}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {modal.type === "import" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal({ type: null, isNew: false })} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Import Plans (CSV)</h3>
            <p className="text-sm text-neutral-500 mt-2">CSV format: name, description, price, validity, typeTag</p>
            <textarea
              className="mt-4 h-40 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder="plan1,Description,10,7 days,Unlimited"
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModal({ type: null, isNew: false })}>Cancel</Button>
              <Button size="sm" onClick={handleSaveModal}>Import</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Confirm Delete ${confirmDelete?.type ?? ''}`}
        description={`Are you sure you want to delete ${confirmDelete?.name}?`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}