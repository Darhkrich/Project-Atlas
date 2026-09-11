"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

export function BulkIPBlock() {
  const [ipList, setIpList] = useState("");
  const [reason, setReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBlock = () => {
    const ips = ipList.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    console.log("Blocking IPs:", ips, "Reason:", reason);
    setIpList("");
    setReason("");
    setShowConfirm(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Bulk IP Block</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm">IP Addresses (one per line or comma separated)</label>
          <textarea
            className="mt-1 w-full rounded-md border border-neutral-300 p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
            rows={4}
            value={ipList}
            onChange={e => setIpList(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm">Reason</label>
          <Input
            placeholder="Reason for blocking"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => setShowConfirm(true)}>Block IPs</Button>
      </CardContent>

      <ConfirmDialog
        open={showConfirm}
        title="Confirm Bulk IP Block"
        description={`Block ${ipList.split(/[\n,]+/).filter(Boolean).length} IP address(es)?`}
        confirmLabel="Block"
        danger
        onConfirm={handleBlock}
        onCancel={() => setShowConfirm(false)}
      />
    </Card>
  );
}