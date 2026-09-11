/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { mockResellers } from "@/lib/admin/mock/resellers";
import { Reseller } from "@/lib/admin/types/reseller";

interface SupportTicket {
  id: string;
  resellerId: string;
  resellerName: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high" | "urgent";
  updatedAt: string;
}

const mockTickets: SupportTicket[] = [
  {
    id: "TKT-1001",
    resellerId: "RS-001",
    resellerName: "Kwame Store",
    subject: "Commission not credited for order ATX-983821",
    status: "open",
    priority: "high",
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "TKT-1002",
    resellerId: "RS-002",
    resellerName: "Adjoa Ventures",
    subject: "Storefront template not applying correctly",
    status: "pending",
    priority: "medium",
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "TKT-1003",
    resellerId: "RS-004",
    resellerName: "Efua Trading",
    subject: "Unable to withdraw commission wallet",
    status: "open",
    priority: "urgent",
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

const statusVariantMap = {
  open: "warning",
  pending: "info",
  resolved: "success",
} as const;

const priorityVariantMap = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
} as const;

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${mm}/${dd}/${yyyy}, ${hh}:${min}`;
}

export default function ResellerSupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const filtered = tickets.filter(ticket => {
    if (search && !ticket.resellerName.toLowerCase().includes(search.toLowerCase()) &&
        !ticket.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (priorityFilter && ticket.priority !== priorityFilter) return false;
    return true;
  });

  const handleResolve = (id: string) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: "resolved" } : t));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reseller Support Tickets"
        description="Manage support tickets from resellers."
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search tickets..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
        </select>
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card><CardContent>No tickets found.</CardContent></Card>
        ) : (
          filtered.map(ticket => (
            <Card key={ticket.id}>
              <CardContent className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{ticket.subject}</p>
                  <p className="text-sm text-neutral-500">{ticket.resellerName} · {formatTimestamp(ticket.updatedAt)}</p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant={statusVariantMap[ticket.status]}>{ticket.status}</Badge>
                    <Badge variant={priorityVariantMap[ticket.priority]}>{ticket.priority}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {ticket.status !== "resolved" && (
                    <Button size="sm" variant="outline" onClick={() => handleResolve(ticket.id)}>Resolve</Button>
                  )}
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}