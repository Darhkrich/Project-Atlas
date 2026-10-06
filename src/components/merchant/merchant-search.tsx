"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AtlasIcon } from "@/components/atlas/icons";

export function MerchantSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push("/merchant/products?q=" + encodeURIComponent(q));
  };

  return (
    <form onSubmit={handleSubmit} className="relative hidden sm:block">
      <label htmlFor="merchant-search" className="sr-only">
        Search products
      </label>
      <input
        id="merchant-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products"
        className="w-64 rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-9 pr-4 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
      />
      <AtlasIcon
        name="search"
        className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400"
      />
    </form>
  );
}