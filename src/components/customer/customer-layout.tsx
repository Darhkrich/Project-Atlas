"use client";

import { useState } from "react";
import { CustomerHeader } from "./customer-header";
import { CustomerSidebar } from "./customer-sidebar";
import { CustomerContent } from "./customer-content";
import { CustomerMobileNavigation } from "./customer-mobile-navigation";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <CustomerHeader
        mobileNavOpen={mobileNavOpen}
        onMenuToggle={() => setMobileNavOpen((prev) => !prev)}
      />

      <div className="flex">
        <CustomerSidebar className="hidden w-64 shrink-0 lg:block" />
        <CustomerContent>
          {children}
        </CustomerContent>
      </div>

      <CustomerMobileNavigation
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}