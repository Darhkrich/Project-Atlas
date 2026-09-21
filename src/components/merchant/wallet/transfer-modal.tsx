/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasModalShell } from "@/components/atlas/modal-shell";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { formatCurrency } from "@/lib/shared/format";
import type { MerchantWalletRecord } from "@/lib/merchant/types/wallet";

type WalletKind = "billing" | "main";

interface Props {
  open: boolean;
  billing: MerchantWalletRecord | null;
  main: MerchantWalletRecord | null;
  submitting: boolean;
  onSubmit: (input: {
    from: WalletKind;
    to: WalletKind;
    amount: number;
  }) => Promise<{ ok: boolean; error?: string }>;
  onClose: () => void;
}

export function TransferModal({
  open,
  billing,
  main,
  submitting,
  onSubmit,
  onClose,
}: Props) {
  const [from, setFrom] = useState<WalletKind>("main");
  const [to, setTo] = useState<WalletKind>("billing");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFrom("main");
    setTo("billing");
    setAmount("");
    setError(null);
    setDone(false);
  }, [open]);

  if (!billing || !main) return null;

  const parsed = Number(amount);
  const sourceBalance = from === "billing" ? billing.balance : main.balance;
  const targetBalance = to === "billing" ? billing.balance : main.balance;
  const valid =
    Number.isFinite(parsed) && parsed > 0 && parsed <= sourceBalance;

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = async () => {
    if (!valid) {
      setError("Enter an amount within the source wallet balance.");
      return;
    }
    const result = await onSubmit({ from, to, amount: parsed });
    if (result.ok) {
      setDone(true);
    } else {
      setError(result.error ?? "Transfer failed.");
    }
  };

  if (done) {
    return (
      <AtlasModalShell
        open={open}
        onClose={onClose}
        title="Transfer complete"
      >
        <div className="space-y-4 text-center">
          <p
            role="status"
            aria-live="polite"
            className="text-sm text-neutral-700 dark:text-neutral-300"
          >
            {formatCurrency(parsed)} moved from your {from} wallet to your{" "}
            {to} wallet. It is available immediately.
          </p>
          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </AtlasModalShell>
    );
  }

  return (
    <AtlasModalShell
      open={open}
      onClose={onClose}
      title="Transfer between wallets"
      description="Free and instant. Move money wherever it is needed."
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="transfer-from"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            From
          </label>
          <select
            id="transfer-from"
            value={from}
            onChange={(e) => {
              const next = e.target.value as WalletKind;
              setFrom(next);
              if (next === to) setTo(next === "billing" ? "main" : "billing");
              setError(null);
            }}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="main">Main wallet ({formatCurrency(main.balance)})</option>
            <option value="billing">
              Billing wallet ({formatCurrency(billing.balance)})
            </option>
          </select>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            className="rounded-full border border-neutral-300 p-2 text-neutral-500 transition-colors hover:border-brand-400 hover:text-brand-700 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-brand-600 dark:hover:text-brand-300"
            aria-label="Swap source and destination"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
            </svg>
          </button>
        </div>

        <div>
          <label
            htmlFor="transfer-to"
            className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400"
          >
            To
          </label>
          <select
            id="transfer-to"
            value={to}
            onChange={(e) => {
              const next = e.target.value as WalletKind;
              setTo(next);
              if (next === from) setFrom(next === "billing" ? "main" : "billing");
              setError(null);
            }}
            className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="billing">
              Billing wallet ({formatCurrency(billing.balance)})
            </option>
            <option value="main">Main wallet ({formatCurrency(main.balance)})</option>
          </select>
        </div>

        <AtlasInput
          label="Amount (GHS)"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError(null);
          }}
          error={error ?? undefined}
        />

        {valid && (
          <div className="rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                {from} wallet after
              </span>
              <span>{formatCurrency(sourceBalance - parsed)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">
                {to} wallet after
              </span>
              <span>{formatCurrency(targetBalance + parsed)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={!valid || submitting}
          >
            {submitting ? "Transferring" : "Transfer"}
          </Button>
        </div>
      </div>
    </AtlasModalShell>
  );
}