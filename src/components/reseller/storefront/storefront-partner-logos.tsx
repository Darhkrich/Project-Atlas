/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import type { StorefrontConfig } from "@/lib/storefront/types";
import { getBrandingStyle, getThemeClasses } from "@/lib/storefront/utils";

interface Partner {
  name: string;
  src: string;
  services: { label: string; serviceId: string; network?: string }[];
}

const partners: Partner[] = [
  {
    name: "MTN",
    src: "/mtn4.jpg",
    services: [
      { label: "Buy Airtime", serviceId: "airtime", network: "MTN" },
      { label: "Buy Data", serviceId: "data", network: "MTN" },
    ],
  },
  {
    name: "Telecel",
    src: "/telecel3.jpg",
    services: [
      { label: "Buy Airtime", serviceId: "airtime", network: "Telecel" },
      { label: "Buy Data", serviceId: "data", network: "Telecel" },
    ],
  },
  {
    name: "AirtelTigo",
    src: "/airteltigo2.jpg",
    services: [
      { label: "Buy Airtime", serviceId: "airtime", network: "AirtelTigo" },
      { label: "Buy Data", serviceId: "data", network: "AirtelTigo" },
    ],
  },
  {
    name: "DSTV",
    src: "/dstv1.jpg",
    services: [{ label: "Subscribe", serviceId: "cabletv", network: "DSTV" }],
  },
  {
    name: "GOtv",
    src: "/gotv4.jpeg",
    services: [{ label: "Subscribe", serviceId: "cabletv", network: "GOtv" }],
  },
  {
    name: "StarTimes",
    src: "/startimes3.jpg",
    services: [{ label: "Subscribe", serviceId: "cabletv", network: "StarTimes" }],
  },
  {
    name: "ECG",
    src: "/ECG1.webp",
    services: [{ label: "Buy Electricity", serviceId: "electricity", network: "ECG" }],
  },
  {
    name: "WAEC",
    src: "/waec3.jpg",
    services: [{ label: "Buy Exam Pin", serviceId: "exampins", network: "WAEC" }],
  },
];

interface StorefrontPartnerLogosProps {
  config: StorefrontConfig;
  onServiceClick: (serviceId: string, network?: string) => void;
}

export function StorefrontPartnerLogos({
  config,
  onServiceClick,
}: StorefrontPartnerLogosProps) {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const brandingStyle = getBrandingStyle(config);
  const theme = getThemeClasses(config.appearance.themeId);

  return (
    <section className={`py-12 ${theme.sectionBg}`}>
      <div className={`${theme.container} mx-auto px-4`} style={brandingStyle}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-900">Quick Access</h2>
          <p className="mt-2 text-neutral-600">Select a provider to get started</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {partners.map((partner) => (
            <button
              key={partner.name}
              onClick={() => setSelectedPartner(partner)}
              className="group flex flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="h-14 w-14 flex items-center justify-center overflow-hidden rounded-lg bg-neutral-50 dark:bg-neutral-700">
                <img
                  src={partner.src}
                  alt={`${partner.name} logo`}
                  className="h-10 w-auto object-contain"
                />
              </div>
              <span className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {partner.name}
              </span>
              <span className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Tap to buy
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Partner selection modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPartner(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
            <div className="text-center mb-6">
              <img
                src={selectedPartner.src}
                alt={selectedPartner.name}
                className="h-12 w-auto mx-auto object-contain"
              />
              <h3 className="mt-3 text-lg font-semibold text-neutral-900">
                {selectedPartner.name}
              </h3>
            </div>
            <div className="space-y-3">
              {selectedPartner.services.map((service) => (
                <button
                  key={service.label}
                  onClick={() => {
                    setSelectedPartner(null);
                    onServiceClick(service.serviceId, service.network);
                  }}
                  className="w-full py-3 px-4 rounded-xl border-2 border-neutral-200 text-neutral-800 font-medium hover:border-neutral-300 transition"
                  style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                >
                  {service.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedPartner(null)}
              className="mt-4 w-full text-sm text-neutral-500 hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}