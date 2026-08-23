/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { AtlasCard } from "@/components/atlas/card";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

const redemptionOptions = [
  { name: "Airtime", points: 100, reward: "GHS 5 Airtime", icon: "phone" as AtlasIconName },
  { name: "Data", points: 150, reward: "500MB Data Bundle", icon: "globe" as AtlasIconName },
  { name: "Electricity", points: 200, reward: "GHS 10 Electricity Token", icon: "zap" as AtlasIconName },
  { name: "Cable TV", points: 250, reward: "GHS 20 TV Subscription Credit", icon: "tv" as AtlasIconName },
];

export function ReferralsContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [referralLink, setReferralLink] = useState("https://atlas.com/referral/emmanuel123");
  const [copied, setCopied] = useState(false);

  const referralMessage = `Join me on Atlas and earn Atlas Points! Sign up with my link: ${referralLink}`;
  const encodedMessage = encodeURIComponent(referralMessage);
  const encodedLink = encodeURIComponent(referralLink);

  const shareOptions = [
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodedMessage}`,
      bgClass: "bg-[#25D366]",
      icon: <WhatsAppIcon className="h-6 w-6 text-white" />,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      bgClass: "bg-[#1877F2]",
      icon: <FacebookIcon className="h-6 w-6 text-white" />,
    },
    {
      name: "Twitter/X",
      href: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      bgClass: "bg-neutral-900 dark:bg-neutral-700",
      icon: <XIcon className="h-6 w-6 text-white" />,
    },
  ];

  const loadData = () => {
    setLoading(true);
    setError(false);
    setTimeout(() => {
      setPointsBalance(75);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AtlasSkeleton className="h-48 w-full" />
        <AtlasSkeleton className="h-24 w-full" />
        <AtlasSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return <AtlasErrorState onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-800 to-brand-600 p-6 text-white shadow-sm">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="text-2xl font-bold">Refer friends, earn Atlas Points</h3>
            <p className="mt-2 text-brand-100">
              Invite friends to Atlas and earn points. Redeem points for data,
              airtime, and other services.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="rounded-full bg-white/20 px-4 py-2 text-sm font-semibold">
                Points Balance: {pointsBalance}
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <p className="text-sm text-brand-100">Your Referral Link</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 rounded-md bg-white px-3 py-2 text-sm text-neutral-900"
              />
              <button
                onClick={handleCopy}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-brand-900"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share options */}
      <AtlasCard>
        <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Share your referral link
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center rounded-xl border border-neutral-200 p-4 transition-shadow hover:shadow-md dark:border-neutral-800"
            >
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${option.bgClass}`}>
                {option.icon}
              </div>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {option.name}
              </span>
            </a>
          ))}
          <button
            onClick={handleCopy}
            className="flex flex-col items-center rounded-xl border border-neutral-200 p-4 transition-shadow hover:shadow-md dark:border-neutral-800"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
              <AtlasIcon name="link" className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {copied ? "Copied!" : "Copy Link"}
            </span>
          </button>
        </div>
      </AtlasCard>

      {/* How it works */}
      <AtlasCard>
        <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          How it works
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { step: "1", title: "Share your link", desc: "Send your referral link to friends and family." },
            { step: "2", title: "They join Atlas", desc: "Your friend signs up using your link." },
            { step: "3", title: "Earn points", desc: "You receive 20 points when they sign up and 30 more after their first purchase." },
          ].map((item) => (
            <div key={item.step} className="rounded-lg border border-neutral-100 p-4 dark:border-neutral-800">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                {item.step}
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</h4>
              <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </AtlasCard>

      {/* Redemption */}
      <AtlasCard>
        <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Redeem your points
        </h3>
        <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
          Use your Atlas Points for everyday digital services.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {redemptionOptions.map((option) => (
            <div key={option.name} className="rounded-xl border border-neutral-200 p-4 text-center dark:border-neutral-800">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-300">
                <AtlasIcon name={option.icon} className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{option.name}</h4>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{option.reward}</p>
              <p className="mt-2 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {option.points} points
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
          Points are not cash and can only be redeemed for supported Atlas services.
        </p>
      </AtlasCard>

      {/* How to use your points */}
      <AtlasCard>
        <h3 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          How to use your points
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Atlas Points are automatically available as a payment method during
          checkout. Select “Atlas Points” to pay for supported services.
        </p>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          1 point = GHS 0.02. Points cannot be converted to cash or used for
          wallet funding/withdrawals.
        </p>
      </AtlasCard>
    </div>
  );
}

// Brand SVG Icons
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.47 1.34 4.99L2 22l5.19-1.36a9.93 9.93 0 0 0 4.85 1.24h.01c5.5 0 9.96-4.46 9.96-9.96S17.54 2 12.04 2zm5.83 14.2c-.25.7-1.45 1.34-2 1.42-.54.09-1.22.13-1.97-.12-.46-.15-1.05-.34-1.81-.67-3.19-1.38-5.27-4.59-5.43-4.8-.16-.21-1.3-1.73-1.3-3.3 0-1.57.82-2.34 1.11-2.66.29-.32.64-.4.85-.4.21 0 .43 0 .61.01.2.01.46-.08.72.55.25.63.86 2.1.94 2.25.07.15.12.33.02.53-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.32-.13.62.18.3.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.49 1.54.31.16.49.13.67-.08.18-.21.77-.9.97-1.21.2-.31.41-.26.69-.16.28.11 1.79.84 2.1.99.31.15.51.23.58.36.08.13.08.75-.17 1.45z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.45-4.92 8.45-9.94z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  );
}