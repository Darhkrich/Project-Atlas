"use client";

import { useState } from "react";
import { MerchantHeader } from "./merchant-header";
import { MerchantSidebar } from "./merchant-sidebar";
import { MerchantMobileNav } from "./merchant-mobile-nav";

export function MerchantLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <MerchantHeader onMenuToggle={() => setMobileNavOpen(true)} />
      <div className="flex">
        <MerchantSidebar className="hidden w-64 shrink-0 lg:block sticky top-16 h-[calc(100vh-4rem)]" />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <MerchantMobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}