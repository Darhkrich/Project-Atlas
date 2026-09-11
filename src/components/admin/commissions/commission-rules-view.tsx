"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockCommissionRules } from "@/lib/admin/mock/commissions";
import { CommissionRule } from "@/lib/admin/types/commission";

export function CommissionRulesView() {
  const [rules, setRules] = useState<CommissionRule[]>(mockCommissionRules);
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSave = (rule: CommissionRule) => {
    if (rule.id) {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? rule : r)));
    } else {
      setRules((prev) => [...prev, { ...rule, id: `RULE-${Date.now()}` }]);
    }
    setShowEditor(false);
    setEditingRule(null);
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    setConfirmDelete(null);
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commission Rules</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setEditingRule({
              id: "",
              name: "",
              description: "",
              value: "",
              enabled: true,
            });
            setShowEditor(true);
          }}
        >
          Add Rule
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex items-start justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{rule.name}</p>
                <p className="text-xs text-neutral-500">{rule.description}</p>
                <p className="mt-1 text-xs font-semibold">{rule.value}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={rule.enabled ? "success" : "neutral"}>
                  {rule.enabled ? "Enabled" : "Disabled"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRule(rule);
                    setShowEditor(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleRule(rule.id)}
                >
                  {rule.enabled ? "Disable" : "Enable"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-600"
                  onClick={() => setConfirmDelete(rule.id)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>

      {/* Editor modal */}
      {showEditor && editingRule && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowEditor(false)}
          />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">
              {editingRule.id ? "Edit Rule" : "Add Rule"}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-neutral-500">Name</label>
                <Input
                  value={editingRule.name}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Description</label>
                <Input
                  value={editingRule.description}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">
                  Value (e.g., 25% or 0.4 GHS)
                </label>
                <Input
                  value={editingRule.value}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, value: e.target.value })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editingRule.enabled}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4"
                />
                Enabled
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleSave(editingRule)}>
                Save
              </Button>
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
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </Card>
  );
}