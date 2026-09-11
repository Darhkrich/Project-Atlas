"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Card, CardContent } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { SupportTicketDetailDrawer } from "@/components/admin/ecommerce/support-ticket-detail-drawer";
import { mockEcommerceSupportTickets } from "@/lib/admin/mock/ecommerce-support";
import { EcommerceSupportTicket } from "@/lib/admin/types/ecommerce-support";

const statusVariantMap = {
  open: "warning",
  pending: "info",
  resolved: "success",
  closed: "neutral",
} as const;

const priorityVariantMap = {
  low: "neutral",
  medium: "info",
  high: "warning",
  urgent: "danger",
} as const;

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()} ${d.getUTCHours()}:${d.getUTCMinutes()}`;
}

export default function EcommerceSupportPage() {
  const [tickets, setTickets] = useState<EcommerceSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<EcommerceSupportTicket | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setTickets(mockEcommerceSupportTickets);
      setLoading(false);
    }, 500);
  }, []);

  const filtered = tickets.filter(t => {
    if (search && !t.merchantName.toLowerCase().includes(search.toLowerCase()) &&
        !t.subject.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
    return true;
  });

  const handleRespond = (ticketId: string, message: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== ticketId) return t;
      const newMsg = {
        id: `MSG-${Date.now()}`,
        sender: "admin" as const,
        message,
        timestamp: new Date().toISOString(),
      };
      return { ...t, messages: [...t.messages, newMsg], updatedAt: new Date().toISOString() };
    }));
    setSelectedTicket(prev => {
      if (!prev || prev.id !== ticketId) return prev;
      const newMsg = {
        id: `MSG-${Date.now()}`,
        sender: "admin" as const,
        message,
        timestamp: new Date().toISOString(),
      };
      return { ...prev, messages: [...prev.messages, newMsg], updatedAt: new Date().toISOString() };
    });
  };

  const handleResolve = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: "resolved", updatedAt: new Date().toISOString() } : t));
    setSelectedTicket(prev => prev && prev.id === ticketId ? { ...prev, status: "resolved", updatedAt: new Date().toISOString() } : prev);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="E-commerce Support"
        description="Manage support tickets from merchants."
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search tickets..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <Card><CardContent>No tickets found.</CardContent></Card>
          ) : (
            filtered.map(ticket => (
              <Card key={ticket.id}>
                <CardContent className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="text-sm text-neutral-500">{ticket.merchantName} · {ticket.category}</p>
                    <div className="mt-1 flex gap-2">
                      <Badge variant={statusVariantMap[ticket.status]}>{ticket.status}</Badge>
                      <Badge variant={priorityVariantMap[ticket.priority]}>{ticket.priority}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">Updated: {formatTimestamp(ticket.updatedAt)}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedTicket(ticket)}>View</Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <SupportTicketDetailDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onRespond={handleRespond}
        onResolve={handleResolve}
      />
    </div>
  );
}