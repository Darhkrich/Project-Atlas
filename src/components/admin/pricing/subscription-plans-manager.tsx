/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { subscriptionPlans, SubscriptionPlan, PlanCode } from "@/config/subscription-plans";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

export function SubscriptionPlansManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(subscriptionPlans);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const handleSavePlan = (plan: SubscriptionPlan) => {
    setPlans(prev => prev.map(p => p.code === plan.code ? plan : p));
    setEditingPlan(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {plans.map(plan => (
        <Card key={plan.code}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{plan.name}</CardTitle>
            <Badge variant="info">{plan.code}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{plan.monthlyPrice}<span className="text-sm font-normal text-neutral-500">/mo</span></p>
            <p className="text-sm text-neutral-500">{plan.annualPrice}/yr</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Products: {plan.maxProducts === Infinity ? "Unlimited" : plan.maxProducts}</li>
              <li>Monthly Transactions: {plan.maxMonthlyTransactions}</li>
              <li>Themes: {plan.themes.join(", ")}</li>
              <li>Payment Methods: {plan.paymentMethods.join(", ")}</li>
              <li>Support: {plan.supportLevel}</li>
              <li>Custom Domain: {plan.customDomain ? "Yes" : "No"}</li>
              <li>AI Assistant: {plan.aiAssistant ? "Yes" : "No"}</li>
            </ul>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setEditingPlan(plan)}>Edit</Button>
          </CardContent>
        </Card>
      ))}

      {editingPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditingPlan(null)} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold">Edit {editingPlan.name} Plan</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm">Monthly Price (GHS)</label>
                <Input value={editingPlan.monthlyPrice} onChange={e => setEditingPlan({ ...editingPlan, monthlyPrice: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Annual Price (GHS)</label>
                <Input value={editingPlan.annualPrice} onChange={e => setEditingPlan({ ...editingPlan, annualPrice: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Max Products</label>
                <Input type="number" value={editingPlan.maxProducts === Infinity ? "" : editingPlan.maxProducts} onChange={e => setEditingPlan({ ...editingPlan, maxProducts: e.target.value === "" ? Infinity : Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-sm">Max Monthly Transactions</label>
                <Input value={editingPlan.maxMonthlyTransactions} onChange={e => setEditingPlan({ ...editingPlan, maxMonthlyTransactions: e.target.value })} />
              </div>
              <div>
                <label className="text-sm">Themes (comma separated)</label>
                <Input value={editingPlan.themes.join(", ")} onChange={e => setEditingPlan({ ...editingPlan, themes: e.target.value.split(",").map(s => s.trim()) })} />
              </div>
              <div>
                <label className="text-sm">Payment Methods (comma separated)</label>
                <Input value={editingPlan.paymentMethods.join(", ")} onChange={e => setEditingPlan({ ...editingPlan, paymentMethods: e.target.value.split(",").map(s => s.trim()) })} />
              </div>
              <div>
                <label className="text-sm">Support Level</label>
                <Input value={editingPlan.supportLevel} onChange={e => setEditingPlan({ ...editingPlan, supportLevel: e.target.value })} />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editingPlan.customDomain} onChange={e => setEditingPlan({ ...editingPlan, customDomain: e.target.checked })} />
                  Custom Domain
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editingPlan.subdomain} onChange={e => setEditingPlan({ ...editingPlan, subdomain: e.target.checked })} />
                  Subdomain
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editingPlan.advancedFeatures} onChange={e => setEditingPlan({ ...editingPlan, advancedFeatures: e.target.checked })} />
                  Advanced Features
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editingPlan.aiAssistant ?? false} onChange={e => setEditingPlan({ ...editingPlan, aiAssistant: e.target.checked })} />
                  AI Assistant
                </label>
              </div>
              <div>
                <label className="text-sm">Allowed Templates (comma separated)</label>
                <Input value={editingPlan.allowedTemplates.join(", ")} onChange={e => setEditingPlan({ ...editingPlan, allowedTemplates: e.target.value.split(",").map(s => s.trim()) })} />
              </div>
              <div>
                <label className="text-sm">Domain Options (comma separated)</label>
                <Input value={editingPlan.domainOptions.join(", ")} onChange={e => setEditingPlan({ ...editingPlan, domainOptions: e.target.value.split(",").map(s => s.trim()) })} />
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