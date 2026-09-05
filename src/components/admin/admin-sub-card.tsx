import { cn } from "@/lib/utils";

interface AdminSubCardProps {
  label: string;
  value: string | number;
  breakdown?: string;
  className?: string;
}

export function AdminSubCard({ label, value, breakdown, className }: AdminSubCardProps) {
  return (
    <div className={cn("rounded-md bg-neutral-50 p-3 dark:bg-neutral-800/50", className)}>
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value}</p>
      {breakdown && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{breakdown}</p>
      )}
    </div>
  );
}