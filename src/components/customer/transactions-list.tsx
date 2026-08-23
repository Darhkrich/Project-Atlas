/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";

/* eslint-disable @next/next/no-img-element */

type TransactionStatus = "Successful" | "Failed";

type Transaction = {
  id: string;
  service: string;
  category: string;
  details: string;
  amount: string;
  date: string;
  status: TransactionStatus;
  statusVariant: "success" | "danger";
  image?: string;
  icon?: AtlasIconName;
  iconBg?: string;
};

const mockTransactions: Transaction[] = [
  {
    id: "tx1",
    service: "MTN Data 50GB",
    category: "Data",
    details: "024 123 4567",
    amount: "- GHS 25.00",
    date: "Mar 13, 09:45 AM",
    status: "Successful",
    statusVariant: "success",
    image: "/mtn1.png",
  },
  {
    id: "tx2",
    service: "Telecel Airtime",
    category: "Airtime",
    details: "024 123 4567",
    amount: "- GHS 10.00",
    date: "Mar 13, 09:30 AM",
    status: "Successful",
    statusVariant: "success",
    image: "/telecel1.jpg",
  },
  {
    id: "tx3",
    service: "ECG Token",
    category: "Electricity",
    details: "Meter: 1234567890",
    amount: "- GHS 60.00",
    date: "Mar 12, 08:15 PM",
    status: "Successful",
    statusVariant: "success",
    image: "/ecg.png",
  },
  {
    id: "tx4",
    service: "DSTV Compact",
    category: "Cable TV",
    details: "Smartcard: 1234567890",
    amount: "- GHS 120.00",
    date: "Mar 12, 05:40 PM",
    status: "Successful",
    statusVariant: "success",
    image: "/dstv1.jpg",
  },
  {
    id: "tx5",
    service: "Wallet Funding",
    category: "Wallet",
    details: "MTN Mobile Money",
    amount: "+ GHS 200.00",
    date: "Mar 12, 04:20 PM",
    status: "Successful",
    statusVariant: "success",
    icon: "wallet",
    iconBg: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "tx6",
    service: "Telecel Airtime",
    category: "Airtime",
    details: "055 987 6543",
    amount: "- GHS 20.00",
    date: "Mar 12, 02:10 PM",
    status: "Failed",
    statusVariant: "danger",
    image: "/telecel1.jpg",
  },
  {
    id: "tx7",
    service: "Glo Data 20GB",
    category: "Data",
    details: "055 987 6543",
    amount: "- GHS 15.00",
    date: "Mar 11, 11:50 AM",
    status: "Successful",
    statusVariant: "success",
    image: "/glo.png",
  },
];

const statusFilters = [
  { id: "all", label: "All Transactions" },
  { id: "successful", label: "Successful" },
  { id: "failed", label: "Failed" },
];

export function TransactionsList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeStatus, setActiveStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const perPage = 7;

  const loadData = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const statusMatch =
        activeStatus === "all" ||
        (activeStatus === "successful" && tx.status === "Successful") ||
        (activeStatus === "failed" && tx.status === "Failed");

      const searchMatch =
        !searchQuery.trim() ||
        tx.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.details.toLowerCase().includes(searchQuery.toLowerCase());

      let dateMatch = true;
      if (startDate && endDate) {
        const txDate = new Date(tx.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        dateMatch = txDate >= start && txDate <= end;
      }

      return statusMatch && searchMatch && dateMatch;
    });
  }, [transactions, activeStatus, searchQuery, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / perPage));
  const paginated = filteredTransactions.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  );

  const dateRangeLabel =
    startDate && endDate
      ? `${formatDate(startDate)} - ${formatDate(endDate)}`
      : "Select date range";

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-12 w-full" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <AtlasSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <AtlasErrorState onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <AtlasCard padding="none">
        <div className="p-4 sm:p-6">
          {/* Filter Controls Bar */}
          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <select
              value={activeStatus}
              onChange={(e) => {
                setActiveStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              {statusFilters.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>

            <div className="relative">
              <button
                onClick={() => setShowDatePicker((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <span>{dateRangeLabel}</span>
                <AtlasIcon name="arrow-right" className="h-4 w-4 rotate-90 text-neutral-400" />
              </button>

              {showDatePicker && (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-900 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                          setCurrentPage(1);
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setCurrentPage(1);
                          setShowDatePicker(false);
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <AtlasIcon
                name="search"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search transaction..."
                className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-500 focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-400"
              />
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr] gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400 md:grid">
            <span>Service</span>
            <span>Details</span>
            <span>Amount</span>
            <span>Date &amp; Time</span>
            <span>Status</span>
          </div>

          {/* Table Rows */}
          {paginated.length > 0 ? (
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {paginated.map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr] md:items-center"
                >
                  {/* Service with logo/image and category */}
                  <div className="flex items-center gap-3">
                    {tx.image ? (
                      <img
                        src={tx.image}
                        alt={tx.service}
                        className="h-10 w-10 rounded-lg object-contain bg-white p-0.5"
                      />
                    ) : (
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tx.iconBg}`}
                      >
                        <AtlasIcon
                          name={tx.icon || "grid"}
                          className="h-5 w-5 text-neutral-700 dark:text-neutral-200"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {tx.service}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {tx.category}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {tx.details}
                  </span>

                  {/* Amount */}
                  <span
                    className={`text-sm font-semibold ${
                      tx.amount.startsWith("+")
                        ? "text-success-600 dark:text-success-400"
                        : "text-neutral-900 dark:text-neutral-100"
                    }`}
                  >
                    {tx.amount}
                  </span>

                  {/* Date & Time */}
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {tx.date}
                  </span>

                  {/* Status */}
                  <AtlasBadge variant={tx.statusVariant}>{tx.status}</AtlasBadge>
                </div>
              ))}
            </div>
          ) : (
            <AtlasEmptyState
              title="No transactions found"
              description="Try adjusting your filters or search query."
            />
          )}
        </div>

        {/* Footer / Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-neutral-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing{" "}
              {Math.min((currentPage - 1) * perPage + 1, filteredTransactions.length)}{" "}
              to {Math.min(currentPage * perPage, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} transactions
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </Button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100"
                        : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                &gt;
              </Button>
            </div>
          </div>
        )}
      </AtlasCard>
    </div>
  );
}