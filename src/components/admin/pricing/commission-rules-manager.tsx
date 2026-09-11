"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { CommissionRuleConfig } from "@/lib/admin/types/pricing";
import { mockCommissionRulesConfig } from "@/lib/admin/mock/pricing";

export function CommissionRulesManager() {
  const [rules, setRules] = useState<CommissionRuleConfig[]>(mockCommissionRulesConfig);
  const [editingRule, setEditingRule] = useState<CommissionRuleConfig | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSaveRule = (rule: CommissionRuleConfig) => {
    if (rule.id) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    } else {
      rule.id = `RULE-${Date.now()}`;
      setRules(prev => [...prev, rule]);
    }
    setEditingRule(null);
    setShowAddRule(false);
  };

  const handleDelete = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    setConfirmDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commission Rules</CardTitle>
        <Button size="sm" onClick={() => setShowAddRule(true)}>Add Rule</Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700">
              <div>
                <p className="text-sm font-medium">{rule.name}</p>
                <p className="text-xs text-neutral-500">{rule.description}</p>
                <p className="text-xs font-semibold">{rule.value}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={rule.enabled ? "success" : "neutral"}>{rule.enabled ? "Enabled" : "Disabled"}</Badge>
                <Button variant="outline" size="sm" onClick={() => setEditingRule(rule)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-danger-600" onClick={() => setConfirmDelete(rule.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Edit/Add Modal */}
      {(editingRule || showAddRule) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setEditingRule(null); setShowAddRule(false); }} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">{editingRule ? "Edit Rule" : "Add Rule"}</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm">Name</label>
                <Input value={editingRule?.name || ""} onChange={e => setEditingRule(prev => ({ ...prev!, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm">Description</label>
                <Input value={editingRule?.description || ""} onChange={e => setEditingRule(prev => ({ ...prev!, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm">Value</label>
                <Input value={editingRule?.value || ""} onChange={e => setEditingRule(prev => ({ ...prev!, value: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editingRule?.enabled || false} onChange={e => setEditingRule(prev => ({ ...prev!, enabled: e.target.checked }))} />
                Enabled
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingRule(null); setShowAddRule(false); }}>Cancel</Button>
              <Button size="sm" onClick={() => handleSaveRule(editingRule!)}>Save</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Confirm Delete"
        description="Are you sure you want to delete this rule?"
        confirmLabel="Delete"
        danger
        onConfirm={() => handleDelete(confirmDelete!)}
        onCancel={() => setConfirmDelete(null)}
      />
    </Card>
  );
}