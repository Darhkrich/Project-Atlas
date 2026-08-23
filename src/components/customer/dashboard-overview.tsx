/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import {
  mockTransactions,
  mockNotifications,
  mockQuickActions,
  mockPopularServices,
  type MockTransaction,
  type MockNotification,
} from "@/lib/mock-data";

type QuickAction = {
  label: string;
  href: string;
  icon: AtlasIconName;
  bgClass: string;
};

type PopularService = {
  label: string;
  href: string;
  image: string;
};

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [transactions, setTransactions] = useState<MockTransaction[]>([]);
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);

  const loadData = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setTransactions(mockTransactions.slice(0, 5));
      setNotifications(mockNotifications.slice(0, 4));
      setQuickActions(mockQuickActions);
      setPopularServices(mockPopularServices);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AtlasSkeleton className="h-48 w-full" />
            <AtlasSkeleton className="h-64 w-full" />
          </div>
          <div className="space-y-6">
            <AtlasSkeleton className="h-48 w-full" />
            <AtlasSkeleton className="h-48 w-full" />
            <AtlasSkeleton className="h-64 w-full" />
            <AtlasSkeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <AtlasErrorState onRetry={loadData} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Column (Wider) */}
      <div className="space-y-6 lg:col-span-2">
        {/* Wallet Balance Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-800 to-brand-600 p-6 text-white shadow-sm">
          <div className="pointer-events-none absolute bottom-0 right-0 opacity-20">
            <svg className="h-40 w-40" viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <rect x="30" y="60" width="140" height="100" rx="15" fill="white" />
              <rect x="70" y="90" width="60" height="40" rx="5" fill="#0d5a49" />
              <circle cx="100" cy="110" r="8" fill="white" />
              <circle cx="150" cy="130" r="12" fill="#ffa000" />
              <circle cx="160" cy="140" r="10" fill="#ffa000" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-brand-200">Wallet Balance</p>
              <p className="mt-1 text-4xl font-bold tracking-tight">GHS 1,250.75</p>
              <p className="mt-2 text-sm text-brand-300">Available Balance</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/customer/wallet"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50"
              >
                <AtlasIcon name="plus" className="h-4 w-4" />
                Fund Wallet
              </Link>
              <Link
                href="/customer/wallet?mode=withdraw"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                <AtlasIcon name="bank" className="h-4 w-4" />
                Withdraw
              </Link>
            </div>
          </div>
        </div>

        {/* Become a Reseller Banner */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-800 dark:bg-brand-900/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                <AtlasIcon name="store" className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Become a Reseller
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Start your own digital services business and earn commissions.
                </p>
              </div>
            </div>
            <Link
              href="/resellers"
              className="inline-flex items-center justify-center rounded-full bg-brand-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Popular Services */}
        <AtlasCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Popular Services
            </h3>
            <Link
              href="/customer/services"
              className="text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {popularServices.map((service) => (
              <Link
                key={service.label}
                href={service.href}
                className="flex flex-col items-center rounded-lg border border-neutral-100 bg-white p-3 text-center transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <img
                  src={service.image}
                  alt={`${service.label} logo`}
                  className="h-10 w-auto object-contain"
                />
                <span className="mt-2 text-xs font-medium text-neutral-800 dark:text-neutral-100">
                  {service.label}
                </span>
              </Link>
            ))}
          </div>
        </AtlasCard>

        {/* Recent Transactions */}
        <AtlasCard padding="none">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Recent Transactions
            </h3>
            <Link
              href="/customer/transactions"
              className="text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
            >
              View all
            </Link>
          </div>

          <div className="hidden grid-cols-4 gap-4 px-6 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 md:grid">
            <span>Service</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          {transactions.length > 0 ? (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-2 gap-4 px-6 py-3 md:grid-cols-4"
                >
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {tx.service}
                  </span>
                  <span className="text-sm text-neutral-900 dark:text-neutral-100">
                    {tx.amount}
                  </span>
                  <span className="flex items-center">
                    <AtlasBadge variant={tx.statusVariant}>{tx.status}</AtlasBadge>
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {tx.date}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <AtlasEmptyState
              title="No transactions yet"
              description="Your recent transactions will appear here."
            />
          )}
        </AtlasCard>
      </div>

      {/* Right Column (Narrower) */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <AtlasCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Quick Actions
            </h3>
            <Link
              href="/customer/services"
              className="text-sm font-medium text-brand-800 hover:underline dark:text-brand-300"
            >
              See all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center text-center"
              >
                <div
                  className={`mb-2 flex h-14 w-14 items-center justify-center rounded-full ${action.bgClass}`}
                >
                  <AtlasIcon
                    name={action.icon}
                    className="h-6 w-6 text-brand-800 dark:text-brand-300"
                  />
                </div>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </AtlasCard>

        {/* Smart Recommendations */}
        <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm dark:border-brand-800 dark:bg-neutral-950">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Smart Recommendations
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Buy data now and get up to 10% cashback!
              </p>
              <button className="mt-4 inline-flex items-center justify-center rounded-full bg-brand-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-900">
                Claim Now
              </button>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-500/15">
              <AtlasIcon name="gift" className="h-8 w-8 text-accent-600" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <AtlasCard padding="none">
          <div className="mb-3 px-6 pt-4">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Notifications
            </h3>
          </div>
          {notifications.length > 0 ? (
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {notifications.map((notification) => (
                <li key={notification.id} className="flex items-start gap-3 px-6 py-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notification.iconBg}`}
                  >
                    <AtlasIcon
                      name={notification.icon}
                      className="h-4 w-4 text-neutral-700 dark:text-neutral-200"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      {notification.title}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {notification.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <AtlasEmptyState
              title="No notifications"
              description="You're all caught up."
            />
          )}
        </AtlasCard>

        {/* Account Summary */}
        <AtlasCard>
          <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Account Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Account Type
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Personal
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Account Level
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                Level 1
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Account Created
              </span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                May 30, 2024
              </span>
            </div>
          </div>
        </AtlasCard>
      </div>
    </div>
  );
}