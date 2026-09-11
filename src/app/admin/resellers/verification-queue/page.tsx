"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { mockResellers } from "@/lib/admin/mock/resellers";
import { Reseller } from "@/lib/admin/types/reseller";
import { VerificationDocumentsModal } from "@/components/admin/shared/verification-documents-modal";

export default function ResellerVerificationQueuePage() {
  const [resellers, setResellers] = useState<Reseller[]>(
    mockResellers.filter(r => r.verificationStatus === "pending")
  );
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);

  const handleVerify = (id: string) => {
    setResellers(prev => prev.map(r => r.id === id ? { ...r, verificationStatus: "verified" } : r));
  };

  const handleReject = (id: string) => {
    setResellers(prev => prev.map(r => r.id === id ? { ...r, verificationStatus: "rejected" } : r));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller Verification Queue"
        description="Review and approve pending reseller verification requests."
      />

      {resellers.length === 0 ? (
        <Card><CardContent>No pending verification requests.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {resellers.map(reseller => (
            <Card key={reseller.id}>
              <CardContent className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-lg">{reseller.businessName}</p>
                  <p className="text-sm text-neutral-500">{reseller.contactPerson}</p>
                  <p className="text-sm text-neutral-500">{reseller.email}</p>
                  <Badge variant="warning">Pending Verification</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setSelectedReseller(reseller)}>View Documents</Button>
                  <Button size="sm" variant="outline" onClick={() => handleVerify(reseller.id)}>Approve</Button>
                  <Button size="sm" variant="outline" className="text-danger-600" onClick={() => handleReject(reseller.id)}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedReseller && (
        <VerificationDocumentsModal
          entityName={selectedReseller.businessName}
          onClose={() => setSelectedReseller(null)}
        />
      )}
    </div>
  );
}