/* eslint-disable @typescript-eslint/no-unused-vars */
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle } from "@/lib/storefront/utils";

interface StorefrontTrustProps {
  config: StorefrontConfig;
  mode: "preview" | "public";
}

export function StorefrontTrust({ config, mode }: StorefrontTrustProps) {
  const brandingStyle = getBrandingStyle(config);

  return (
    <section className="bg-neutral-50 py-12">
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={brandingStyle}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              Instant
            </div>
            <p className="mt-1 text-sm text-neutral-600">Service delivery</p>
          </div>
          <div>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              Secure
            </div>
            <p className="mt-1 text-sm text-neutral-600">Payments</p>
          </div>
          <div>
            <div
              className="text-2xl font-bold"
              style={{ color: "var(--primary)" }}
            >
              24/7
            </div>
            <p className="mt-1 text-sm text-neutral-600">Support</p>
          </div>
        </div>
      </div>
    </section>
  );
}