"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SecuritySummaryCards } from "@/components/admin/security/security-summary-cards";
import { SecurityStatusBanner } from "@/components/admin/security/security-status-banner";
import { SecurityAlertsSection } from "@/components/admin/security/security-alerts-section";
import { SecurityEventsTable } from "@/components/admin/security/security-events-table";
import { SessionsAndIPs } from "@/components/admin/security/sessions-and-ips";
import { BulkIPBlock } from "@/components/admin/security/bulk-ip-block";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { mockSecurityEvents } from "@/lib/admin/mock/security";

export default function SecurityCenterPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredEvents = mockSecurityEvents.filter(e => {
    if (search && !e.user.toLowerCase().includes(search.toLowerCase()) &&
        !e.ip.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter && e.type !== typeFilter) return false;
    return true;
  });

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    console.log(`Export security data as ${format}`);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Security Center"
        description="Monitor security posture, events, and active sessions."
        actions={<ExportMenu onExport={handleExport} />}
      />

      <SecurityStatusBanner />
      <SecuritySummaryCards />
      <SecurityAlertsSection />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search events..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All Event Types</option>
          <option value="login_failure">Login Failure</option>
          <option value="suspicious_activity">Suspicious Activity</option>
          <option value="password_change">Password Change</option>
          <option value="role_change">Role Change</option>
          <option value="wallet_adjustment">Wallet Adjustment</option>
          <option value="ip_blocked">IP Blocked</option>
        </select>
      </div>

      <SecurityEventsTable events={filteredEvents} />

      <BulkIPBlock />

      <SessionsAndIPs />
    </div>
  );
}