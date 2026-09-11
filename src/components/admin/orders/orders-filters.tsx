/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

interface OrderFiltersProps {
  onApplyFilters: (filters: any) => void;
  onReset: () => void;
}

export function OrderFilters({ onApplyFilters, onReset }: OrderFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [network, setNetwork] = useState("");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const activeFilters = [
    { key: "status", value: status, label: `Status: ${status}`, reset: () => setStatus("") },
    { key: "service", value: service, label: `Service: ${service}`, reset: () => setService("") },
    { key: "network", value: network, label: `Network: ${network}`, reset: () => setNetwork("") },
    { key: "source", value: source, label: `Source: ${source}`, reset: () => setSource("") },
    { key: "dateFrom", value: dateFrom, label: `From: ${dateFrom}`, reset: () => setDateFrom("") },
    { key: "dateTo", value: dateTo, label: `To: ${dateTo}`, reset: () => setDateTo("") },
  ].filter((f) => f.value);

  const handleApply = () => {
    onApplyFilters({ search, status, service, network, source, dateFrom, dateTo });
  };

  const handleReset = () => {
    setSearch("");
    setStatus("");
    setService("");
    setNetwork("");
    setSource("");
    setDateFrom("");
    setDateTo("");
    onReset();
  };

  const clearFilter = (resetFn: () => void) => {
    resetFn();
    onApplyFilters({
      search,
      status: resetFn === (() => setStatus("")) ? "" : status,
      service: resetFn === (() => setService("")) ? "" : service,
      network: resetFn === (() => setNetwork("")) ? "" : network,
      source: resetFn === (() => setSource("")) ? "" : source,
      dateFrom: resetFn === (() => setDateFrom("")) ? "" : dateFrom,
      dateTo: resetFn === (() => setDateTo("")) ? "" : dateTo,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <AtlasIcon
            name="search"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            placeholder="Search orders..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="direct">Direct</option>
          <option value="reseller">Reseller</option>
        </select>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="successful">Successful</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>

        <select
          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">All Services</option>
          <option value="MTN Data">MTN Data</option>
          <option value="Airtime">Airtime</option>
          <option value="ECG">ECG</option>
          <option value="DSTV">DSTV</option>
          <option value="GOtv">GOtv</option>
          <option value="WAEC">WAEC</option>
        </select>

        <div className="flex items-center gap-2">
          <label className="text-xs text-neutral-500">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 w-36"
          />
          <label className="text-xs text-neutral-500">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 w-36"
          />
        </div>

        <Button variant="outline" size="sm" onClick={handleApply}>
          Apply
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            >
              {filter.label}
              <button onClick={() => clearFilter(filter.reset)} className="ml-1 hover:text-danger-600">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}