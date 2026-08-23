"use client";

import { useState } from "react";
import { ResellerHeader } from "./reseller-header";
import { ResellerSidebar } from "./reseller-sidebar";
import { ResellerMobileNavigation } from "./reseller-mobile-navigation";

export function ResellerLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <ResellerHeader
        mobileNavOpen={mobileNavOpen}
        onMenuToggle={() => setMobileNavOpen((prev) => !prev)}
      />
      <div className="flex">
        <ResellerSidebar className="hidden w-64 shrink-0 lg:block" />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <ResellerMobileNavigation
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}