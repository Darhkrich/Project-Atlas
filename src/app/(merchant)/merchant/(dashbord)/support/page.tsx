/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStorefrontConfig } from "@/contexts/storefront-config-context";
import { useCurrentMerchant } from "@/lib/merchant/hooks/use-current-merchant";
import { useMerchantTickets } from "@/lib/merchant/support/use-merchant-tickets";
import { useMerchantThreads } from "@/lib/merchant/support/use-merchant-threads";
import {
  createTicket,
  seedTicketsForStore,
} from "@/lib/merchant/support/ticket-mutations";
import { seedThreadsForStore } from "@/lib/merchant/support/thread-mutations";
import type { MerchantTicketCategory } from "@/lib/merchant/support/types";
import type { SupportTab } from "@/components/merchant/support/support-tab-nav";
import { SupportTabNav } from "@/components/merchant/support/support-tab-nav";
import { SupportEmptyState } from "@/components/merchant/support/support-empty-state";
import { TicketList } from "@/components/merchant/support/ticket-list";
import { TicketDetailPanel } from "@/components/merchant/support/ticket-detail-panel";
import { TicketCreateModal } from "@/components/merchant/support/ticket-create-modal";
import { ThreadList } from "@/components/merchant/support/thread-list";
import { ThreadDetailPanel } from "@/components/merchant/support/thread-detail-panel";
import { HelpArticlesPanel } from "@/components/merchant/support/help-articles-panel";
import { AtlasIcon } from "@/components/atlas/icons";
import { SUPPORT_SUBTITLE } from "@/lib/merchant/support/labels";

function parseTab(raw: string | null): SupportTab {
  return raw === "messages" ? "messages" : "tickets";
}

export default function MerchantSupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storefrontConfig } = useStorefrontConfig();
  const merchant = useCurrentMerchant();

  const storeSlug = storefrontConfig.slug || "my-store";
  const authorName = merchant?.name ?? "Merchant";

  const ticketsApi = useMerchantTickets(storeSlug);
  const threadsApi = useMerchantThreads(storeSlug);

  const activeTab = parseTab(searchParams.get("tab"));
  const openId = searchParams.get("open");

  const [createOpen, setCreateOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const showFlash = useCallback((message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 4000);
  }, []);

  const setTab = (tab: SupportTab) => {
    const url = new URL(window.location.href);
    if (tab === "tickets") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", tab);
    }
    url.searchParams.delete("open");
    window.history.replaceState({}, "", url.toString());
    router.refresh();
  };

  const setOpenId = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) {
      url.searchParams.set("open", id);
    } else {
      url.searchParams.delete("open");
    }
    window.history.replaceState({}, "", url.toString());
    router.refresh();
  };

  useEffect(() => {
    if (!openId) return;
    if (activeTab === "tickets") {
      const exists = ticketsApi.tickets.some((t) => t.id === openId);
      if (!exists) setOpenId(null);
    } else {
      const exists = threadsApi.threads.some((t) => t.id === openId);
      if (!exists) setOpenId(null);
    }
  }, [activeTab, openId, ticketsApi.tickets, threadsApi.threads]);

  const activeTicket = useMemo(
    () =>
      activeTab === "tickets" && openId
        ? ticketsApi.tickets.find((t) => t.id === openId) ?? null
        : null,
    [activeTab, openId, ticketsApi.tickets]
  );

  const activeThread = useMemo(
    () =>
      activeTab === "messages" && openId
        ? threadsApi.threads.find((t) => t.id === openId) ?? null
        : null,
    [activeTab, openId, threadsApi.threads]
  );

  const handleCreateTicket = (input: {
    subject: string;
    category: MerchantTicketCategory | "";
    body: string;
  }) => {
    const result = createTicket({
      storeSlug,
      subject: input.subject,
      category: input.category,
      body: input.body,
      authorName,
    });
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    if (result.ticketId) setOpenId(result.ticketId);
    showFlash("Request sent to Atlas.");
    return { ok: true };
  };

  const handleSeedTickets = () => {
    const result = seedTicketsForStore(storeSlug);
    if (!result.ok) {
      showFlash(result.error ?? "Could not load samples.");
      return;
    }
    showFlash("Sample tickets loaded.");
  };

  const handleSeedThreads = () => {
    const result = seedThreadsForStore(storeSlug);
    if (!result.ok) {
      showFlash(result.error ?? "Could not load samples.");
      return;
    }
    showFlash("Sample messages loaded.");
  };

  const tabBadgeTickets =
    ticketsApi.summary.openTicketCount +
    ticketsApi.summary.waitingOnAtlasCount;
  const tabBadgeMessages = threadsApi.summary.unreadMessageCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          Support
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {SUPPORT_SUBTITLE}
        </p>
      </div>

      {flash && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800 dark:border-success-900 dark:bg-success-900/30 dark:text-success-200"
        >
          <AtlasIcon
            name="check-circle"
            className="h-4 w-4"
            aria-hidden="true"
          />
          {flash}
        </div>
      )}

      <SupportTabNav
        active={activeTab}
        onChange={setTab}
        ticketBadgeCount={tabBadgeTickets}
        messageBadgeCount={tabBadgeMessages}
      />

      <div
        role="tabpanel"
        id={"support-panel-" + activeTab}
        aria-labelledby={"support-tab-" + activeTab}
      >
        {activeTab === "tickets" && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Requests
                </p>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  <AtlasIcon
                    name="add"
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                  New
                </button>
              </div>
              {ticketsApi.rows.length === 0 ? (
                <SupportEmptyState
                  variant="tickets"
                  onPrimaryAction={() => setCreateOpen(true)}
                  onSeed={handleSeedTickets}
                />
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                  <TicketList
                    tickets={ticketsApi.rows}
                    activeId={openId}
                    onOpen={setOpenId}
                  />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="hidden h-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:block">
                {activeTicket ? (
                  <TicketDetailPanel
                    storeSlug={storeSlug}
                    ticket={activeTicket}
                    authorName={authorName}
                    onBack={() => setOpenId(null)}
                  />
                ) : (
                  <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <AtlasIcon
                        name="send"
                        className="h-5 w-5 text-neutral-400"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                      Select a request to view the thread.
                    </p>
                  </div>
                )}
              </div>

              {activeTicket && (
                <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-white dark:bg-neutral-900 lg:hidden">
                  <TicketDetailPanel
                    storeSlug={storeSlug}
                    ticket={activeTicket}
                    authorName={authorName}
                    onBack={() => setOpenId(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="min-w-0">
              <div className="mb-3">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Conversations
                </p>
              </div>
              {threadsApi.rows.length === 0 ? (
                <SupportEmptyState
                  variant="threads"
                  onSeed={handleSeedThreads}
                />
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                  <ThreadList
                    threads={threadsApi.rows}
                    activeId={openId}
                    onOpen={setOpenId}
                  />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="hidden h-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:block">
                {activeThread ? (
                  <ThreadDetailPanel
                    storeSlug={storeSlug}
                    thread={activeThread}
                    authorName={authorName}
                    onBack={() => setOpenId(null)}
                  />
                ) : (
                  <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <AtlasIcon
                        name="message-square"
                        className="h-5 w-5 text-neutral-400"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
                      Select a conversation to view the thread.
                    </p>
                  </div>
                )}
              </div>

              {activeThread && (
                <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-white dark:bg-neutral-900 lg:hidden">
                  <ThreadDetailPanel
                    storeSlug={storeSlug}
                    thread={activeThread}
                    authorName={authorName}
                    onBack={() => setOpenId(null)}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <HelpArticlesPanel />

      <TicketCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  );
}