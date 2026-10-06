"use client";

import type { MerchantTicketRow } from "@/lib/merchant/support/types";
import { TicketRow } from "./ticket-row";
import { TicketCard } from "./ticket-card";

interface TicketListProps {
  tickets: MerchantTicketRow[];
  activeId: string | null;
  onOpen: (id: string) => void;
}

export function TicketList({ tickets, activeId, onOpen }: TicketListProps) {
  return (
    <>
      <ul
        role="list"
        className="hidden max-h-[600px] divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800 lg:block"
      >
        {tickets.map((ticket) => (
          <TicketRow
            key={ticket.id}
            ticket={ticket}
            isActive={ticket.id === activeId}
            onOpen={onOpen}
          />
        ))}
      </ul>

      <ul role="list" className="space-y-3 lg:hidden">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <TicketCard ticket={ticket} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </>
  );
}