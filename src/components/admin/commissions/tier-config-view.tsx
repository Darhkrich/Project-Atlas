"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { mockResellerTiers } from "@/lib/admin/mock/commissions";
import { ResellerTier } from "@/lib/admin/types/commission";

export function TierConfigView() {
  const [tiers, setTiers] = useState<ResellerTier[]>(mockResellerTiers);
  const [editingTier, setEditingTier] = useState<ResellerTier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSaveTier = (tier: ResellerTier) => {
    if (tier.id) {
      setTiers((prev) => prev.map((t) => (t.id === tier.id ? tier : t)));
    } else {
      tier.id = `TIER-${Date.now()}`;
      setTiers((prev) => [...prev, tier]);
    }
    setEditingTier(null);
  };

  const handleDeleteTier = (id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
    setConfirmDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reseller Tiers</CardTitle>
        <Button
          size="sm"
          onClick={() =>
            setEditingTier({
              id: "",
              name: "New Tier",
              minMonthlySales: 0,
              extraCutPercent: 25,
              baseCommissionRates: {
                data: 0.4,
                airtime: 2,
                bills: 3,
                tv: 3,
                exam_pins: 3,
                other: 3,
              },
              perks: [],
            })
          }
        >
          Add Tier
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="flex items-start justify-between rounded-md border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{tier.name}</span>
                  <Badge variant="info">
                    Min Sales: {tier.minMonthlySales}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Extra Cut: {tier.extraCutPercent}% · Base Data:{" "}
                  {tier.baseCommissionRates.data} GHS · Airtime:{" "}
                  {tier.baseCommissionRates.airtime}%
                </p>
                <p className="text-xs text-neutral-500">
                  Perks: {tier.perks.join(", ") || "None"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingTier(tier)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger-600"
                  onClick={() => setConfirmDelete(tier.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {/* Editor modal */}
      {editingTier && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditingTier(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">
              {editingTier.id ? "Edit Tier" : "Add Tier"}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-neutral-500">Tier Name</label>
                <Input
                  value={editingTier.name}
                  onChange={(e) =>
                    setEditingTier({ ...editingTier, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">
                  Min Monthly Sales (GHS)
                </label>
                <Input
                  type="number"
                  value={editingTier.minMonthlySales}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      minMonthlySales: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">
                  Extra Cut % (Atlas share)
                </label>
                <Input
                  type="number"
                  value={editingTier.extraCutPercent}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      extraCutPercent: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">
                  Base Data Commission (GHS)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={editingTier.baseCommissionRates.data}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      baseCommissionRates: {
                        ...editingTier.baseCommissionRates,
                        data: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">
                  Airtime Commission (%)
                </label>
                <Input
                  type="number"
                  value={editingTier.baseCommissionRates.airtime}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      baseCommissionRates: {
                        ...editingTier.baseCommissionRates,
                        airtime: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">
                  Bills Commission (%)
                </label>
                <Input
                  type="number"
                  value={editingTier.baseCommissionRates.bills}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      baseCommissionRates: {
                        ...editingTier.baseCommissionRates,
                        bills: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">
                  Perks (comma separated)
                </label>
                <Input
                  value={editingTier.perks.join(", ")}
                  onChange={(e) =>
                    setEditingTier({
                      ...editingTier,
                      perks: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingTier(null)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={() => handleSaveTier(editingTier)}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Confirm Delete Tier"
        description="Are you sure you want to delete this tier? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => confirmDelete && handleDeleteTier(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </Card>
  );
}