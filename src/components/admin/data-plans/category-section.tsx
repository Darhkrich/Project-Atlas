"use client";

import { useState } from "react";
import { DataPlanCategory, DataPlan } from "@/lib/admin/types/data-plan";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { PlanRow } from "./plan-row";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface CategorySectionProps {
  category: DataPlanCategory;
  onEditCategory: (category: DataPlanCategory) => void;
  onDeleteCategory: (category: DataPlanCategory) => void;
  onAddPlan: (categoryId: string) => void;
  onEditPlan: (plan: DataPlan) => void;
  onDeletePlan: (plan: DataPlan) => void;
  onDuplicatePlan: (plan: DataPlan) => void;
  onTogglePlanActive: (planId: string) => void;
  onMovePlan: (planId: string, direction: "up" | "down") => void;
  onMoveCategory: (categoryId: string, direction: "up" | "down") => void;
  selectedPlanIds: string[];
  onTogglePlanSelect: (planId: string) => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
  planSearch?: string;
}

export function CategorySection({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
  onDuplicatePlan,
  onTogglePlanActive,
  onMovePlan,
  onMoveCategory,
  selectedPlanIds,
  onTogglePlanSelect,
  disableMoveUp,
  disableMoveDown,
  planSearch = "",
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const filteredPlans = category.plans.filter((p) => {
    if (!planSearch) return true;
    const q = planSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <AtlasIcon
              name="chevron-down"
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "-rotate-90"
              )}
            />
          </button>
          <CardTitle className="text-base">{category.name}</CardTitle>
          <span className="text-xs text-neutral-500">
            {category.plans.length} plans
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveCategory(category.id, "up")}
            disabled={disableMoveUp}
            className={cn(
              "text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200"
            )}
            aria-label="Move category up"
          >
            <AtlasIcon name="arrow-up" className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onMoveCategory(category.id, "down")}
            disabled={disableMoveDown}
            className={cn(
              "text-neutral-400 hover:text-neutral-700 disabled:opacity-30 dark:hover:text-neutral-200"
            )}
            aria-label="Move category down"
          >
            <AtlasIcon name="arrow-down" className="h-3.5 w-3.5" />
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddPlan(category.id)}
          >
            <AtlasIcon name="plus" className="h-4 w-4" />
            <span className="ml-1 text-xs">Plan</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditCategory(category)}
          >
            <AtlasIcon name="edit" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteCategory(category)}
          >
            <AtlasIcon name="trash" className="h-4 w-4 text-danger-500" />
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent>
          {category.plans.length === 0 ? (
            <p className="text-sm text-neutral-400">No plans in this category.</p>
          ) : filteredPlans.length === 0 ? (
            <p className="text-sm text-neutral-400">
              No plans match your search.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-neutral-500">
                    <th className="w-8"></th>
                    <th className="py-2">Plan</th>
                    <th className="py-2">Description</th>
                    <th className="py-2">Validity</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Price</th>
                    <th className="py-2">Margin</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 pr-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlans.map((plan, index) => (
                    <PlanRow
                      key={plan.id}
                      plan={plan}
                      isSelected={selectedPlanIds.includes(plan.id)}
                      onToggleSelect={() => onTogglePlanSelect(plan.id)}
                      onEdit={onEditPlan}
                      onDuplicate={onDuplicatePlan}
                      onDelete={onDeletePlan}
                      onToggleActive={onTogglePlanActive}
                      onMoveUp={() => onMovePlan(plan.id, "up")}
                      onMoveDown={() => onMovePlan(plan.id, "down")}
                      disableMoveUp={index === 0}
                      disableMoveDown={index === filteredPlans.length - 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}