"use client";

import { useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasInput } from "@/components/atlas/Input";
import { AtlasIcon } from "@/components/atlas/icons";

export function ResellerSupport() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Help Center</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
          Support
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Get help with your reseller account, transactions and storefront.
        </p>
      </div>

      {/* Quick contact options */}
      <div className="grid gap-4 sm:grid-cols-3">
        <AtlasCard className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
            <AtlasIcon name="mail" className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">Email Support</h3>
          <p className="mt-1 text-sm text-neutral-500">support@atlas.com</p>
        </AtlasCard>
        <AtlasCard className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <AtlasIcon name="phone" className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">Phone Support</h3>
          <p className="mt-1 text-sm text-neutral-500">+233 24 000 0000</p>
        </AtlasCard>
        <AtlasCard className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <AtlasIcon name="chat" className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">Live Chat</h3>
          <p className="mt-1 text-sm text-neutral-500">Available 24/7</p>
        </AtlasCard>
      </div>

      {/* Contact form */}
      <AtlasCard>
        <h2 className="text-base font-semibold text-neutral-950 dark:text-white">Send us a message</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <AtlasInput label="Subject" placeholder="How can we help?" required />
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Describe your issue or question..."
              className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
              required
            />
          </div>
          <Button type="submit">Send Message</Button>
          {sent && <span className="ml-3 text-sm text-success-600">Message sent. We'll respond shortly.</span>}
        </form>
      </AtlasCard>
    </div>
  );
}