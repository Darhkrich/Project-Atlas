import Link from "next/link";
import { AtlasContainer } from "./atlas-container";
import { AtlasLogo } from "./atlas-logo";

const footerGroups = [
  {
    title: "Products",
    links: [
      { label: "Services", href: "/services" },
      { label: "Airtime", href: "/services" },
      { label: "Data", href: "/services" },
      { label: "Electricity", href: "/services" },
      { label: "Results Checker", href: "/services" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help / Support", href: "/support" },
      { label: "Contact", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const bottomLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Support", href: "/support" },
];

export function AtlasFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <AtlasContainer>
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand area */}
            <div className="lg:col-span-2">
              <AtlasLogo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Trusted digital services — airtime, data, electricity, and
                results checking — delivered through a platform built on
                clarity and trust.
              </p>
            </div>

            {/* Navigation groups */}
            {footerGroups.map((group) => (
              <nav
                key={group.title}
                aria-label={group.title}
                className="text-sm"
              >
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {group.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-neutral-200 py-6 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
          <p className="text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} Atlas
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {bottomLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-neutral-600 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </AtlasContainer>
    </footer>
  );
}