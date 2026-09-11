"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { mockSubscriptionPlanPricing } from "@/lib/admin/mock/pricing";
import { SubscriptionPlanPricing } from "@/lib/admin/types/pricing";
import { formatCurrency } from "@/lib/admin/formatters";

export function SubscriptionPlansView() {
  const [plans, setPlans] = useState(mockSubscriptionPlanPricing);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanPricing | null>(null);

  const handleSavePlan = (plan: SubscriptionPlanPricing) => {
    setPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
    setEditingPlan(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map(plan => (
        <Card key={plan.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{plan.name}</CardTitle>
            <Badge variant={plan.status === "active" ? "success" : "neutral"}>{plan.status}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(plan.priceMonthly)}/mo</p>
            <p className="text-sm text-neutral-500">{formatCurrency(plan.priceAnnual)}/yr</p>
            <ul className="mt-2 space-y-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="text-sm">{feature}</li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setEditingPlan(plan)}>Edit</Button>
          </CardContent>
        </Card>
      ))}

      {editingPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingPlan(null)} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Edit {editingPlan.name} Plan</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm">Monthly Price (GHS)</label>
                <Input type="number" value={editingPlan.priceMonthly} onChange={e => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Annual Price (GHS)</label>
                <Input type="number" value={editingPlan.priceAnnual} onChange={e => setEditingPlan({ ...editingPlan, priceAnnual: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Status</label>
                <select
                  className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={editingPlan.status}
                  onChange={e => setEditingPlan({ ...editingPlan, status: e.target.value as "active" | "inactive" })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingPlan(null)}>Cancel</Button>
              <Button size="sm" onClick={() => handleSavePlan(editingPlan)}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}