"use client";

import { useState } from "react";
import type {
  DataPlanCategory,
  DataPlan,
} from "@/lib/admin/types/data-plan";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { PlanRow } from "./plan-row";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { PLAN_ROW_PAGE_SIZE } from "@/lib/admin/data-plans/constants";

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
  searchActive?: boolean;
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
  searchActive,
}: CategorySectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PLAN_ROW_PAGE_SIZE);

  const plans = category.plans;
  const visible = plans.slice(0, visibleCount);
  const hasMore = plans.length > visibleCount;

  const reorderDisabled = Boolean(searchActive);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-neutral-800"
            aria-label={collapsed ? "Expand category" : "Collapse category"}
            aria-expanded={!collapsed}
          >
            <AtlasIcon
              name="chevron-down"
              aria-hidden="true"
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "-rotate-90"
              )}
            />
          </button>
          <CardTitle className="text-base">{category.name}</CardTitle>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {plans.length} plan{plans.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="relative flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddPlan(category.id)}
            aria-label={`Add plan to ${category.name}`}
          >
            <AtlasIcon name="plus" aria-hidden="true" className="h-4 w-4" />
            <span className="ml-1 text-xs">Plan</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            aria-label={`Category actions for ${category.name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <AtlasIcon name="more" aria-hidden="true" className="h-4 w-4" />
          </Button>

          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                tabIndex={-1}
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-30 cursor-default"
              />
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-1 w-44 rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={disableMoveUp || reorderDisabled}
                  onClick={() => {
                    onMoveCategory(category.id, "up");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-neutral-800"
                >
                  <AtlasIcon
                    name="arrow-up"
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                  Move up
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={disableMoveDown || reorderDisabled}
                  onClick={() => {
                    onMoveCategory(category.id, "down");
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-neutral-800"
                >
                  <AtlasIcon
                    name="arrow-down"
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                  Move down
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onEditCategory(category);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <AtlasIcon
                    name="edit"
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                  Rename
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onDeleteCategory(category);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-danger-600 hover:bg-danger-50 dark:text-danger-400 dark:hover:bg-danger-900/30"
                >
                  <AtlasIcon
                    name="trash"
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              No plans in this category yet.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">
                    Plans in {category.name}
                  </caption>
                  <thead>
                    <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                      <th scope="col" className="w-8">
                        <span className="sr-only">Select</span>
                      </th>
                      <th scope="col" className="py-2">
                        Plan
                      </th>
                      <th scope="col" className="py-2">
                        Description
                      </th>
                      <th scope="col" className="py-2">
                        Validity
                      </th>
                      <th scope="col" className="py-2">
                        Type
                      </th>
                      <th scope="col" className="py-2">
                        Price
                      </th>
                      <th scope="col" className="py-2">
                        Margin
                      </th>
                      <th scope="col" className="py-2">
                        Status
                      </th>
                      <th scope="col" className="py-2 pr-2 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((plan, index) => (
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
                        disableMoveUp={index === 0 || reorderDisabled}
                        disableMoveDown={
                          index === visible.length - 1 || reorderDisabled
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {hasMore && (
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((v) => v + PLAN_ROW_PAGE_SIZE)
                    }
                    className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    Show {Math.min(PLAN_ROW_PAGE_SIZE, plans.length - visibleCount)}{" "}
                    more
                  </button>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}