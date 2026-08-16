import Link from "next/link";

interface AtlasLogoProps {
  className?: string;
}

export function AtlasLogo({ className = "" }: AtlasLogoProps) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 ${className}`}
      aria-label="Atlas home"
    >
      <svg
        className="h-6 w-6 text-brand-800 dark:text-brand-300"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 3L21 20H3L12 3Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M8 16H16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-lg font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">
        ATLAS
      </span>
    </Link>
  );
}