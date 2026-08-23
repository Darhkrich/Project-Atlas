"use client";

import { useState } from "react";
import { ResellerPageHeader } from "@/components/reseller/reseller-page-header";
import { ServicesClient } from "@/components/services/ServicesClient";
import { AtlasAlert } from "@/components/atlas/alert";
import { useReseller } from "@/contexts/ResellerContext";

export default function ResellerBuyForCustomerPage() {
  const [alert, setAlert] = useState<string | null>(null);
  const { completeResellerPurchase } = useReseller();

  const handleOrderComplete = (order: {
    service: string;
    plan: string;
    recipient: string;
    amount: number;
    customerName?: string;
  }) => {
    completeResellerPurchase(order);
    setAlert(
      `Order for ${order.service} (${order.plan}) completed. Commission added to your earnings.`,
    );
  };

  return (
    <>
      <ResellerPageHeader
        title="Buy for Customer"
        description="Manually purchase a service for a customer using your reseller wallet."
      />
      {alert && <AtlasAlert variant="success">{alert}</AtlasAlert>}
      <ServicesClient
        resellerMode
        onResellerOrderComplete={handleOrderComplete}
      />
    </>
  );
}