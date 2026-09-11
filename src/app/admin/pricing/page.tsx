/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PricingSummaryCards } from "@/components/admin/pricing/pricing-summary-cards";
import { PricingDetailDrawer } from "@/components/admin/pricing/pricing-detail-drawer";
import { ServicePricingCard } from "@/components/admin/pricing/service-pricing-card";
import { PlanPricingCard } from "@/components/admin/pricing/plan-pricing-card";
import { PlanPricingSummaryCards } from "@/components/admin/pricing/plan-pricing-summary-cards";
import { PlanPricingDetailDrawer } from "@/components/admin/pricing/plan-pricing-detail-drawer";
import { CommissionRulesManager } from "@/components/admin/pricing/commission-rules-manager";
import { SubscriptionPlansManager } from "@/components/admin/pricing/subscription-plans-manager";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockServicePricing } from "@/lib/admin/mock/pricing";
import { mockPlanPricing } from "@/lib/admin/mock/plan-pricing";
import {
  ServicePricing,
  SERVICE_CATEGORIES,
  SERVICE_STATUS_LABELS,
} from "@/lib/admin/types/pricing";
import { PlanPricing, PLAN_PRICING_STATUS_LABELS } from "@/lib/admin/types/plan-pricing";
import { cn } from "@/lib/utils";

type Tab = "overview" | "plan_pricing" | "commission_rules" | "subscription_plans";

export default function PricingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [services, setServices] = useState<ServicePricing[]>([]);
  const [plans, setPlans] = useState<PlanPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServicePricing | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanPricing | null>(null);
  const [confirmSaveService, setConfirmSaveService] = useState(false);

  // Service filters
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("");
  const [onlyLowMargin, setOnlyLowMargin] = useState(false);

  // Plan filters
  const [planSearch, setPlanSearch] = useState("");
  const [planCategoryFilter, setPlanCategoryFilter] = useState("");
  const [planNetworkFilter, setPlanNetworkFilter] = useState("");
  const [planStatusFilter, setPlanStatusFilter] = useState("");

  // Column visibility for plans
  const [visiblePlanColumns, setVisiblePlanColumns] = useState<string[]>([
    "planName",
    "serviceCategory",
    "network",
    "atlasPrice",
    "margin",
    "status",
  ]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Load mock data
  useEffect(() => {
    setTimeout(() => {
      setServices(mockServicePricing);
      setPlans(mockPlanPricing);
      setLoading(false);
    }, 500);
  }, []);

  // Filters for services
  const filteredServices = services.filter((s) => {
    if (serviceSearch && !s.serviceName.toLowerCase().includes(serviceSearch.toLowerCase())) return false;
    if (serviceCategoryFilter && s.category !== serviceCategoryFilter) return false;
    if (serviceStatusFilter && s.status !== serviceStatusFilter) return false;
    if (onlyLowMargin) {
      const marginPercent = ((s.atlasPrice - s.providerCost) / s.atlasPrice) * 100;
      if (marginPercent >= 10) return false;
    }
    return true;
  });

  // Filters for plans
  const filteredPlans = plans.filter((p) => {
    if (planSearch && !p.planName.toLowerCase().includes(planSearch.toLowerCase())) return false;
    if (planCategoryFilter && p.serviceCategory !== planCategoryFilter) return false;
    if (planNetworkFilter && p.network !== planNetworkFilter) return false;
    if (planStatusFilter && p.status !== planStatusFilter) return false;
    return true;
  });

  // Paginated plans
  const totalPlanPages = Math.ceil(filteredPlans.length / pageSize);
  const paginatedPlans = filteredPlans.slice((page - 1) * pageSize, page * pageSize);

  // Unique networks
  const networks = Array.from(
    new Set(plans.map((p) => p.network).filter(Boolean) as string[])
  );

  const handleSaveService = (updated: ServicePricing) => {
    setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setConfirmSaveService(false);
    setSelectedService(null);
  };

  const handleSavePlan = (
    plan: PlanPricing,
    changes: {
      providerCost: number;
      atlasPrice: number;
      resellerPrice: number;
      commissionRate: number;
      status: "active" | "inactive";
      reason: string;
    }
  ) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === plan.id
          ? {
              ...p,
              providerCost: changes.providerCost,
              atlasPrice: changes.atlasPrice,
              resellerPrice: changes.resellerPrice,
              commissionRate: changes.commissionRate,
              status: changes.status,
              lastUpdated: new Date().toISOString(),
              updatedBy: "current_admin@atlas.com",
            }
          : p
      )
    );
    setSelectedPlan(null);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export pricing as ${format}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pricing"
        description="Price & Margin Control Center"
        actions={<ExportMenu onExport={handleExport} />}
      />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800">
        {[
          { key: "overview" as Tab, label: "Pricing Overview" },
          { key: "plan_pricing" as Tab, label: "Plan Pricing" },
          { key: "commission_rules" as Tab, label: "Commission Rules" },
          { key: "subscription_plans" as Tab, label: "Subscription Plans" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium",
              activeTab === tab.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-neutral-500 hover:text-neutral-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <PricingSummaryCards
            onFilterAll={() => {
              setServiceCategoryFilter("");
              setServiceStatusFilter("");
              setOnlyLowMargin(false);
            }}
            onFilterLowMargin={() => {
              setOnlyLowMargin(true);
              setServiceCategoryFilter("");
              setServiceStatusFilter("");
            }}
            onFilterInactive={() => {
              setServiceStatusFilter("inactive");
              setServiceCategoryFilter("");
              setOnlyLowMargin(false);
            }}
          />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search services..."
              className="max-w-xs"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
            />
            <select
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={serviceCategoryFilter}
              onChange={(e) => setServiceCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={serviceStatusFilter}
              onChange={(e) => setServiceStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {onlyLowMargin && (
              <button
                onClick={() => setOnlyLowMargin(false)}
                className="flex items-center gap-1 rounded-full bg-warning-100 px-3 py-1 text-xs font-medium text-warning-700 dark:bg-warning-900/40 dark:text-warning-300"
              >
                Low margin only ✕
              </button>
            )}
          </div>

          {/* Service Cards */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
              <p className="text-sm text-neutral-500">No services match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredServices.map((service) => (
                <ServicePricingCard
                  key={service.id}
                  service={service}
                  onEdit={setSelectedService}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Plan Pricing Tab */}
      {activeTab === "plan_pricing" && (
        <>
          <PlanPricingSummaryCards />

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search plans..."
              className="max-w-xs"
              value={planSearch}
              onChange={(e) => setPlanSearch(e.target.value)}
            />
            <select
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={planCategoryFilter}
              onChange={(e) => setPlanCategoryFilter(e.target.value)}
            >
              <option value="">All Services</option>
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={planNetworkFilter}
              onChange={(e) => setPlanNetworkFilter(e.target.value)}
            >
              <option value="">All Networks</option>
              {networks.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
              value={planStatusFilter}
              onChange={(e) => setPlanStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Plans grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
                />
              ))}
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
              <p className="text-sm text-neutral-500">No plans match your filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedPlans.map((plan) => (
                  <PlanPricingCard
                    key={plan.id}
                    plan={plan}
                    onEdit={setSelectedPlan}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPlanPages > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Page {page} of {totalPlanPages} · {filteredPlans.length} plans
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPlanPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Commission Rules Tab */}
      {activeTab === "commission_rules" && <CommissionRulesManager />}

      {/* Subscription Plans Tab */}
      {activeTab === "subscription_plans" && <SubscriptionPlansManager />}

      {/* Drawers */}
      <PricingDetailDrawer
        service={selectedService}
        onClose={() => setSelectedService(null)}
      />

      <PlanPricingDetailDrawer
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        onSave={handleSavePlan}
      />

      <ConfirmDialog
        open={confirmSaveService}
        title="Save Changes"
        description="Are you sure you want to save these price changes?"
        confirmLabel="Save"
        onConfirm={() => setConfirmSaveService(false)}
        onCancel={() => setConfirmSaveService(false)}
      />
    </div>
  );
}