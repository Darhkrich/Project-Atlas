"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: "bonus_commission" | "cashback" | "discount";
  value: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "expired";
}

const mockPromotions: Promotion[] = [
  {
    id: "PROMO-001",
    name: "Double Commission Weekend",
    description: "Earn double commission on all data sales",
    type: "bonus_commission",
    value: 10,
    startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: "active",
  },
  {
    id: "PROMO-002",
    name: "Reseller Cashback",
    description: "5% cashback on monthly commission earnings",
    type: "cashback",
    value: 5,
    startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 35).toISOString(),
    status: "scheduled",
  },
];

export default function ResellerPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller Promotions"
        description="Create and manage incentives for resellers."
        actions={<Button size="sm" onClick={() => setShowAdd(true)}>New Promotion</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.map(promo => (
          <Card key={promo.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{promo.name}</CardTitle>
              <Badge variant={promo.status === "active" ? "success" : promo.status === "scheduled" ? "warning" : "neutral"}>
                {promo.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-500">{promo.description}</p>
              <p className="mt-2 text-sm">Type: {promo.type}</p>
              <p className="text-sm">Value: {promo.value}%</p>
              <p className="text-xs text-neutral-500 mt-2">
                {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
              </p>
              <Button variant="ghost" size="sm" className="text-danger-600 mt-2" onClick={() => setConfirmDelete(promo.id)}>Delete</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">New Promotion</h3>
            <div className="mt-4 space-y-3">
              <Input placeholder="Name" />
              <Input placeholder="Description" />
              <select className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm">
                <option>Bonus Commission</option>
                <option>Cashback</option>
                <option>Discount</option>
              </select>
              <Input type="number" placeholder="Value (%)" />
              <div className="flex gap-2">
                <Input type="date" placeholder="Start Date" />
                <Input type="date" placeholder="End Date" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setShowAdd(false)}>Create</Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Confirm Delete Promotion"
        description="Are you sure you want to delete this promotion?"
        confirmLabel="Delete"
        danger
        onConfirm={() => handleDelete(confirmDelete!)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}