/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

interface StorefrontMobileNavProps {
  open: boolean;
  onClose: () => void;
  config?: any; // not used, but kept for compatibility
}

export function StorefrontMobileNav({
  open,
  onClose,
  config,
}: StorefrontMobileNavProps) {
  if (!open) return null;

  const navLinks = [
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl p-6">
        <div className="flex justify-end mb-6">
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-900"
            aria-label="Close menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="space-y-3">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block w-full px-4 py-4 rounded-lg text-lg font-semibold text-neutral-800 hover:bg-neutral-100 text-center"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}