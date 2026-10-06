"use client";

import type { CustomerThreadRow } from "@/lib/merchant/support/types";
import { ThreadRow } from "./thread-row";
import { ThreadCard } from "./thread-card";

interface ThreadListProps {
  threads: CustomerThreadRow[];
  activeId: string | null;
  onOpen: (id: string) => void;
}

export function ThreadList({ threads, activeId, onOpen }: ThreadListProps) {
  return (
    <>
      <ul
        role="list"
        className="hidden max-h-[600px] divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800 lg:block"
      >
        {threads.map((thread) => (
          <ThreadRow
            key={thread.id}
            thread={thread}
            isActive={thread.id === activeId}
            onOpen={onOpen}
          />
        ))}
      </ul>

      <ul role="list" className="space-y-3 lg:hidden">
        {threads.map((thread) => (
          <li key={thread.id}>
            <ThreadCard thread={thread} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </>
  );
}